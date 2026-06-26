import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

const promptTemplateString = `You are an expert AI Product Safety Assistant. The user has selected the category "{category}", but you MUST independently verify the actual product type from the image or query.

CRITICAL RULES:
1. FIRST, identify what the product actually is. If the image shows a FOOD product but the user selected "COSMETICS", you MUST analyze it as FOOD and set "detected_category" to "food".
2. NEVER hallucinate or invent a fake product name. Extract the REAL product name exactly as shown on the label/packaging.
3. If the image is too blurry, unreadable, or missing product details, DO NOT GUESS. Set "error_message" to a helpful instruction (e.g. "The image is too blurry to read. Please try again with a clearer photo of the ingredients label.") and leave the rest of the fields empty/default.
4. Extract REAL ingredients from the actual label. Do NOT fabricate ingredients.
5. Cross-reference the product against this user health profile: {profile}
6. Be strict and accurate with safety scoring — only flag real concerns based on real ingredients.

{format_instructions}`;

const formatInstructions = `Return the results strictly as a raw JSON object without any markdown formatting or extra text. Use exactly this structure:
{
  "error_message": "String (Only populate if image is blurry or unreadable. Otherwise omit or leave null)",
  "detected_category": "food | cosmetics | medicine",
  "product_name": "Exact product name from the label",
  "brand_name": "Brand/Manufacturer Name",
  "extracted_ingredients": ["Ingredient 1", "Ingredient 2"],
  "safety_score": 8.0,
  "analysis_summary": "A brief factual summary sentence.",
  "compatibility_flags": [
    { "flag_type": "Danger|Warning|Info", "message": "Reason for flag" }
  ],
  "better_alternatives": [
    { "name": "Alternative Name", "desc": "Short description", "score": "9.5", "price": "$12.99", "tags": ["SAFE", "COMPATIBLE"] }
  ],
  "disclaimer": "This is for educational purposes only...",
  "cosmetics_details": {
    "acne_compatible": "Safe | Avoid | Caution",
    "sensitive_compatible": "Safe | Avoid | Caution",
    "harmful_ingredients_detected": ["Ingredient name"]
  },
  "food_details": {
    "sugar_analysis": "High | Medium | Low",
    "fat_analysis": "High | Medium | Low",
    "sodium_analysis": "High | Medium | Low",
    "diabetes_friendly": true,
    "weight_loss_friendly": true,
    "harmful_additives": ["Additive name"]
  },
  "medicine_details": {
    "strength": "e.g. 500 mg",
    "uses": ["Use 1"],
    "side_effects": {
      "common": ["Nausea"],
      "serious": ["Severe weakness"]
    },
    "personalized_warnings": ["Warning 1"],
    "drug_interactions": [
      { "drug_a": "Metformin", "drug_b": "Ibuprofen", "severity": "Danger|Warning", "description": "Details..." }
    ],
    "safety_flags": {
      "allergy_risk": "None | High | Moderate",
      "pregnancy_warning": "Safe | Caution | Contraindicated",
      "kidney_liver_caution": "Safe | Caution | Contraindicated",
      "overdose_risk": "Low | High"
    }
  }
}

IMPORTANT: The "detected_category" field must reflect the ACTUAL product type you identified, which may differ from what the user selected. Only populate the details section that matches the detected_category (e.g., only populate food_details if detected_category is food).`;

export const analyzeProductWithLangchain = async (
  category, 
  userProfile, 
  apiSettings, 
  queryText = null,
  base64Image = null,
  mimeType = null,
  compareText = null
) => {
  // Initialize the Langchain Gemini model
  const model = new ChatGoogleGenerativeAI({
    modelName: apiSettings.model,
    apiKey: apiSettings.apiKey,
    temperature: 0.1, // Keep it deterministic for JSON output
  });

  const parser = new JsonOutputParser();
  
  const prompt = new PromptTemplate({
    template: promptTemplateString,
    inputVariables: ["category", "profile"],
    partialVariables: { format_instructions: formatInstructions }
  });

  const profileString = JSON.stringify(userProfile);
  const formattedPrompt = await prompt.format({
    category: category.toUpperCase(),
    profile: profileString,
  });

  if (apiSettings.verbose) {
    console.log("LANGCHAIN PROMPT:", formattedPrompt);
  }

  try {
    // If we have an image, we use the vision capabilities via multimodal messages
    let response;
    
    if (base64Image && mimeType) {
      const message = new HumanMessage({
        content: [
          { type: "text", text: formattedPrompt },
          { 
            type: "image_url", 
            image_url: {
                url: `data:${mimeType};base64,${base64Image}`
            } 
          }
        ]
      });
      response = await model.invoke([message]);
    } else {
      // Text only query
      let textQueryMessage = queryText ? `Product Query: ${queryText}` : "Analyze this product based on generic data.";
      if (compareText) {
         textQueryMessage += `\nAlso compare it with this secondary product/medicine for interactions: "${compareText}".`;
      }
      const message = new HumanMessage({
        content: [
          { type: "text", text: formattedPrompt },
          { type: "text", text: textQueryMessage }
        ]
      });
      response = await model.invoke([message]);
    }

    if (apiSettings.verbose) {
      console.log("LANGCHAIN RESPONSE:", response.content);
    }

    // Parse the output using Langchain's parser
    const parsedData = await parser.parse(response.content);
    return parsedData;

  } catch (error) {
    console.error("Langchain Analysis Error:", error);
    throw error;
  }
};
