export const mockDatabase = {
  food: [
    {
      id: "sample_cereal",
      product_name: "SuperSweet Cereal",
      brand_name: "MegaGrain Corp",
      extracted_ingredients: ["Whole Grain Wheat", "High Fructose Corn Syrup", "Sugar", "Salt", "Red Dye 40", "BHT", "Natural and Artificial Flavors", "Peanut Oil"],
      safety_score: 3.5,
      analysis_summary: "SuperSweet Cereal is evaluated as unsafe for your profile due to high amounts of processed sugars and chemical dyes. Furthermore, it contains Peanut Oil which presents a severe allergen risk for your nut allergy.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Peanut Oil (Nut Allergy Conflict)" },
        { flag_type: "Warning", message: "Contains High Fructose Corn Syrup & Sugar (Low Sugar Goal Conflict)" },
        { flag_type: "Info", message: "Gluten-Free check failed (Contains Whole Grain Wheat)" }
      ],
      better_alternatives: [
        { name: "Organic Rolled Oats", desc: "100% whole grain organic oats, sodium-free, unsweetened.", score: "9.8", price: "$4.99", image: "/cereal_label.png", tags: ["KETO", "VEGAN"] },
        { name: "Ancient Grain Chia Granola", desc: "Low glycemic, sweetened with organic maple syrup.", score: "8.5", price: "$6.49", image: "/cereal_label.png", tags: ["LOW-GI", "ORGANIC"] }
      ],
      disclaimer: "Disclaimer: This AI analysis is for educational purposes only. Always check label details manually."
    },
    {
      id: "sample_almond_milk",
      product_name: "Pure Almond Milk",
      brand_name: "EcoOrganics",
      extracted_ingredients: ["Filtered Water", "Almonds", "Organic Acacia Gum", "Sea Salt", "Natural Flavors"],
      safety_score: 9.0,
      analysis_summary: "EcoOrganics Pure Almond Milk is a clean, organic alternative with no added sugars. Note that it contains almonds, which is a major allergen if you have a nut allergy.",
      compatibility_flags: [],
      better_alternatives: [
        { name: "Organic Coconut Milk", desc: "Pure coconut cream blended with filtered water.", score: "9.5", price: "$3.99", image: "/cereal_label.png", tags: ["NUT-FREE", "VEGAN"] }
      ],
      disclaimer: "Disclaimer: This evaluation is for informational purposes. Consult a dietician for specific health advice."
    }
  ],
  cosmetics: [
    {
      id: "sample_glow_cream",
      product_name: "Ultra Glow Night Cream",
      brand_name: "LuxSkin Lab",
      extracted_ingredients: ["Water", "Glycerin", "Mineral Oil", "Methylparaben", "Propylparaben", "Sodium Lauryl Sulfate", "Fragrance", "Titanium Dioxide", "Shea Butter"],
      safety_score: 4.0,
      analysis_summary: "Ultra Glow Night Cream contains endocrine-disrupting parabens and Sodium Lauryl Sulfate, which can strip sensitive skin. Fragrance added may cause allergic flare-ups.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Contains Parabens (Methylparaben, Propylparaben) on your avoid list" },
        { flag_type: "Warning", message: "Contains Sodium Lauryl Sulfate (irritating for Sensitive Skin)" },
        { flag_type: "Info", message: "Contains Fragrance (potential allergen trigger)" }
      ],
      better_alternatives: [
        { name: "Centella Calming Moisturizer", desc: "Fragrance-free, paraben-free calming face cream.", score: "9.2", price: "$18.00", image: "/cosmetic_label.png", tags: ["ORGANIC", "SENSITIVE"] },
        { name: "Organic Shea Body Butter", desc: "100% pure cold-pressed shea butter, no additives.", score: "9.8", price: "$14.50", image: "/cosmetic_label.png", tags: ["RAW", "VEGAN"] }
      ],
      disclaimer: "Disclaimer: Cosmetic evaluations are based on scientific literature. Perform a patch test before regular use."
    }
  ],
  medicine: [
    {
      id: "sample_pain_reliever",
      product_name: "PainAway Extra Strengths",
      brand_name: "MediPharma Labs",
      extracted_ingredients: ["Acetaminophen 250mg", "Aspirin 250mg", "Caffeine 65mg"],
      safety_score: 3.0,
      analysis_summary: "PainAway Extra contains Aspirin, which may decrease the efficacy of your lisinopril and risk renal dysfunction. The added Caffeine can also negatively elevate blood pressure.",
      compatibility_flags: [
        { flag_type: "Danger", message: "Drug Interaction: Aspirin + Lisinopril (reduces BP control & increases kidney risk)" },
        { flag_type: "Warning", message: "Condition Conflict: Caffeine + Hypertension (can elevate blood pressure)" },
        { flag_type: "Info", message: "Contains Aspirin (avoid if active bleeding or kidney disease)" }
      ],
      better_alternatives: [
        { name: "Pure Acetaminophen 500mg", desc: "Analgesic with no aspirin or caffeine, safer for hypertension.", score: "8.0", price: "$6.99", image: "/medicine_label.png", tags: ["BP-SAFE"] },
        { name: "Aromatherapy Tension Roll-on", desc: "Natural peppermint and lavender cooling oils for drug-free relief.", score: "9.5", price: "$11.99", image: "/medicine_label.png", tags: ["DRUG-FREE"] }
      ],
      disclaimer: "Disclaimer: Strictly consult a board-certified physician or cardiologist before changing your medications."
    }
  ]
};
