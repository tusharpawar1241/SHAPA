export const mockDatabase = {
  food: [
    {
      id: "sample_oreo",
      product_name: "Oreo Cookies",
      brand_name: "Nabisco",
      extracted_ingredients: ["Unbleached Enriched Flour", "Sugar", "Palm Oil", "Canola Oil", "Cocoa", "High Fructose Corn Syrup", "Leavening", "Salt", "Soy Lecithin", "Vanillin", "Milk", "Gluten"],
      safety_score: 3.0,
      analysis_summary: "Oreo Cookies are evaluated as low safety for your profile due to high sugar and processed sweeteners. It contains Milk and Gluten which can trigger allergies.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Gluten (Allergy Conflict)" },
        { flag_type: "Danger", message: "Contains Milk (Dairy Allergy Conflict)" },
        { flag_type: "Warning", message: "High Sweeteners (Sugar restriction alert)" }
      ],
      food_details: {
        sugar_analysis: "High",
        fat_analysis: "High",
        sodium_analysis: "Medium",
        diabetes_friendly: false,
        weight_loss_friendly: false,
        harmful_additives: ["High Fructose Corn Syrup", "Vanillin"]
      },
      better_alternatives: [
        { name: "Organic Oats Cookies", desc: "100% whole grain oats cookies, sweetened with stevia.", score: "9.2", price: "$4.50", image: "/cereal_label.png", tags: ["DIABETES-SAFE", "LOW-SUGAR"] },
        { name: "Roasted Salted Makhana", desc: "Crispy roasted foxnuts, rich in protein and low calorie.", score: "9.8", price: "$3.00", image: "/cereal_label.png", tags: ["WEIGHT-LOSS", "ORGANIC"] }
      ],
      disclaimer: "Disclaimer: This AI analysis is for educational purposes only. Always check label details manually."
    },
    {
      id: "sample_cereal",
      product_name: "SuperSweet Cereal",
      brand_name: "MegaGrain Corp",
      extracted_ingredients: ["Whole Grain Wheat", "High Fructose Corn Syrup", "Sugar", "Salt", "Red Dye 40", "BHT", "Natural and Artificial Flavors", "Peanut Oil"],
      safety_score: 3.5,
      analysis_summary: "SuperSweet Cereal contains high fructose corn syrup and dyes. Furthermore, it contains peanut oil which is a severe risk for nut allergies.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Peanut Oil (Nut Allergy Conflict)" },
        { flag_type: "Warning", message: "Contains High Fructose Corn Syrup & Sugar" }
      ],
      food_details: {
        sugar_analysis: "High",
        fat_analysis: "Medium",
        sodium_analysis: "High",
        diabetes_friendly: false,
        weight_loss_friendly: false,
        harmful_additives: ["High Fructose Corn Syrup", "Red Dye 40", "BHT"]
      },
      better_alternatives: [
        { name: "Organic Rolled Oats", desc: "100% whole grain organic oats, sodium-free, unsweetened.", score: "9.8", price: "$4.99", image: "/cereal_label.png", tags: ["KETO", "VEGAN"] },
        { name: "Ancient Grain Chia Granola", desc: "Low glycemic, sweetened with organic maple syrup.", score: "8.5", price: "$6.49", image: "/cereal_label.png", tags: ["LOW-GI", "ORGANIC"] }
      ],
      disclaimer: "Disclaimer: This AI analysis is for educational purposes only."
    },
    {
      id: "sample_almond_milk",
      product_name: "Pure Almond Milk",
      brand_name: "EcoOrganics",
      extracted_ingredients: ["Filtered Water", "Almonds", "Organic Acacia Gum", "Sea Salt", "Natural Flavors"],
      safety_score: 9.0,
      analysis_summary: "Clean alternative with no added sugars. Warning: contains almonds (major allergen for nut allergy).",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Almonds (Nut Allergy conflict)" }
      ],
      food_details: {
        sugar_analysis: "Low",
        fat_analysis: "Low",
        sodium_analysis: "Low",
        diabetes_friendly: true,
        weight_loss_friendly: true,
        harmful_additives: []
      },
      better_alternatives: [
        { name: "Organic Coconut Milk", desc: "Pure coconut cream blended with filtered water.", score: "9.5", price: "$3.99", image: "/cereal_label.png", tags: ["NUT-FREE", "VEGAN"] }
      ],
      disclaimer: "Disclaimer: Always verify food labels directly."
    }
  ],
  cosmetics: [
    {
      id: "sample_cetaphil",
      product_name: "Cetaphil Gentle Cleanser",
      brand_name: "Galderma Laboratories",
      extracted_ingredients: ["Water", "Cetyl Alcohol", "Propylene Glycol", "Sodium Lauryl Sulfate", "Stearyl Alcohol", "Methylparaben", "Propylparaben", "Butylparaben"],
      safety_score: 7.0,
      analysis_summary: "Cetaphil Gentle Cleanser is a mild formula but contains Sodium Lauryl Sulfate (SLS) and parabens which can dry and irritate sensitive skin types.",
      compatibility_flags: [
        { flag_type: "Warning", message: "Contains Sodium Lauryl Sulfate (SLS surfactant)" },
        { flag_type: "Warning", message: "Contains Parabens (Methylparaben, Propylparaben)" }
      ],
      cosmetics_details: {
        acne_compatible: "Safe",
        sensitive_compatible: "Caution",
        harmful_ingredients_detected: ["Sodium Lauryl Sulfate", "Methylparaben", "Propylparaben", "Butylparaben"]
      },
      better_alternatives: [
        { name: "Centella Calming Moisturizer", desc: "Fragrance-free, paraben-free calming face cream.", score: "9.2", price: "$18.00", image: "/cosmetic_label.png", tags: ["ORGANIC", "SENSITIVE"] },
        { name: "Gentle Oat Hydrating Cleanser", desc: "Oat-based soap-free cleanser, paraben-free.", score: "9.6", price: "$12.00", image: "/cosmetic_label.png", tags: ["NATURAL", "HYDRATING"] }
      ],
      disclaimer: "Disclaimer: Cosmetic evaluations are based on scientific literature. Perform a patch test."
    },
    {
      id: "sample_glow_cream",
      product_name: "Ultra Glow Night Cream",
      brand_name: "LuxSkin Lab",
      extracted_ingredients: ["Water", "Glycerin", "Mineral Oil", "Methylparaben", "Propylparaben", "Sodium Lauryl Sulfate", "Fragrance", "Titanium Dioxide", "Shea Butter"],
      safety_score: 4.0,
      analysis_summary: "Contains parabens and Sodium Lauryl Sulfate which strip dry/sensitive skin. Added Fragrance and Mineral Oil present acne and allergy triggers.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Parabens on your avoid list" },
        { flag_type: "Warning", message: "Contains SLS (irritating for Sensitive skin)" }
      ],
      cosmetics_details: {
        acne_compatible: "Avoid",
        sensitive_compatible: "Avoid",
        harmful_ingredients_detected: ["Methylparaben", "Propylparaben", "Sodium Lauryl Sulfate", "Fragrance"]
      },
      better_alternatives: [
        { name: "Centella Calming Moisturizer", desc: "Fragrance-free, paraben-free calming face cream.", score: "9.2", price: "$18.00", image: "/cosmetic_label.png", tags: ["ORGANIC", "SENSITIVE"] },
        { name: "Organic Shea Body Butter", desc: "100% pure cold-pressed shea butter, no additives.", score: "9.8", price: "$14.50", image: "/cosmetic_label.png", tags: ["RAW", "VEGAN"] }
      ],
      disclaimer: "Disclaimer: Perform a patch test before regular use."
    }
  ],
  medicine: [
    {
      id: "sample_metformin",
      product_name: "Metformin 500 mg",
      brand_name: "Merck",
      strength: "500 mg",
      extracted_ingredients: ["Metformin Hydrochloride 500mg", "Povidone", "Magnesium Stearate", "Hypromellose"],
      safety_score: 8.5,
      analysis_summary: "Metformin 500 mg is used for glycemic control in Type 2 Diabetes. Highly compatible, but kidney patients must exercise caution due to lactic acidosis risk.",
      compatibility_flags: [],
      medicine_details: {
        strength: "500 mg",
        uses: ["Type 2 Diabetes Mellitus", "Blood sugar management", "Insulin sensitivity enhancement"],
        side_effects: {
          common: ["Nausea", "Diarrhea", "Abdominal bloating", "Metallic taste in mouth"],
          serious: ["Lactic Acidosis (severe weakness, breathing difficulty)", "Severe hypoglycemia", "Vitamin B-12 deficiency"]
        },
        personalized_warnings: [],
        drug_interactions: [],
        safety_flags: {
          allergy_risk: "None",
          pregnancy_warning: "Safe",
          kidney_liver_caution: "Safe",
          overdose_risk: "Low"
        }
      },
      better_alternatives: [
        { name: "Lifestyle & Carb Control Plan", desc: "Structured diet and resistance exercise under physician guidance.", score: "10.0", price: "Free", image: "/medicine_label.png", tags: ["DRUG-FREE"] },
        { name: "Standard Berberine Supplement", desc: "Natural alkaloid supporting glucose metabolism.", score: "7.8", price: "$19.95", image: "/medicine_label.png", tags: ["NATURAL"] }
      ],
      disclaimer: "Disclaimer: Strictly consult a physician before changing diabetes medications."
    },
    {
      id: "sample_ibuprofen",
      product_name: "Ibuprofen 400 mg",
      brand_name: "Advil",
      strength: "400 mg",
      extracted_ingredients: ["Ibuprofen 400mg", "Colloidal Silicon Dioxide", "Croscarmellose Sodium", "Stearic Acid"],
      safety_score: 7.0,
      analysis_summary: "NSAID pain reliever. Contraindicated in pregnancy, kidney disease, and interacts heavily with ACE inhibitors like Lisinopril.",
      compatibility_flags: [],
      medicine_details: {
        strength: "400 mg",
        uses: ["Mild to moderate pain relief", "Fever reduction", "Arthritis & inflammation management"],
        side_effects: {
          common: ["Heartburn", "Stomach upset", "Mild headache", "Nausea"],
          serious: ["Gastrointestinal bleeding/ulcers", "Kidney impairment", "Severe fluid retention"]
        },
        personalized_warnings: [],
        drug_interactions: [],
        safety_flags: {
          allergy_risk: "None",
          pregnancy_warning: "Caution",
          kidney_liver_caution: "Caution",
          overdose_risk: "Low"
        }
      },
      better_alternatives: [
        { name: "Pure Acetaminophen 500mg", desc: "Non-NSAID analgesic, safer for kidneys and hypertension.", score: "8.0", price: "$6.99", image: "/medicine_label.png", tags: ["BP-SAFE", "KIDNEY-SAFE"] },
        { name: "Peppermint Oil Roll-On", desc: "Natural cooling oil for topical tension relief.", score: "9.5", price: "$10.00", image: "/medicine_label.png", tags: ["NATURAL"] }
      ],
      disclaimer: "Disclaimer: Avoid prolonged NSAID use without monitoring."
    },
    {
      id: "sample_pain_reliever",
      product_name: "PainAway Extra Strengths",
      brand_name: "MediPharma Labs",
      strength: "500 mg",
      extracted_ingredients: ["Acetaminophen 250mg", "Aspirin 250mg", "Caffeine 65mg"],
      safety_score: 3.0,
      analysis_summary: "PainAway Extra contains Aspirin, which interacts with Lisinopril to risk renal dysfunction. Caffeine content can elevate blood pressure.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Drug Interaction: Aspirin + Lisinopril" },
        { flag_type: "Warning", message: "Condition Conflict: Caffeine + Hypertension" }
      ],
      medicine_details: {
        strength: "565mg total",
        uses: ["Severe migraine relief", "Toothache", "Muscle pain relief"],
        side_effects: {
          common: ["Nervousness", "Heartburn", "Stomach irritation", "Sleep troubles"],
          serious: ["Gastrointestinal bleeding", "Rye syndrome (children)", "Hypertensive crisis"]
        },
        personalized_warnings: [],
        drug_interactions: [],
        safety_flags: {
          allergy_risk: "None",
          pregnancy_warning: "Caution",
          kidney_liver_caution: "Caution",
          overdose_risk: "Low"
        }
      },
      better_alternatives: [
        { name: "Pure Acetaminophen 500mg", desc: "Analgesic with no aspirin or caffeine, safer for hypertension.", score: "8.0", price: "$6.99", image: "/medicine_label.png", tags: ["BP-SAFE"] },
        { name: "Aromatherapy Tension Roll-on", desc: "Natural cooling oils for drug-free relief.", score: "9.5", price: "$11.99", image: "/medicine_label.png", tags: ["DRUG-FREE"] }
      ],
      disclaimer: "Disclaimer: Strictly consult a board-certified physician before changing your medications."
    }
  ]
};
