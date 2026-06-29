export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    category,
    userProfile,
    queryText,
    base64Image,
    mimeType,
    compareText,
    model = 'gemini-2.5-flash'
  } = req.body;

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error_message: 'Gemini API Key is not configured on the server. Please add the VITE_GEMINI_API_KEY environment variable in Vercel settings.'
    });
  }

  // Build the prompt (manually interpolate profile)
  const profileString = JSON.stringify(userProfile || {});
  const prompt = `You are an expert AI Product Safety Assistant. The user has selected the category "${(category || 'food').toUpperCase()}".

CRITICAL RULES:
1. FIRST, identify what the product actually is from the label/query. If the image shows a FOOD product but the user selected "COSMETICS", analyze it as FOOD and set "detected_category" to "food".
2. NEVER hallucinate or invent a fake product name. Extract the REAL product name exactly as shown on the label/packaging.
3. Gemini is highly capable of analyzing blurry, low-quality, tilted, or misoriented images. Try your absolute best to recognize the product and extract its ingredients. Only set "error_message" if the image is completely blank or it is absolutely impossible to identify the product at all.
4. Extract REAL ingredients from the actual label. Do NOT fabricate ingredients.
5. Cross-reference the product against this user health profile: ${profileString}
6. Be strict and accurate with safety scoring — only flag real concerns based on real ingredients.

Return ONLY a raw JSON object — no markdown, no code blocks, no extra text. Use exactly this structure:
{
  "error_message": null,
  "detected_category": "food",
  "product_name": "Exact product name",
  "brand_name": "Brand Name",
  "extracted_ingredients": ["Ingredient 1", "Ingredient 2"],
  "safety_score": 8.0,
  "analysis_summary": "A brief factual summary.",
  "compatibility_flags": [
    { "flag_type": "Danger|Warning|Info", "message": "Reason" }
  ],
  "better_alternatives": [
    { "name": "Alternative Name", "desc": "Short description", "score": "9.5", "price": "$12.99", "tags": ["SAFE"] }
  ],
  "disclaimer": "For educational purposes only.",
  "cosmetics_details": {
    "acne_compatible": "Safe",
    "sensitive_compatible": "Safe",
    "harmful_ingredients_detected": []
  },
  "food_details": {
    "sugar_analysis": "Low",
    "fat_analysis": "Low",
    "sodium_analysis": "Low",
    "diabetes_friendly": true,
    "weight_loss_friendly": true,
    "harmful_additives": []
  },
  "medicine_details": {
    "strength": "500 mg",
    "uses": ["Use 1"],
    "side_effects": {
      "common": ["Nausea"],
      "serious": ["Severe weakness"]
    },
    "personalized_warnings": [],
    "drug_interactions": [],
    "safety_flags": {
      "allergy_risk": "None",
      "pregnancy_warning": "Safe",
      "kidney_liver_caution": "Safe",
      "overdose_risk": "Low"
    }
  }
}

IMPORTANT: Only populate the details section matching detected_category. Return ONLY the JSON object, nothing else.`;

  const parts = [{ text: prompt }];

  if (base64Image && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Image
      }
    });
  }

  if (queryText) {
    let queryMsg = `Product Query: ${queryText}`;
    if (compareText) {
      queryMsg += `\nAlso check interactions with: "${compareText}".`;
    }
    parts.push({ text: queryMsg });
  } else if (!base64Image) {
    let queryMsg = "Analyze this product based on generic data.";
    if (compareText) {
      queryMsg += `\nAlso check interactions with: "${compareText}".`;
    }
    parts.push({ text: queryMsg });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(candidateText.trim());
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error('Serverless Gemini Error:', error);
    return res.status(500).json({
      error_message: `Analysis failed: ${error.message || 'Unknown serverless error.'}`
    });
  }
}
