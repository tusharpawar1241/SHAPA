import { useState, useEffect } from 'react';

export default function ResultsView({ resultsData, activeCategory, switchView }) {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [scoreCount, setScoreCount] = useState(0);

  // Sync / Reset score count when resultsData changes during render phase
  const [prevResultsData, setPrevResultsData] = useState(resultsData);
  if (resultsData !== prevResultsData) {
    setPrevResultsData(resultsData);
    setScoreCount(0);
  }

  // Animates the score counting up on enter
  useEffect(() => {
    if (resultsData && resultsData.safety_score !== undefined) {
      const target = parseFloat(resultsData.safety_score) || 0;
      let count = 0;
      const duration = 1000; // 1 second
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          setScoreCount(target);
          clearInterval(timer);
        } else {
          setScoreCount(count);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [resultsData]);

  if (!resultsData) return null;

  const score = parseFloat(resultsData.safety_score) || 0;
  
  // Calculate SVG circular path offsets (circumference is 2 * pi * r = 502.4)
  const circumference = 502.4;
  const strokeDashoffset = circumference - (circumference * (scoreCount / 10));

  let scoreColorClass = "text-error";
  let ringColorClass = "stroke-error";
  let statusBadgeClass = "bg-error-container text-on-error-container";
  let statusBadgeText = "Critical Warning";
  let borderClass = "border-error/10";
  let iconName = "dangerous";

  if (score >= 7.5) {
    scoreColorClass = "text-primary";
    ringColorClass = "stroke-primary";
    statusBadgeClass = "bg-primary/10 text-primary";
    statusBadgeText = "Safe Product";
    borderClass = "border-primary/10";
    iconName = "check_circle";
  } else if (score >= 5.0) {
    scoreColorClass = "text-secondary";
    ringColorClass = "stroke-secondary";
    statusBadgeClass = "bg-secondary-container/10 text-secondary";
    statusBadgeText = "Moderate Fit";
    borderClass = "border-secondary/10";
    iconName = "gpp_maybe";
  }

  const toggleAccordion = (index) => {
    if (activeAccordion === index) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(index);
    }
  };

  const getIngredientDetails = (ing) => {
    let explanation = `This ingredient is recognized as standard. No safety warnings have been flagged for your health configuration.`;
    let impact = "None";
    let evidence = "Standard ingredient";
    let hasWarning = false;

    // Check if ingredient matches avoid keywords
    const isAvoided = resultsData.compatibility_flags && resultsData.compatibility_flags.some(f => f.message.toLowerCase().includes(ing.toLowerCase()));
    const isChemical = /paraben|sulfate|fructose|dye|BHT|caffeine|aspirin|BHA|phthalate/i.test(ing);
    
    if (isAvoided || isChemical) {
      hasWarning = true;
    }
    
    if (ing.toLowerCase().includes("fructose")) {
      explanation = "High Fructose Corn Syrup is a highly refined sweetener linked to insulin spikes, inflammatory gut response, and fatty liver build-up.";
      impact = "Metabolic Stress";
      evidence = "Clinical Consensus";
    } else if (ing.toLowerCase().includes("peanut")) {
      explanation = "Peanut Oil contains trace proteins that can trigger anaphylaxis in patients with diagnosed peanut allergies.";
      impact = "Anaphylactic Shock";
      evidence = "FDA Mandated Alert";
    } else if (ing.toLowerCase().includes("almond")) {
      explanation = "Almond milk contains tree nuts, which can trigger severe allergic responses in patients with nut allergies.";
      impact = "Allergen Hazard";
      evidence = "Allergen Warning";
    } else if (ing.toLowerCase().includes("milk") || ing.toLowerCase().includes("lactose")) {
      explanation = "Contains dairy/milk elements, which can cause severe digestive distress or allergic reactions in lactose intolerant/dairy-allergic patients.";
      impact = "Digestive Distress / Allergy";
      evidence = "Allergen Warning";
    } else if (ing.toLowerCase().includes("paraben")) {
      explanation = "Parabens act as weak estrogen mimics and endocrine disruptors. Associated with hormonal imbalances and cosmetic contact dermatitis.";
      impact = "Hormonal Mimicry";
      evidence = "EU Cosmetic Watchlist";
    } else if (ing.toLowerCase().includes("sulfate") || ing.toLowerCase().includes("lauryl")) {
      explanation = "Sodium Lauryl Sulfate is a harsh surfactant. Removes protective oils, leading to severe barrier damage and skin irritation.";
      impact = "Epidermal Dryness";
      evidence = "Dermatologist Flag";
    } else if (ing.toLowerCase().includes("aspirin") || ing.toLowerCase().includes("ibuprofen") || ing.toLowerCase().includes("nsaid")) {
      explanation = "NSAID pain reliever. Interacts negatively with ACE inhibitors like Lisinopril and causes renal strain or acute kidney injury.";
      impact = "Renal Strain / BP Elevation";
      evidence = "Clinical Drug Interaction";
    } else if (ing.toLowerCase().includes("caffeine")) {
      explanation = "Caffeine is a central nervous system stimulant. Triggers vasoconstriction, elevating systolic and diastolic blood pressure.";
      impact = "Vascular Tension";
      evidence = "AHA Advisory Warning";
    } else if (ing.toLowerCase().includes("dye") || ing.toLowerCase().includes("red 40")) {
      explanation = "Synthetic petroleum-based dye. Banned or limited in foods in several regions due to links to hyperactive child behaviors.";
      impact = "Behavioral Alert";
      evidence = "WHO Watchlist";
    } else if (ing.toLowerCase().includes("bht") || ing.toLowerCase().includes("bha")) {
      explanation = "Butylated hydroxytoluene (BHT) is a preservative linked to potential skin allergies and suspected endocrine concerns in animal studies.";
      impact = "Chemical Preservative";
      evidence = "Scientific Watchlist";
    }

    return { explanation, impact, evidence, hasWarning };
  };

  // Helper values for categories
  const cosmetics = resultsData.cosmetics_details || {
    acne_compatible: "Safe",
    sensitive_compatible: "Safe",
    harmful_ingredients_detected: []
  };

  const food = resultsData.food_details || {
    sugar_analysis: "Low",
    fat_analysis: "Low",
    sodium_analysis: "Low",
    diabetes_friendly: true,
    weight_loss_friendly: true,
    harmful_additives: []
  };

  const medicine = resultsData.medicine_details || {
    strength: resultsData.strength || "500 mg",
    uses: resultsData.uses || ["General Treatment"],
    side_effects: {
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

  return (
    <div className="animate-[fadeIn_0.4s_ease] pb-12">
      {/* Results Title Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 font-bold text-[10px] rounded-full px-3 py-0.5 bg-surface-container-high text-on-surface-variant uppercase tracking-wider mb-1.5">
            {activeCategory === 'food' ? '🍎 Food' : activeCategory === 'medicine' ? '💊 Medicine' : '🧪 Cosmetics'} Guardian
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface leading-tight" id="results-product-name">
            {resultsData.product_name || "Unknown Product"}
          </h2>
          <p className="text-sm text-on-surface-variant" id="results-brand-name">
            {resultsData.brand_name || "Unknown Brand"}
          </p>
        </div>
        
        <div className="flex gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => switchView('scan')}
            className="flex-1 md:flex-none border border-outline px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors inline-flex items-center justify-center gap-1.5 bg-transparent text-on-surface outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Scan Another</span>
          </button>
          <button 
            onClick={() => alert("Report shared successfully")}
            className="flex-1 md:flex-none bg-primary border-none text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column: Score and Compatibility */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Safety Score Ring Widget */}
          <div className={`bg-surface-container-lowest rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden border border-t-4 border-t-solid border-t-error ${borderClass} shadow-sm`}>
            <div className="flex justify-between items-center w-full mb-6">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">AI Safety Score</span>
              <span className={`material-symbols-outlined ${scoreColorClass}`}>{iconName}</span>
            </div>
            
            <div className="relative w-44 h-44 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                <circle className="fill-transparent stroke-surface-container-high stroke-[10px]" cx="90" cy="90" r="80"></circle>
                <circle 
                  className={`fill-transparent stroke-[12px] stroke-linecap-round ${ringColorClass}`} 
                  cx="90" 
                  cy="90" 
                  r="80"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset
                  }}
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-[52px] font-extrabold leading-none ${scoreColorClass}`}>
                  {scoreCount.toFixed(1)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold mt-1">OF 10</span>
              </div>
            </div>

            <div className={`status-badge-capsule px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${statusBadgeClass}`}>
              {statusBadgeText}
            </div>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              {resultsData.analysis_summary || "Safety analysis complete."}
            </p>

            <div className="w-full flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant">Safety Margin</span>
                <span className={`font-bold ${scoreColorClass}`}>{Math.round(scoreCount * 10)}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 7.5 ? 'bg-primary' : score < 5.0 ? 'bg-error' : 'bg-secondary'
                  }`} 
                  style={{ width: `${score * 10}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Compatibility Details List */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm">
            <h4 className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-4">
              Profile Compatibility
            </h4>
            <div className="flex flex-wrap gap-2">
              {resultsData.compatibility_flags && resultsData.compatibility_flags.length > 0 ? (
                resultsData.compatibility_flags.map((flag, idx) => {
                  const isDanger = flag.flag_type?.toLowerCase() === "danger" || flag.flag_type?.toLowerCase() === "critical";
                  const flagIcon = isDanger ? "dangerous" : "warning";
                  return (
                    <span 
                      key={idx}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                        isDanger 
                          ? 'bg-error-container text-on-error-container border border-error/20' 
                          : 'bg-secondary-container/10 text-secondary border border-secondary/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{flagIcon}</span>
                      {flag.message}
                    </span>
                  );
                })
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Fully Compatible
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right column: Category Dashboard + Ingredients details & Alternatives */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Category Dashboard Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
            
            {/* Cosmetics Module View */}
            {activeCategory === 'cosmetics' && (
              <>
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-xl">science</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Cosmetics Safety Dashboard</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-1 border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Acne-Prone Skin suitability</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`material-symbols-outlined ${cosmetics.acne_compatible === 'Safe' ? 'text-primary' : 'text-error'}`}>
                        {cosmetics.acne_compatible === 'Safe' ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-extrabold">{cosmetics.acne_compatible || "Safe"}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">Evaluates comedogenic ingredients (clogs pores).</p>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-1 border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Sensitive Skin suitability</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`material-symbols-outlined ${
                        cosmetics.sensitive_compatible === 'Safe' ? 'text-primary' : cosmetics.sensitive_compatible === 'Caution' ? 'text-secondary' : 'text-error'
                      }`}>
                        {cosmetics.sensitive_compatible === 'Safe' ? 'check_circle' : cosmetics.sensitive_compatible === 'Caution' ? 'gpp_maybe' : 'cancel'}
                      </span>
                      <span className="text-sm font-extrabold">{cosmetics.sensitive_compatible || "Safe"}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">Flags harsh surfactants (SLS) and fragrance.</p>
                  </div>
                </div>

                {cosmetics.harmful_ingredients_detected && cosmetics.harmful_ingredients_detected.length > 0 && (
                  <div className="p-4 bg-error-container/10 border-l-4 border-l-solid border-l-error rounded-r-2xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-error flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>Harmful Ingredients Detected</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {cosmetics.harmful_ingredients_detected.map((ing, idx) => (
                        <span key={idx} className="bg-error/10 text-error text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Food Module View */}
            {activeCategory === 'food' && (
              <>
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-xl">restaurant</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Nutritional Safety Dashboard</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10 text-center">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Sugar</span>
                    <span className={`inline-block mt-2 text-xs font-extrabold px-3 py-1 rounded-full ${
                      food.sugar_analysis === 'High' ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'
                    }`}>
                      {food.sugar_analysis || "Low"}
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10 text-center">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Fats</span>
                    <span className={`inline-block mt-2 text-xs font-extrabold px-3 py-1 rounded-full ${
                      food.fat_analysis === 'High' ? 'bg-error-container text-on-error-container' : food.fat_analysis === 'Medium' ? 'bg-secondary-container/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}>
                      {food.fat_analysis || "Low"}
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10 text-center">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Sodium</span>
                    <span className={`inline-block mt-2 text-xs font-extrabold px-3 py-1 rounded-full ${
                      food.sodium_analysis === 'High' ? 'bg-error-container text-on-error-container' : food.sodium_analysis === 'Medium' ? 'bg-secondary-container/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}>
                      {food.sodium_analysis || "Low"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                    food.diabetes_friendly ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-error-container/10 border-error/20 text-error'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Diabetes Friendly</span>
                      <span className="text-xs font-extrabold mt-0.5">{food.diabetes_friendly ? "Friendly" : "Not Friendly"}</span>
                    </div>
                    <span className="material-symbols-outlined text-lg">{food.diabetes_friendly ? "check_circle" : "cancel"}</span>
                  </div>

                  <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                    food.weight_loss_friendly ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-error-container/10 border-error/20 text-error'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Weight Loss Goals</span>
                      <span className="text-xs font-extrabold mt-0.5">{food.weight_loss_friendly ? "Friendly" : "Not Recommended"}</span>
                    </div>
                    <span className="material-symbols-outlined text-lg">{food.weight_loss_friendly ? "check_circle" : "cancel"}</span>
                  </div>
                </div>

                {food.harmful_additives && food.harmful_additives.length > 0 && (
                  <div className="p-4 bg-error-container/10 border-l-4 border-l-solid border-l-error rounded-r-2xl">
                    <span className="text-xs font-bold text-error flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>Additives &amp; Preservatives</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {food.harmful_additives.map((add, idx) => (
                        <span key={idx} className="bg-error/10 text-error text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {add}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Medicine Module View */}
            {activeCategory === 'medicine' && (
              <>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-xl">medication</span>
                    <h4 className="text-sm font-bold uppercase tracking-wider">Medicine Safety dashboard</h4>
                  </div>
                  <span className="text-xs font-bold bg-secondary-container/10 text-secondary px-3 py-1 rounded-full">
                    Strength: {medicine.strength || "N/A"}
                  </span>
                </div>

                {/* Uses */}
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Clinical Indications (Uses)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(medicine.uses || []).map((use, idx) => (
                      <span key={idx} className="bg-surface-container-low border border-outline-variant/35 text-on-surface text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Safety Flags checklist */}
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Clinical Safety Flags</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-surface-container-low rounded-xl text-center flex flex-col gap-0.5 border border-outline-variant/10">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Allergy Risk</span>
                      <span className={`text-[10px] font-bold ${medicine.safety_flags?.allergy_risk !== 'None' ? 'text-error font-extrabold' : 'text-primary'}`}>
                        {medicine.safety_flags?.allergy_risk || 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-low rounded-xl text-center flex flex-col gap-0.5 border border-outline-variant/10">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Pregnancy</span>
                      <span className={`text-[10px] font-bold ${medicine.safety_flags?.pregnancy_warning !== 'Safe' ? 'text-error font-extrabold' : 'text-primary'}`}>
                        {medicine.safety_flags?.pregnancy_warning || 'Safe'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-low rounded-xl text-center flex flex-col gap-0.5 border border-outline-variant/10">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Kidney/Liver</span>
                      <span className={`text-[10px] font-bold ${medicine.safety_flags?.kidney_liver_caution !== 'Safe' ? 'text-error font-extrabold' : 'text-primary'}`}>
                        {medicine.safety_flags?.kidney_liver_caution || 'Safe'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-low rounded-xl text-center flex flex-col gap-0.5 border border-outline-variant/10">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Overdose</span>
                      <span className={`text-[10px] font-bold ${medicine.safety_flags?.overdose_risk !== 'Low' ? 'text-error font-extrabold' : 'text-primary'}`}>
                        {medicine.safety_flags?.overdose_risk || 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drug-Drug Interactions */}
                {medicine.drug_interactions && medicine.drug_interactions.length > 0 && (
                  <div className="p-4 bg-error-container/10 border-l-4 border-l-solid border-l-error rounded-r-2xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-error flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">swap_horizontal_circle</span>
                      <span>🚨 Clinical Drug Interactions Detected</span>
                    </span>
                    <div className="flex flex-col gap-2">
                      {medicine.drug_interactions.map((inter, idx) => (
                        <div key={idx} className="bg-error-container/20 p-3 rounded-lg border border-error/10 text-xs">
                          <p className="font-extrabold text-error uppercase text-[9px] tracking-wider mb-0.5">{inter.severity} severity</p>
                          <p className="font-bold text-on-surface-variant">{inter.drug_a} + {inter.drug_b}</p>
                          <p className="text-on-surface-variant mt-1 text-[11px] leading-relaxed">{inter.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Warnings */}
                {medicine.personalized_warnings && medicine.personalized_warnings.length > 0 && (
                  <div className="p-4 bg-secondary-container/5 border-l-4 border-l-solid border-l-secondary rounded-r-2xl flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">assignment_late</span>
                      <span>Personalized Warnings</span>
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-on-surface-variant leading-relaxed flex flex-col gap-1">
                      {medicine.personalized_warnings.map((warn, idx) => (
                        <li key={idx} className="marker:text-secondary">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Side Effects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 border-t border-outline-variant/30 pt-4">
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5 text-secondary">Common Side Effects</span>
                    <ul className="flex flex-col gap-1">
                      {(medicine.side_effects?.common || ["Nausea", "Diarrhea"]).map((se, idx) => (
                        <li key={idx} className="text-xs text-on-surface flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></span>
                          <span>{se}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5 text-error">Serious Side Effects</span>
                    <ul className="flex flex-col gap-1">
                      {(medicine.side_effects?.serious || ["Allergic reaction"]).map((se, idx) => (
                        <li key={idx} className="text-xs text-on-surface flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-error rounded-full flex-shrink-0"></span>
                          <span>{se}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

          </div>
          
          {/* Ingredients analysis section */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">science</span>
                <h4 className="text-lg font-bold">Ingredients Evaluation</h4>
              </div>
              <div className="text-xs text-on-surface-variant font-medium">
                {(resultsData.extracted_ingredients || []).length} Ingredients Extracted
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(resultsData.extracted_ingredients || []).map((ing, idx) => {
                const details = getIngredientDetails(ing);
                const isOpen = activeAccordion === idx;
                
                return (
                  <div key={idx} className="border border-outline-variant/40 rounded-xl overflow-hidden transition-all duration-200">
                    <div 
                      onClick={() => toggleAccordion(idx)}
                      className="flex justify-between items-center p-4 bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[20px] ${
                          details.hasWarning ? 'bg-error-container/20 text-error' : 'bg-secondary/15 text-secondary'
                        }`}>
                          <span className="material-symbols-outlined">
                            {details.hasWarning ? 'dangerous' : 'check_circle'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{ing}</p>
                          <p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider">
                            {details.hasWarning ? 'Chemical Additive / Allergen' : 'Standard Ingredient'}
                          </p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>

                    {isOpen && (
                      <div className="p-4 bg-white border-t border-outline-variant/30 flex flex-col gap-4 animate-[slideDown_0.2s_ease-out]">
                        <p className="text-xs text-on-surface-variant leading-relaxed">{details.explanation}</p>
                        
                        <div className="flex gap-4">
                          <div className="bg-surface-container-low p-3 rounded-lg flex-1">
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Impact Level</p>
                            <p className={`text-xs font-bold ${details.hasWarning ? 'text-error' : 'text-on-surface'}`}>
                              {details.hasWarning ? 'Alert Flag' : 'Negligible'}
                            </p>
                          </div>
                          <div className="bg-surface-container-low p-3 rounded-lg flex-1">
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Physiological Concern</p>
                            <p className="text-xs font-bold text-on-surface">{details.impact}</p>
                          </div>
                        </div>

                        {details.hasWarning && (
                          <div className="p-3 bg-error-container/10 border-l-4 border-l-solid border-l-error rounded-r-lg text-xs italic text-on-surface-variant leading-relaxed">
                            <strong>Guardian Advisor:</strong> Active rules check flagged this compound. Refer to medical recommendations regarding {ing}.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alternatives market card */}
          {resultsData.better_alternatives && resultsData.better_alternatives.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">eco</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Healthy Alternatives</h4>
                </div>
                <span className="text-[10px] text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Marketplace Match
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resultsData.better_alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 hover:shadow-md hover:translate-y-[-2px] active:scale-[0.99] transition-all duration-200 flex gap-4 cursor-pointer">
                    <div className="w-24 h-24 rounded-xl bg-surface-container overflow-hidden relative flex-shrink-0">
                      <img src={alt.image} className="w-full h-full object-cover" alt={alt.name}/>
                      <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
                        {alt.score} SCORE
                      </span>
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0 py-0.5">
                      <div>
                        <p className="text-xs font-extrabold text-on-surface truncate">{alt.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate mb-1.5">{alt.desc}</p>
                        <div className="flex gap-1">
                          {(alt.tags || []).map((t, idx) => (
                            <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase tracking-wider">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-extrabold text-primary">{alt.price}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert(`Added ${alt.name} to cart`); }}
                          className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-primary hover:text-white flex items-center justify-center transition-colors duration-150 border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Medical/General Disclaimer */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 text-[10px] text-on-surface-variant leading-relaxed text-center mt-8">
        {resultsData.disclaimer || "Disclaimer: This product analysis is generated using automated character parsing. It is meant for educational demonstrations and does not substitute professional clinical diagnostics."}
      </div>
    </div>
  );
}
