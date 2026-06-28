export default function HomeView({ 
  switchView, 
  selectCategory, 
  userProfile, 
  scanHistory, 
  viewHistoryItem, 
  clearHistory 
}) {
  
  const handleCardClick = (category) => {
    selectCategory(category);
    switchView('scan');
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
          Welcome back, {userProfile?.name?.split(' ')[0] || "User"}
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
        
        {/* Scan History & Logs */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              <span>Recent Scan Logs</span>
            </h4>
            {scanHistory && scanHistory.length > 0 && (
              <button 
                onClick={() => { if (confirm("Clear all scan logs?")) clearHistory(); }}
                className="text-[10px] text-error hover:bg-error/10 px-2 py-1 rounded transition-colors font-bold border-none bg-transparent cursor-pointer"
                title="Clear Logs"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
            {!scanHistory || scanHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6 gap-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">receipt_long</span>
                <p className="text-xs text-on-surface-variant">
                  No recent scans. Select a category above to start.
                </p>
              </div>
            ) : (
              scanHistory.map((item, idx) => {
                // Determine safety color
                const score = parseFloat(item.safety_score) || 0;
                let badgeBg = "bg-green-100 text-green-800";
                if (score < 4.0) {
                  badgeBg = "bg-red-100 text-red-800";
                } else if (score < 7.0) {
                  badgeBg = "bg-orange-100 text-orange-800";
                }

                // Determine category icon
                let catIcon = "restaurant";
                if (item.category === "medicine") catIcon = "medication";
                else if (item.category === "cosmetics") catIcon = "science";

                return (
                  <button 
                    key={idx}
                    onClick={() => viewHistoryItem(idx)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:border-primary hover:bg-primary/5 transition-all text-left cursor-pointer bg-transparent"
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-grow pr-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{catIcon}</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-on-surface">{item.product_name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">
                          {item.brand_name || "Unknown Brand"} • {(() => {
                            if (!item.timestamp) return "Just now";
                            try {
                              const d = new Date(item.timestamp);
                              return isNaN(d.getTime()) ? item.timestamp.split(',')[0] : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            } catch (e) {
                              return item.timestamp.split(',')[0];
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeBg} flex-shrink-0`}>
                      {score.toFixed(1)} / 10
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Daily Insight Card */}
        <div className="glass-card rounded-2xl p-6 flex gap-4 items-start shadow-[0_4px_12px_rgba(0,0,0,0.02)] h-[320px] overflow-y-auto">
          <span className="material-symbols-outlined text-tertiary text-4xl flex-shrink-0">
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
