import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

// ─── Prompt (NO LangChain template variables — we interpolate manually) ───────
const buildPrompt = (category, profileString) => `You are an expert AI Product Safety Assistant. The user has selected the category "${category.toUpperCase()}".

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

// ─── Safe JSON extractor — strips markdown fences if Gemini wraps the output ──
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or non-string response from AI model.");
  }
  // Strip ```json ... ``` or ``` ... ``` wrappers
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // Find first { and last } to safely extract JSON
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No valid JSON object found in AI response.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ─── Main exported function ──────────────────────────────────────────────────
export const analyzeProductWithLangchain = async (
  category,
  userProfile,
  apiSettings,
  queryText = null,
  base64Image = null,
  mimeType = null,
  compareText = null
) => {
  const model = new ChatGoogleGenerativeAI({
    model: apiSettings.model || "gemini-2.5-flash",
    apiKey: apiSettings.apiKey,
    temperature: 0.1,
  });

  // Build the prompt with direct string interpolation — safe from LangChain
  // template engine issues with JSON braces in the profile object
  const profileString = JSON.stringify(userProfile || {});
  const prompt = buildPrompt(category || "food", profileString);

  if (apiSettings.verbose) {
    console.log("GUARDIAN PROMPT (first 500 chars):", prompt.slice(0, 500));
  }

  try {
    let response;

    if (base64Image && mimeType) {
      // Vision / image scan
      const message = new HumanMessage({
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      });
      response = await model.invoke([message]);
    } else {
      // Text search
      let queryMsg = queryText
        ? `Product Query: ${queryText}`
        : "Analyze this product based on generic data.";
      if (compareText) {
        queryMsg += `\nAlso check interactions with: "${compareText}".`;
      }
      const message = new HumanMessage({
        content: [
          { type: "text", text: prompt },
          { type: "text", text: queryMsg },
        ],
      });
      response = await model.invoke([message]);
    }

    const raw = response?.content;

    if (apiSettings.verbose) {
      console.log("GUARDIAN RESPONSE:", raw);
    }

    // Parse JSON safely — handles markdown-fenced and bare JSON responses
    const parsed = extractJSON(raw);
    return parsed;

  } catch (error) {
    console.error("Guardian AI Analysis Error:", error);
    // Return a structured error object instead of throwing, so the UI can
    // show a friendly toast instead of a raw JS alert
    return {
      error_message: `Analysis failed: ${error.message || "Unknown error. Check your API key and network connection."}`,
    };
  }
};
