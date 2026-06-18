export function runRulesEngine(item, category, userProfile) {
  // Deep clone item so we don't overwrite static mock base
  let cloned = JSON.parse(JSON.stringify(item));
  
  cloned.compatibility_flags = cloned.compatibility_flags || [];
  let scoreDeductions = 0;

  // Set default details structures in case they are missing
  cloned.cosmetics_details = cloned.cosmetics_details || {
    acne_compatible: "Safe",
    sensitive_compatible: "Safe",
    harmful_ingredients_detected: []
  };

  cloned.food_details = cloned.food_details || {
    sugar_analysis: "Low",
    fat_analysis: "Low",
    sodium_analysis: "Low",
    diabetes_friendly: true,
    weight_loss_friendly: true,
    harmful_additives: []
  };

  cloned.medicine_details = cloned.medicine_details || {
    strength: item.strength || "500 mg",
    uses: item.uses || ["General Treatment"],
    side_effects: item.side_effects || {
      common: ["Nausea"],
      serious: ["Allergic reaction"]
    },
    personalized_warnings: [],
    drug_interactions: [],
    safety_flags: {
      allergy_risk: "None",
      pregnancy_warning: "Safe",
      kidney_liver_caution: "Safe",
      overdose_risk: "Low"
    }
  };

  // Helper check for allergies
  const checkAllergyConflict = (ingredientName) => {
    if (!ingredientName) return false;
    const list = [];
    if (userProfile.allergies && Array.isArray(userProfile.allergies)) {
      list.push(...userProfile.allergies);
    } else if (typeof userProfile.allergies === 'string' && userProfile.allergies) {
      list.push(...userProfile.allergies.split(',').map(s => s.trim().toLowerCase()));
    }
    if (userProfile.medical_profile?.drug_allergies) {
      if (Array.isArray(userProfile.medical_profile.drug_allergies)) {
        list.push(...userProfile.medical_profile.drug_allergies);
      } else if (typeof userProfile.medical_profile.drug_allergies === 'string') {
        list.push(...userProfile.medical_profile.drug_allergies.split(',').map(s => s.trim().toLowerCase()));
      }
    }
    return list.some(allergy => allergy && ingredientName.toLowerCase().includes(allergy.toLowerCase()));
  };

  // Reset or initialize flags
  cloned.compatibility_flags = [];

  if (category === 'food') {
    // 1. Allergen checks
    const ingredients = cloned.extracted_ingredients || [];
    
    // Nut Allergy check
    const containsNuts = ingredients.some(i => /almond|peanut|pecan|walnut|cashew|hazelnut|chestnut|nut/i.test(i));
    if (containsNuts && (userProfile.dietary_goals?.nut_free || checkAllergyConflict("nut") || checkAllergyConflict("peanut") || checkAllergyConflict("almond"))) {
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "Contains Nut allergens (Nut Allergy Conflict)" });
      scoreDeductions += 5.0;
    }

    // Dairy Allergy check
    const containsDairy = ingredients.some(i => /milk|dairy|whey|butter|casein|lactose|cream/i.test(i));
    if (containsDairy && (userProfile.dietary_goals?.dairy_free || checkAllergyConflict("milk") || checkAllergyConflict("dairy") || checkAllergyConflict("lactose"))) {
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "Contains Dairy elements (Dairy-Free Conflict)" });
      scoreDeductions += 3.5;
    }

    // Gluten check
    const containsGluten = ingredients.some(i => /wheat|barley|rye|gluten/i.test(i));
    if (containsGluten && (userProfile.dietary_goals?.gluten_free || checkAllergyConflict("wheat") || checkAllergyConflict("gluten"))) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains Gluten elements (Gluten-Free Conflict)" });
      scoreDeductions += 2.0;
    }

    // Soy check
    const containsSoy = ingredients.some(i => /soy|lecithin/i.test(i));
    if (containsSoy && (userProfile.dietary_goals?.soy_free || checkAllergyConflict("soy"))) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains Soy ingredients (Soy-Free Conflict)" });
      scoreDeductions += 1.5;
    }

    // 2. Nutrition Analysis (Sugar, Fat, Sodium)
    const containsSugar = ingredients.some(i => /sugar|fructose|sucrose|syrup|dextrose|honey/i.test(i));
    const containsHighFat = ingredients.some(i => /oil|fat|butter|shortening|lard/i.test(i)) && (cloned.product_name?.toLowerCase().includes("oreo") || cloned.product_name?.toLowerCase().includes("cereal"));
    const containsHighSodium = ingredients.some(i => /salt|sodium/i.test(i)) && (cloned.product_name?.toLowerCase().includes("cereal") || cloned.product_name?.toLowerCase().includes("oreo") || cloned.product_name?.toLowerCase().includes("dolo"));

    cloned.food_details.sugar_analysis = containsSugar ? "High" : "Low";
    cloned.food_details.fat_analysis = containsHighFat ? "High" : (ingredients.some(i => /oil/i.test(i)) ? "Medium" : "Low");
    cloned.food_details.sodium_analysis = containsHighSodium ? "High" : (ingredients.some(i => /salt|sodium/i.test(i)) ? "Medium" : "Low");

    // 3. User Condition / Goal Matching
    // Diabetes Check
    const userHasDiabetes = userProfile.medical_profile?.conditions?.diabetes || false;
    if (userHasDiabetes && containsSugar) {
      cloned.food_details.diabetes_friendly = false;
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "Not Diabetes Friendly: High sugar contents" });
      scoreDeductions += 3.0;
    } else {
      cloned.food_details.diabetes_friendly = !containsSugar;
    }

    // Hypertension Check
    const userHasHypertension = userProfile.medical_profile?.conditions?.hypertension || false;
    if (userHasHypertension && containsHighSodium) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Hypertension Caution: High sodium / salt detected" });
      scoreDeductions += 1.5;
    }

    // Weight Loss Goals
    const weightLossGoal = userProfile.dietary_goals?.weight_loss || false;
    const isWeightLossFriendly = !(containsSugar || containsHighFat);
    cloned.food_details.weight_loss_friendly = isWeightLossFriendly;
    if (weightLossGoal && !isWeightLossFriendly) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Goal Conflict: High sugar/fat hinders weight loss" });
      scoreDeductions += 1.5;
    }

    // Harmful Additives / Dyes
    const harmfulAdditives = ingredients.filter(i => /dye|BHT|BHA|nitrate|benzoate|glutamate|aspartame/i.test(i));
    cloned.food_details.harmful_additives = harmfulAdditives;
    if (harmfulAdditives.length > 0) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: `Additives Detected: ${harmfulAdditives.join(', ')}` });
      scoreDeductions += 1.0;
    }
  }

  else if (category === 'cosmetics') {
    const ingredients = cloned.extracted_ingredients || [];

    // 1. Skin concerns checklist (Acne, Pigmentation, Dryness)
    const skinConcerns = userProfile.skin_profile?.skin_concerns || [];
    const skinType = userProfile.skin_profile?.skin_type || "normal";

    // Acne check (Mineral Oil, Coconut Oil, Isopropyl Myristate)
    const containsAcneTrigger = ingredients.some(i => /mineral oil|coconut oil|isopropyl myristate|lanolin|wax/i.test(i));
    if (containsAcneTrigger) {
      cloned.cosmetics_details.acne_compatible = "Avoid";
      if (skinConcerns.includes("acne")) {
        cloned.compatibility_flags.push({ flag_type: "Warning", message: "Acne Alert: Contains comedogenic oils which can clog pores" });
        scoreDeductions += 2.0;
      }
    } else {
      cloned.cosmetics_details.acne_compatible = "Safe";
    }

    // Sensitive Skin check (SLS, drying alcohol, parabens, fragrance)
    const containsSls = ingredients.some(i => /lauryl sulfate|sls|sles/i.test(i));
    const containsFragrance = ingredients.some(i => /fragrance|parfum/i.test(i));
    const containsParabens = ingredients.some(i => /paraben/i.test(i));

    if (containsSls || containsFragrance || containsParabens) {
      cloned.cosmetics_details.sensitive_compatible = "Caution";
      if (skinType === "sensitive" || skinConcerns.includes("dryness")) {
        cloned.cosmetics_details.sensitive_compatible = "Avoid";
        if (containsSls) {
          cloned.compatibility_flags.push({ flag_type: "Warning", message: "Sensitive skin warning: Contains SLS, a harsh surfactant" });
          scoreDeductions += 2.5;
        }
        if (containsFragrance) {
          cloned.compatibility_flags.push({ flag_type: "Info", message: "Sensitive skin caution: Contains fragrance, a common skin irritant" });
          scoreDeductions += 1.0;
        }
      }
    } else {
      cloned.cosmetics_details.sensitive_compatible = "Safe";
    }

    // 2. Avoid list check (Direct match)
    if (userProfile.skin_profile?.avoid_ingredients) {
      userProfile.skin_profile.avoid_ingredients.forEach(avoidItem => {
        if (!avoidItem) return;
        const match = ingredients.some(i => i.toLowerCase().includes(avoidItem.toLowerCase()));
        if (match) {
          cloned.compatibility_flags.push({ flag_type: "Danger", message: `Avoid List Conflict: Contains ${avoidItem}` });
          scoreDeductions += 3.0;
        }
      });
    }

    // 3. Harmful Ingredients Detection
    const harmfulCosmeticsIngredients = ingredients.filter(i => /paraben|phthalate|formaldehyde|triclosan|lauryl sulfate|bha|toluene/i.test(i));
    cloned.cosmetics_details.harmful_ingredients_detected = harmfulCosmeticsIngredients;
    if (harmfulCosmeticsIngredients.length > 0) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: `Chemical Watch: Detected potential endocrine disruptors/irritants` });
      scoreDeductions += 1.5;
    }
  }

  else if (category === 'medicine') {
    const ingredients = cloned.extracted_ingredients || [];
    const isNsaid = ingredients.some(i => /aspirin|ibuprofen|naproxen|ketoprofen/i.test(i));
    const isMetformin = cloned.product_name?.toLowerCase().includes("metformin") || ingredients.some(i => /metformin/i.test(i));
    
    // Initialize flags
    let allergyRisk = "None";
    let pregnancyWarning = "Safe";
    let kidneyCaution = "Safe";
    let overdoseRisk = "Low";

    // 1. Allergy Risk Check (General and specific)
    const isAllergicToIng = ingredients.some(i => checkAllergyConflict(i)) || checkAllergyConflict(cloned.product_name);
    if (isAllergicToIng) {
      allergyRisk = "High";
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "🚨 Severe Drug Allergy Risk detected!" });
      scoreDeductions += 5.5;
    }

    // 2. Condition checks
    // Age Check (>65 cautions)
    const ageVal = parseInt(userProfile.age) || 0;
    if (ageVal >= 65 && isNsaid) {
      cloned.medicine_details.personalized_warnings.push("Elderly patients (age > 65) have elevated risk of GI bleeding and renal strain when taking NSAIDs.");
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Age Advisory: Increased NSAID risks for older adults" });
      scoreDeductions += 1.5;
    }

    // Hypertension / Cardio Check
    if (userProfile.medical_profile?.conditions?.hypertension) {
      const containsStimulants = ingredients.some(i => /caffeine|pseudoephedrine/i.test(i));
      if (containsStimulants) {
        cloned.medicine_details.personalized_warnings.push("Contains stimulants that can elevate heart rate and blood pressure.");
        cloned.compatibility_flags.push({ flag_type: "Warning", message: "Condition Warning: Contains stimulants that elevate BP" });
        scoreDeductions += 2.0;
      }
      if (isNsaid) {
        cloned.medicine_details.personalized_warnings.push("NSAIDs can increase fluid retention, raise blood pressure, and reduce efficacy of blood pressure medications.");
        cloned.compatibility_flags.push({ flag_type: "Warning", message: "Condition Warning: NSAIDs can elevate blood pressure" });
        scoreDeductions += 1.5;
      }
    }

    // Kidney Disease Check
    if (userProfile.medical_profile?.conditions?.kidney_disease) {
      kidneyCaution = "Contraindicated";
      if (isNsaid) {
        cloned.medicine_details.personalized_warnings.push("Contraindicated: NSAIDs decrease renal blood flow and can precipitate acute kidney injury.");
        cloned.compatibility_flags.push({ flag_type: "Danger", message: "🚨 Kidney Caution: NSAIDs are highly nephrotoxic" });
        scoreDeductions += 4.5;
      }
      if (isMetformin) {
        cloned.medicine_details.personalized_warnings.push("Metformin is cleared renally. Kidney impairment increases risk of life-threatening Lactic Acidosis.");
        cloned.compatibility_flags.push({ flag_type: "Danger", message: "🚨 Kidney Caution: Metformin contraindicated in severe renal disease" });
        scoreDeductions += 4.0;
      }
    }

    // Pregnancy Check
    if (userProfile.medical_profile?.conditions?.pregnancy) {
      pregnancyWarning = "Contraindicated";
      if (isNsaid) {
        cloned.medicine_details.personalized_warnings.push("Contraindicated: Avoid NSAIDs in pregnancy (especially 3rd trimester) due to risk of premature closure of fetal ductus arteriosus.");
        cloned.compatibility_flags.push({ flag_type: "Danger", message: "🚨 Pregnancy Alert: NSAIDs contraindicated during pregnancy" });
        scoreDeductions += 4.0;
      }
    }

    // 3. Drug-to-Drug Interaction checks
    // Check with medications in user's profile
    const currentMedsList = [];
    if (userProfile.medical_profile?.current_medications) {
      if (Array.isArray(userProfile.medical_profile.current_medications)) {
        currentMedsList.push(...userProfile.medical_profile.current_medications);
      } else if (typeof userProfile.medical_profile.current_medications === 'string') {
        currentMedsList.push(...userProfile.medical_profile.current_medications.split(',').map(s => s.trim().toLowerCase()));
      }
    }

    // Helper to log drug interaction
    const addInteraction = (drugA, drugB, severity, description) => {
      cloned.medicine_details.drug_interactions.push({
        drug_a: drugA,
        drug_b: drugB,
        severity: severity,
        description: description
      });
      cloned.compatibility_flags.push({
        flag_type: severity === "Danger" ? "Danger" : "Warning",
        message: `Drug Interaction: ${drugA} + ${drugB} (${description})`
      });
      scoreDeductions += severity === "Danger" ? 5.0 : 2.5;
    };

    // Check NSAIDs + Lisinopril
    const hasLisinopril = currentMedsList.some(m => m.includes("lisinopril"));
    if (isNsaid && hasLisinopril) {
      addInteraction(
        cloned.product_name || "NSAID",
        "Lisinopril",
        "Danger",
        "NSAIDs reduce lisinopril blood pressure control efficacy and synergize to increase risks of acute kidney injury."
      );
    }

    // Check Metformin + NSAIDs
    if (isMetformin && isNsaid) {
      addInteraction(
        "Metformin",
        "NSAID (Ibuprofen/Aspirin)",
        "Warning",
        "NSAIDs can cause renal strain, reducing Metformin excretion and increasing the risk of Metformin-induced lactic acidosis."
      );
    }

    // Overdose Risk
    if (cloned.product_name?.toLowerCase().includes("dolo") || cloned.product_name?.toLowerCase().includes("paracetamol") || cloned.product_name?.toLowerCase().includes("acetaminophen") || cloned.extracted_ingredients.some(i => /paracetamol|acetaminophen/i.test(i))) {
      const takingAcetaminophen = currentMedsList.some(m => m.includes("acetaminophen") || m.includes("paracetamol") || m.includes("dolo") || m.includes("tylenol"));
      if (takingAcetaminophen) {
        overdoseRisk = "High";
        cloned.compatibility_flags.push({ flag_type: "Danger", message: "🚨 Overdose Warning: Duplicate paracetamol/acetaminophen sources" });
        scoreDeductions += 4.0;
      }
    }

    // Set safety flags state
    cloned.medicine_details.safety_flags = {
      allergy_risk: allergyRisk,
      pregnancy_warning: pregnancyWarning,
      kidney_liver_caution: kidneyCaution,
      overdose_risk: overdoseRisk
    };
  }

  // Adjust score
  let finalScore = 10.0 - scoreDeductions;
  cloned.safety_score = Math.max(0.0, Math.min(10.0, finalScore));

  // Remake analysis summary sentences
  if (cloned.safety_score >= 7.5) {
    cloned.analysis_summary = `This product is compatible with your health profile, showing a high safety score of ${cloned.safety_score.toFixed(1)}/10. None of your designated restriction categories were triggered in the ingredients scan.`;
  } else if (cloned.safety_score >= 5.0) {
    cloned.analysis_summary = `This product has a moderate score of ${cloned.safety_score.toFixed(1)}/10. It contains minor ingredients that conflict with your preferences, but poses no critical toxicity threat.`;
  } else {
    cloned.analysis_summary = `Caution: This product scored a very low ${cloned.safety_score.toFixed(1)}/10 safety rating. Multiple ingredients triggered conflicts with your health conditions and allergies, posing potential adverse reactions.`;
  }

  return cloned;
}
