export function runRulesEngine(item, category, userProfile) {
  // Deep clone item so we don't overwrite static mock base
  let cloned = JSON.parse(JSON.stringify(item));
  
  cloned.compatibility_flags = [];
  let scoreDeductions = 0;

  if (category === 'food') {
    // Allergen: Nuts
    const containsNuts = cloned.extracted_ingredients.some(i => /almond|peanut|pecan|walnut|cashew|hazelnut|chestnut|nut/i.test(i));
    if (containsNuts && userProfile.dietary_goals.nut_free) {
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "Contains Nut allergens (Profile Nut-Free conflict)" });
      scoreDeductions += 5.0;
    }
    
    // Allergen: Dairy
    const containsDairy = cloned.extracted_ingredients.some(i => /milk|dairy|whey|butter|casein|lactose|cream/i.test(i));
    if (containsDairy && userProfile.dietary_goals.dairy_free) {
      cloned.compatibility_flags.push({ flag_type: "Danger", message: "Contains Dairy ingredients (Profile Dairy-Free conflict)" });
      scoreDeductions += 3.0;
    }

    // Allergen: Gluten
    const containsGluten = cloned.extracted_ingredients.some(i => /wheat|barley|rye|gluten/i.test(i));
    if (containsGluten && userProfile.dietary_goals.gluten_free) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains Gluten elements (Profile Gluten-Free conflict)" });
      scoreDeductions += 2.0;
    }

    // Sugar Check
    const containsSugar = cloned.extracted_ingredients.some(i => /sugar|fructose|sucrose|syrup|dextrose/i.test(i));
    if (containsSugar && userProfile.dietary_goals.low_sugar) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "High added sweeteners (Sugar restriction alert)" });
      scoreDeductions += 1.5;
    }
  } 
  
  else if (category === 'cosmetics') {
    // Skin type check (Sodium lauryl sulfate / Alcohol are bad for dry/sensitive)
    const containsSls = cloned.extracted_ingredients.some(i => /lauryl sulfate|sls|sles/i.test(i));
    if (containsSls && (userProfile.skin_profile.skin_type === 'sensitive' || userProfile.skin_profile.skin_type === 'dry')) {
      cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains sulfates which strip moisture from Dry/Sensitive skin." });
      scoreDeductions += 2.5;
    }

    // Avoid list check
    if (userProfile.skin_profile.avoid_ingredients) {
      userProfile.skin_profile.avoid_ingredients.forEach(avoidItem => {
        const match = cloned.extracted_ingredients.some(i => i.toLowerCase().includes(avoidItem.toLowerCase()));
        if (match) {
          cloned.compatibility_flags.push({ flag_type: "Danger", message: `Contains ${avoidItem} which is on your avoid list.` });
          scoreDeductions += 3.0;
        }
      });
    }

    // Fragrance check
    const containsFragrance = cloned.extracted_ingredients.some(i => /fragrance|parfum/i.test(i));
    if (containsFragrance && userProfile.skin_profile.skin_type === 'sensitive') {
      cloned.compatibility_flags.push({ flag_type: "Info", message: "Contains added fragrance which can irritate sensitive skin types." });
      scoreDeductions += 1.0;
    }
  } 
  
  else if (category === 'medicine') {
    // Hypertension
    if (userProfile.medical_profile.conditions.hypertension) {
      const containsCaffeine = cloned.extracted_ingredients.some(i => /caffeine/i.test(i));
      if (containsCaffeine) {
        cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains Caffeine which increases cardiac load (Hypertension Risk)." });
        scoreDeductions += 2.0;
      }

      // Check NSAIDs (Aspirin, Ibuprofen, Naproxen)
      const containsNsaid = cloned.extracted_ingredients.some(i => /aspirin|ibuprofen|naproxen/i.test(i));
      if (containsNsaid) {
        // Lisinopril interaction
        const takingLisinopril = userProfile.medical_profile.current_medications.some(m => m.toLowerCase().includes("lisinopril"));
        if (takingLisinopril) {
          cloned.compatibility_flags.push({ flag_type: "Danger", message: "Drug Interaction: NSAIDs reduce efficacy of ACE inhibitors (Lisinopril) and increase renal strain." });
          scoreDeductions += 5.0;
        } else {
          cloned.compatibility_flags.push({ flag_type: "Warning", message: "Contains NSAIDs which can raise BP (Hypertension check)." });
          scoreDeductions += 1.5;
        }
      }
    }
  }

  // Adjust score
  let finalScore = 10.0 - scoreDeductions;
  cloned.safety_score = Math.max(0.0, Math.min(10.0, finalScore));

  // Remake analysis summary sentences
  if (cloned.safety_score >= 8.0) {
    cloned.analysis_summary = `This product is compatible with your health profile, showing a high safety score of ${cloned.safety_score.toFixed(1)}/10. None of your designated restriction categories were triggered in the ingredients scan.`;
  } else if (cloned.safety_score >= 5.0) {
    cloned.analysis_summary = `This product has a moderate score of ${cloned.safety_score.toFixed(1)}/10. It contains minor ingredients that conflict with your preferences, but poses no critical toxicity threat.`;
  } else {
    cloned.analysis_summary = `Caution: This product scored a very low ${cloned.safety_score.toFixed(1)}/10 safety rating. Multiple ingredients triggered conflicts with your health conditions and allergies, posing potential adverse reactions.`;
  }

  return cloned;
}
