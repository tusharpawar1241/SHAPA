import React, { useState, useEffect } from 'react';

export default function ResultsView({ resultsData, activeCategory, switchView }) {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [scoreCount, setScoreCount] = useState(0);

  // Animates the score counting up on enter
  useEffect(() => {
    if (resultsData && resultsData.safety_score !== undefined) {
      setScoreCount(0);
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
  
  // Calculate SVG circular path offsets
  // Total circumference is 2 * pi * r = 2 * 3.14 * 80 = 502.4
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
    let evidence = "High Guidelines";
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
    } else if (ing.toLowerCase().includes("paraben")) {
      explanation = "Parabens act as weak estrogen mimics and endocrine disruptors. Associated with hormonal imbalances and cosmetic contact dermatitis.";
      impact = "Hormonal Mimicry";
      evidence = "EU Cosmetic Watchlist";
    } else if (ing.toLowerCase().includes("sulfate") || ing.toLowerCase().includes("lauryl")) {
      explanation = "Sodium Lauryl Sulfate is a harsh surfactant. Removes protective oils, leading to severe barrier damage and skin irritation.";
      impact = "Epidermal Dryness";
      evidence = "Dermatologist Flag";
    } else if (ing.toLowerCase().includes("aspirin")) {
      explanation = "Aspirin is an NSAID. Interacts negatively with ACE inhibitors (Lisinopril) by reducing glomerular filtration rates.";
      impact = "Renal Strain";
      evidence = "Clinical Drug Interaction";
    } else if (ing.toLowerCase().includes("caffeine")) {
      explanation = "Caffeine is a central nervous system stimulant. Triggers vasoconstriction, elevating systolic and diastolic blood pressure.";
      impact = "Vascular Tension";
      evidence = "AHA Advisory Warning";
    } else if (ing.toLowerCase().includes("dye")) {
      explanation = "Synthetic petroleum-based dye. Banned or limited in foods in several regions due to links to hyperactive child behaviors.";
      impact = "Behavioral Alert";
      evidence = "WHO Watchlist";
    }

    return { explanation, impact, evidence, hasWarning };
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
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
            className="flex-1 md:flex-none border border-outline px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Scan Another</span>
          </button>
          <button 
            onClick={() => alert("Report shared successfully")}
            className="flex-1 md:flex-none bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className={`bg-surface-container-lowest rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden border border-t-4 border-t-error ${borderClass} shadow-sm`}>
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
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

        {/* Right column: Ingredients detail breakdown and alternatives */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
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
                          <div className="p-3 bg-error-container/10 border-l-4 border-l-error rounded-r-lg text-xs italic text-on-surface-variant leading-relaxed">
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
                          className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-primary hover:text-white flex items-center justify-center transition-colors duration-150"
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
