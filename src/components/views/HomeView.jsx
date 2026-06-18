import React from 'react';

export default function HomeView({ switchView, selectCategory, userProfile }) {
  
  const handleCardClick = (category) => {
    selectCategory(category);
    switchView('scan');
  };

  // Compile active goals from user profile
  const compileGoals = () => {
    const goals = [];
    
    if (userProfile.dietary_goals.gluten_free || userProfile.dietary_goals.dairy_free || userProfile.dietary_goals.nut_free) {
      let allergens = [];
      if (userProfile.dietary_goals.gluten_free) allergens.push("Gluten");
      if (userProfile.dietary_goals.dairy_free) allergens.push("Dairy");
      if (userProfile.dietary_goals.nut_free) allergens.push("Nuts");
      
      goals.push({
        title: "Allergen Free",
        statusText: userProfile.dietary_goals.nut_free ? "Critical Watch" : "Active Check",
        statusClass: "text-primary",
        colorClass: "bg-primary",
        percent: 85,
        desc: `Avoiding: ${allergens.join(', ')}`
      });
    }

    if (userProfile.dietary_goals.low_sugar) {
      goals.push({
        title: "Sugar Restriction",
        statusText: "Strict Limit",
        statusClass: "text-secondary",
        colorClass: "bg-secondary",
        percent: 95,
        desc: "Avoiding High Fructose Corn Syrup & excess added sugar"
      });
    }

    if (userProfile.medical_profile.conditions.hypertension) {
      goals.push({
        title: "Cardio Integrity",
        statusText: "Hypertension Rules",
        statusClass: "text-tertiary",
        colorClass: "bg-tertiary",
        percent: 100,
        desc: `Avoiding Caffeine and drug interactions with Lisinopril`
      });
    }

    return goals;
  };

  const activeGoals = compileGoals();

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
          Welcome back, {userProfile.name.split(' ')[0]}
        </p>
        <h2 className="text-3xl font-extrabold text-on-surface leading-tight">Protect your health.</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Your AI companion for chemical and nutritional transparency.
        </p>
      </div>

      {/* Bento Grid of Guardians */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Food Guardian */}
        <button 
          onClick={() => handleCardClick('food')}
          className="flex flex-col items-start p-6 bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-surface-container-low transition-all active:scale-[0.98] duration-150 text-left border border-outline-variant/20 hover:border-secondary group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-3xl">restaurant</span>
          </div>
          <h3 className="text-lg font-bold text-secondary mb-1">Food Guardian</h3>
          <p className="text-xs text-on-surface-variant mb-6 flex-grow">
            Scan nutritional labels for sugars, fats, sodium, allergens, and toxic additives.
          </p>
          <div className="flex items-center text-secondary font-semibold text-xs gap-1">
            <span>Scan Food</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </button>

        {/* Meds Guardian */}
        <button 
          onClick={() => handleCardClick('medicine')}
          className="flex flex-col items-start p-6 bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-surface-container-low transition-all active:scale-[0.98] duration-150 text-left border border-outline-variant/20 hover:border-primary group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-3xl">medication</span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">Meds Guardian</h3>
          <p className="text-xs text-on-surface-variant mb-6 flex-grow">
            Verify uses, check safety alerts, and scan drug-to-drug interactions instantly.
          </p>
          <div className="flex items-center text-primary font-semibold text-xs gap-1">
            <span>Verify Meds</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </button>

        {/* Cosmetic Guardian */}
        <button 
          onClick={() => handleCardClick('cosmetics')}
          className="flex flex-col items-start p-6 bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-surface-container-low transition-all active:scale-[0.98] duration-150 text-left border border-outline-variant/20 hover:border-on-surface group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-on-surface-variant/10 flex items-center justify-center mb-4 text-on-surface group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-3xl">science</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Cosmetic Guardian</h3>
          <p className="text-xs text-on-surface-variant mb-6 flex-grow">
            Check skincare products for endocrine disruptors, allergens, and skin type fit.
          </p>
          <div className="flex items-center text-on-surface font-semibold text-xs gap-1">
            <span>Analyze Cosmetics</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </button>
      </div>

      {/* Bottom Grid: Profile Goals & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Goals Summary */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Active Goals Match
            </h4>
            <button 
              onClick={() => switchView('profile')}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {activeGoals.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">
                No active restrictions set. Edit your health profile to customize goals.
              </p>
            ) : (
              activeGoals.map((g, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface">{g.title}</span>
                    <span className={g.statusClass}>{g.statusText}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g.colorClass}`} style={{ width: `${g.percent}%` }}></div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{g.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Insight Card */}
        <div className="glass-card rounded-2xl p-6 flex gap-4 items-start shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <span className="material-symbols-outlined text-tertiary-container text-4xl flex-shrink-0">
            lightbulb
          </span>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block mb-0.5">
              Daily Safety Insight
            </span>
            <h4 className="text-sm font-bold text-on-surface mb-1">Titanium Dioxide Alert</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Titanium Dioxide (E171) was recently flagged for potential inhalation hazards in loose powders. Check your makeup palettes and finishing sprays for nano-formulations which can bypass skin barriers.
            </p>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert("Educational Article Link"); }}
              className="text-secondary font-bold text-xs inline-flex items-center gap-1 hover:underline"
            >
              <span>Read research report</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
