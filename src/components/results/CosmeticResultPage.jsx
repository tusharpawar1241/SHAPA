import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────
   Helper: Score on 0–100 scale
───────────────────────────────────────── */
const toHundred = (score) => Math.round((parseFloat(score) || 0) * 10);

/* ─────────────────────────────────────────
   Helper: Score theme
───────────────────────────────────────── */
function getScoreTheme(score100) {
  if (score100 >= 75) return { ring: '#006a39', text: 'text-[#006a39]', bg: 'bg-[#006a39]/10', border: 'border-[#006a39]/25', badgeBg: 'bg-[#006a39]', label: 'Skin Safe', icon: 'check_circle', glow: 'shadow-[0_0_32px_rgba(0,106,57,0.18)]' };
  if (score100 >= 50) return { ring: '#B45309', text: 'text-[#B45309]', bg: 'bg-[#B45309]/10', border: 'border-[#B45309]/25', badgeBg: 'bg-[#B45309]', label: 'Use Cautiously', icon: 'gpp_maybe', glow: 'shadow-[0_0_32px_rgba(180,83,9,0.16)]' };
  return { ring: '#ba1a1a', text: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10', border: 'border-[#ba1a1a]/25', badgeBg: 'bg-[#ba1a1a]', label: 'Avoid', icon: 'dangerous', glow: 'shadow-[0_0_32px_rgba(186,26,26,0.18)]' };
}

/* ─────────────────────────────────────────
   Helper: Ingredient Category Chip
───────────────────────────────────────── */
function IngredientChip({ name, found, severity, icon }) {
  if (!found) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 opacity-40">
      <span className="text-base">{icon}</span>
      <span className="text-[10px] font-semibold text-on-surface-variant line-through">{name}</span>
    </div>
  );
  const styles = {
    high:     'bg-[#ba1a1a]/8 border-[#ba1a1a]/30 text-[#ba1a1a]',
    moderate: 'bg-[#B45309]/8 border-[#B45309]/30 text-[#B45309]',
    safe:     'bg-[#006a39]/8 border-[#006a39]/30 text-[#006a39]',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${styles[severity] || styles.moderate}`}>
      <span className="text-base">{icon}</span>
      <span className="text-[10px] font-bold">{name}</span>
      <span className={`ml-auto text-[8px] font-extrabold uppercase tracking-wider`}>DETECTED</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Skin Compatibility Row
───────────────────────────────────────── */
function SkinCompatRow({ label, icon, compatible, reason, userHas }) {
  const isOk = compatible === 'compatible';
  const isWarn = compatible === 'caution';
  const isNot = compatible === 'incompatible';
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${isOk ? 'bg-[#006a39]/5 border-[#006a39]/20' : isWarn ? 'bg-[#B45309]/5 border-[#B45309]/20' : 'bg-[#ba1a1a]/5 border-[#ba1a1a]/20'} ${!userHas ? 'opacity-40' : ''}`}>
      <span className={`material-symbols-outlined text-xl flex-shrink-0 ${isOk ? 'text-[#006a39]' : isWarn ? 'text-[#B45309]' : 'text-[#ba1a1a]'}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface">{label}</span>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${isOk ? 'bg-[#006a39]' : isWarn ? 'bg-[#B45309]' : 'bg-[#ba1a1a]'}`}>
            {isOk ? 'Compatible' : isWarn ? 'Use Caution' : 'Incompatible'}
          </span>
          {!userHas && <span className="text-[9px] text-on-surface-variant italic">Not in your profile</span>}
        </div>
        {reason && <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{reason}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Collapsible Section
───────────────────────────────────────── */
function Section({ icon, iconColor, iconText, title, subtitle, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
            <span className={`material-symbols-outlined text-xl ${iconText}`}>{icon}</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-on-surface">{title}</h2>
            {subtitle && <p className="text-[10px] text-on-surface-variant">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
        </div>
      </button>
      {open && <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">{children}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CosmeticResultPage({ resultsData, switchView, userProfile, apiSettings }) {
  const [scoreCount, setScoreCount] = useState(0);
  const score100 = toHundred(resultsData?.safety_score);
  const theme = getScoreTheme(score100);

  useEffect(() => {
    setScoreCount(0);
    const duration = 1200; const steps = 60; const inc = score100 / steps; let cur = 0;
    const t = setInterval(() => { cur += inc; if (cur >= score100) { setScoreCount(score100); clearInterval(t); } else setScoreCount(Math.round(cur)); }, duration / steps);
    return () => clearInterval(t);
  }, [score100]);

  if (!resultsData) return null;

  const cosm = resultsData.cosmetics_details || {};
  const flags = resultsData.compatibility_flags || [];
  const alts = resultsData.better_alternatives || [];
  const ingredients = resultsData.extracted_ingredients || [];

  const profile = userProfile || {};
  const skinProfile = profile.skin_profile || {};
  const skinType = skinProfile.skin_type || 'normal';
  const skinConcerns = skinProfile.skin_concerns || [];
  const avoidIngs = skinProfile.avoid_ingredients || [];
  const conditions = profile.medical_profile?.conditions || {};
  const hairType = profile.hairType || profile.hair_type || 'normal';
  const hairConcerns = profile.hairConcerns || profile.hair_concerns || [];
  const avoidFragrance = profile.avoidFragrance || false;
  const avoidParabens = profile.avoidParabens || false;
  const avoidSulfates = profile.avoidSulfates || false;
  const avoidAlcohol = profile.avoidAlcohol || false;
  const avoidSilicone = profile.avoidSilicone || false;
  const avoidMineralOil = profile.avoidMineralOil || false;
  const avoidEssentialOils = profile.avoidEssentialOils || false;
  const confidence = score100 >= 75 ? 93 : score100 >= 50 ? 85 : 77;

  const ingrText = ingredients.join(' ').toLowerCase();

  // ── Ingredient category detection ──
  const categories = [
    { name: 'Parabens',           icon: '⚗️', keywords: /paraben/i,                         severity: 'high',     desc: 'Hormone disruptors — avoid for sensitive skin & pregnancy' },
    { name: 'Sulfates (SLS/SLES)', icon: '🧪', keywords: /lauryl sulfate|sls|sles/i,          severity: 'high',     desc: 'Harsh surfactant — strips skin barrier, causes dryness' },
    { name: 'Drying Alcohol',      icon: '🍶', keywords: /sd alcohol|denatured alcohol|alcohol denat/i, severity: 'moderate', desc: 'Can dry and irritate sensitive or dry skin' },
    { name: 'Silicones',           icon: '🔬', keywords: /silicone|dimethicone|cyclomethicone/i, severity: 'moderate', desc: 'Forms film on skin — can clog pores on acne-prone skin' },
    { name: 'Mineral Oil',         icon: '🛢️', keywords: /mineral oil|petrolatum|paraffinum/i, severity: 'high',    desc: 'Comedogenic — clogs pores, not recommended for acne skin' },
    { name: 'Artificial Fragrance',icon: '🌸', keywords: /fragrance|parfum/i,                severity: 'moderate', desc: 'Common sensitizer — irritating for sensitive & eczema skin' },
    { name: 'Essential Oils',      icon: '🌿', keywords: /essential oil|lavender oil|tea tree oil|peppermint oil|eucalyptus/i, severity: 'moderate', desc: 'Can be sensitizing — use with caution on reactive skin' },
    { name: 'Comedogenic Ingredients', icon: '🚫', keywords: /coconut oil|isopropyl myristate|lanolin|acetylated lanolin/i, severity: 'high', desc: 'Pore-clogging ingredients — avoid for acne-prone skin' },
    { name: 'Formaldehyde Releasers', icon: '☣️', keywords: /formaldehyde|dmdm hydantoin|quaternium-15|diazolidinyl urea/i, severity: 'high', desc: 'Preservatives that release formaldehyde — skin irritants & carcinogens' },
    { name: 'Phthalates',          icon: '⚠️', keywords: /phthalate|dbp|dep|dibutyl/i,        severity: 'high',    desc: 'Endocrine disruptors — linked to hormonal disturbances' },
    { name: 'Safe Actives',        icon: '✨', keywords: /hyaluronic acid|niacinamide|ceramide|vitamin c|retinol|glycerin|aloe/i, severity: 'safe', desc: 'Proven skin-beneficial actives' },
  ];
  const detectedCategories = categories.map(c => ({
    ...c, found: c.keywords.test(ingrText)
  }));

  // Is it a hair product?
  const isHairProduct = /shampoo|conditioner|hair|serum|mask|scalp/i.test(resultsData.product_name || '') || /hair/i.test(resultsData.category || '');

  // ── Skin compatibility matrix ──
  const skinCompatMatrix = [
    {
      label: 'Dry Skin', icon: 'water_drop', userHas: skinType === 'dry' || skinConcerns.includes('dryness'),
      compatible: (ingrText.includes('sodium lauryl sulfate') || ingrText.includes('alcohol denat')) ? 'incompatible' : (ingrText.includes('glycerin') || ingrText.includes('hyaluronic') || ingrText.includes('ceramide')) ? 'compatible' : 'caution',
      reason: ingrText.includes('sodium lauryl sulfate') ? 'SLS severely dries the skin barrier — not suitable for dry skin.' : 'Check for adequate humectants (glycerin, hyaluronic acid) for optimal dry skin support.'
    },
    {
      label: 'Oily Skin', icon: 'oil_barrel', userHas: skinType === 'oily',
      compatible: (ingrText.includes('mineral oil') || ingrText.includes('coconut oil')) ? 'incompatible' : ingrText.includes('niacinamide') ? 'compatible' : 'caution',
      reason: ingrText.includes('mineral oil') ? 'Mineral oil is comedogenic — traps excess sebum and worsens oily skin.' : 'Non-comedogenic formulation appears suitable for oily skin.'
    },
    {
      label: 'Sensitive Skin', icon: 'face', userHas: skinType === 'sensitive',
      compatible: (ingrText.includes('fragrance') || ingrText.includes('parfum') || ingrText.includes('paraben')) ? 'incompatible' : cosm.sensitive_compatible === 'Safe' ? 'compatible' : 'caution',
      reason: ingrText.includes('fragrance') ? 'Fragrance is the #1 cause of cosmetic contact dermatitis in sensitive skin.' : 'Generally safe for sensitive skin — patch test recommended.'
    },
    {
      label: 'Combination Skin', icon: 'compare', userHas: skinType === 'combination',
      compatible: (ingrText.includes('mineral oil') || ingrText.includes('coconut oil')) ? 'caution' : 'compatible',
      reason: 'Combination skin benefits from balanced, non-comedogenic formulas. Avoid heavy oils on T-zone.'
    },
    {
      label: 'Acne-Prone Skin', icon: 'healing', userHas: skinConcerns.includes('acne'),
      compatible: cosm.acne_compatible === 'Safe' ? 'compatible' : cosm.acne_compatible === 'Caution' ? 'caution' : 'incompatible',
      reason: cosm.acne_compatible !== 'Safe' ? 'Contains comedogenic ingredients that can clog pores and trigger breakouts.' : 'Non-comedogenic formula — suitable for acne-prone skin.'
    },
    {
      label: 'Eczema / Dermatitis', icon: 'rash', userHas: skinConcerns.includes('eczema'),
      compatible: (ingrText.includes('fragrance') || ingrText.includes('paraben') || ingrText.includes('sodium lauryl sulfate')) ? 'incompatible' : 'compatible',
      reason: 'Eczema skin needs fragrance-free, sulfate-free and paraben-free formulas to avoid flares.'
    },
    {
      label: 'Hyperpigmentation', icon: 'brightness_5', userHas: skinConcerns.includes('hyperpigmentation') || skinConcerns.includes('dark spots'),
      compatible: ingrText.includes('niacinamide') || ingrText.includes('vitamin c') || ingrText.includes('kojic') || ingrText.includes('arbutin') ? 'compatible' : 'caution',
      reason: ingrText.includes('niacinamide') || ingrText.includes('vitamin c') ? 'Contains proven brightening actives (Niacinamide/Vitamin C) — beneficial for hyperpigmentation.' : 'No specific brightening actives detected for hyperpigmentation.'
    },
    {
      label: 'Fine Lines / Aging', icon: 'face_retouching_natural', userHas: skinConcerns.includes('wrinkles') || skinConcerns.includes('anti-aging'),
      compatible: ingrText.includes('retinol') || ingrText.includes('retinoid') || ingrText.includes('peptide') || ingrText.includes('collagen') ? 'compatible' : 'caution',
      reason: ingrText.includes('retinol') ? 'Contains Retinol — clinically proven to reduce fine lines and boost collagen synthesis.' : 'No key anti-aging actives (retinol, peptides) detected.'
    },
  ];

  // ── Cosmetic allergy check ──
  const cosmeticAllergyItems = [
    { name: 'Fragrance / Parfum', userAvoids: avoidFragrance, found: /fragrance|parfum/i.test(ingrText) },
    { name: 'Parabens', userAvoids: avoidParabens, found: /paraben/i.test(ingrText) },
    { name: 'Sulfates', userAvoids: avoidSulfates, found: /lauryl sulfate|sls|sles/i.test(ingrText) },
    { name: 'Alcohol (drying)', userAvoids: avoidAlcohol, found: /sd alcohol|denatured alcohol|alcohol denat/i.test(ingrText) },
    { name: 'Silicones', userAvoids: avoidSilicone, found: /silicone|dimethicone/i.test(ingrText) },
    { name: 'Mineral Oil', userAvoids: avoidMineralOil, found: /mineral oil|paraffinum/i.test(ingrText) },
    { name: 'Essential Oils', userAvoids: avoidEssentialOils, found: /essential oil|tea tree|lavender oil/i.test(ingrText) },
    ...avoidIngs.map(a => ({ name: a, userAvoids: true, found: ingrText.includes(a.toLowerCase()) })),
  ].filter(item => item.userAvoids);

  const allergyConflicts = cosmeticAllergyItems.filter(item => item.found);

  // ── Hair compatibility ──
  const hairCompatMatrix = [
    { label: 'Dry Hair', userHas: hairConcerns.includes('dryness') || hairType === 'dry', compatible: ingrText.includes('sodium lauryl sulfate') ? 'incompatible' : ingrText.includes('keratin') || ingrText.includes('argan') || ingrText.includes('moisture') ? 'compatible' : 'caution' },
    { label: 'Oily Scalp', userHas: hairConcerns.includes('oily scalp') || hairType === 'oily', compatible: ingrText.includes('mineral oil') || ingrText.includes('coconut oil') ? 'incompatible' : 'compatible' },
    { label: 'Hair Fall', userHas: hairConcerns.includes('hair fall') || hairConcerns.includes('hair loss'), compatible: ingrText.includes('biotin') || ingrText.includes('caffeine') || ingrText.includes('minoxidil') ? 'compatible' : 'caution' },
    { label: 'Dandruff', userHas: hairConcerns.includes('dandruff'), compatible: ingrText.includes('zinc pyrithione') || ingrText.includes('ketoconazole') || ingrText.includes('selenium') ? 'compatible' : 'caution' },
    { label: 'Frizz Control', userHas: hairConcerns.includes('frizz'), compatible: ingrText.includes('silicone') || ingrText.includes('dimethicone') || ingrText.includes('keratin') ? 'compatible' : 'caution' },
  ];

  // ── Benefits & Risks ──
  const benefits = [
    ...(ingrText.includes('hyaluronic') ? ['Deep Hydration — Hyaluronic Acid retains 1000x its weight in water'] : []),
    ...(ingrText.includes('niacinamide') ? ['Pore Minimizing — Niacinamide reduces pore appearance and sebum'] : []),
    ...(ingrText.includes('ceramide') ? ['Barrier Repair — Ceramides restore the skin\'s protective lipid barrier'] : []),
    ...(ingrText.includes('vitamin c') ? ['Brightening — Vitamin C inhibits melanin and boosts radiance'] : []),
    ...(ingrText.includes('retinol') ? ['Anti-Aging — Retinol accelerates cell turnover and collagen production'] : []),
    ...(ingrText.includes('glycerin') ? ['Moisturizing — Glycerin is a powerful humectant'] : []),
    ...(ingrText.includes('aloe') ? ['Soothing — Aloe Vera calms irritation and redness'] : []),
    ...(ingrText.includes('spf') || ingrText.includes('sunscreen') || ingrText.includes('titanium dioxide') || ingrText.includes('zinc oxide') ? ['UV Protection — Contains sunscreen actives'] : []),
    ...(cosm.acne_compatible === 'Safe' ? ['Non-Comedogenic — Won\'t clog pores'] : []),
    ...(score100 >= 75 && !ingrText.includes('paraben') ? ['Paraben-Free — Safer preservative choice'] : []),
  ];

  const risks = [
    ...(ingrText.includes('paraben') ? ['Parabens Detected — Potential endocrine disruption concern'] : []),
    ...(ingrText.includes('sodium lauryl sulfate') || ingrText.includes('sls') ? ['SLS Detected — Strips natural skin oils and barrier'] : []),
    ...(ingrText.includes('mineral oil') ? ['Mineral Oil — Pore-clogging, comedogenic'] : []),
    ...(ingrText.includes('fragrance') || ingrText.includes('parfum') ? ['Artificial Fragrance — Common sensitizer, irritant'] : []),
    ...(ingrText.includes('formaldehyde') || ingrText.includes('dmdm') ? ['Formaldehyde Releaser — Carcinogenic concern'] : []),
    ...(cosm.acne_compatible === 'Avoid' ? ['Comedogenic Ingredients — May cause breakouts'] : []),
    ...(cosm.sensitive_compatible === 'Avoid' ? ['Not Suitable for Sensitive Skin'] : []),
    ...(cosm.harmful_ingredients_detected?.length > 0 ? [`${cosm.harmful_ingredients_detected.length} harmful ingredient(s) detected`] : []),
    ...(allergyConflicts.length > 0 ? [`${allergyConflicts.length} ingredient(s) on your avoid list`] : []),
  ];

  // SVG ring
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * scoreCount / 100);

  return (
    <div className="animate-[fadeIn_0.4s_ease] pb-16 space-y-6">
      {/* ── DEMO MODE WARNING ── */}
      {(!apiSettings || apiSettings.mode === 'mock' || !apiSettings.apiKey) && (
        <div className="bg-[#B45309]/8 border-2 border-[#B45309]/30 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm">
          <span className="material-symbols-outlined text-[#B45309] text-2xl flex-shrink-0">info</span>
          <div>
            <p className="text-xs font-extrabold text-[#B45309] uppercase tracking-wider">Simulated Demo Report</p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              No Gemini API key is configured. This is a static mock report shown for demonstration purposes. Go to <strong>Health Profile → Settings</strong> to add your Google AI Studio API key and scan real items.
            </p>
          </div>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <div className="relative bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/20 shadow-sm">
              <img src={resultsData.image || '/cosmetic_label.png'} alt={resultsData.product_name} className="w-full h-full object-cover" onError={e => { e.target.src = '/cosmetic_label.png'; }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-tertiary/10 text-tertiary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[12px]">spa</span>
                Cosmetic Guardian
              </span>
              {resultsData.category && (
                <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {resultsData.category}
                </span>
              )}
              {isHairProduct && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Hair Product
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight mb-1">
              {resultsData.product_name || 'Unknown Product'}
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mb-3">{resultsData.brand_name || 'Unknown Brand'}</p>
            <div className="flex flex-wrap gap-2">
              {skinType && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-tertiary/10 text-tertiary px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[13px]">face</span>
                  Your Skin: {skinType.charAt(0).toUpperCase() + skinType.slice(1)}
                </span>
              )}
              {skinConcerns.slice(0, 2).map((c, i) => (
                <span key={i} className="text-[10px] font-semibold bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant capitalize">{c}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col sm:items-end">
            <button onClick={() => switchView('scan')} className="border border-outline px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-white">
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span className="hidden sm:inline">Scan Another</span>
            </button>
            <button onClick={() => alert('Report shared')} className="bg-tertiary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer border-none shadow-sm">
              <span className="material-symbols-outlined text-[15px]">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── OVERALL SAFETY + SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Score ring */}
        <div className={`md:col-span-2 bg-white rounded-3xl p-6 border ${theme.border} ${theme.glow} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: theme.ring }} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">Skin Safety Score</span>
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#ebeef4" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={theme.ring} strokeWidth="10" strokeLinecap="round"
                style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold leading-none" style={{ color: theme.ring }}>{scoreCount}</span>
              <span className="text-[9px] text-on-surface-variant font-bold mt-0.5">/ 100</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 text-white ${theme.badgeBg}`}>
            <span className="material-symbols-outlined text-[13px] mr-1 align-middle">{theme.icon}</span>
            {theme.label}
          </span>
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Confidence</p>
              <p className="text-base font-extrabold" style={{ color: theme.ring }}>{confidence}%</p>
            </div>
            <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Harmful</p>
              <p className={`text-base font-extrabold ${cosm.harmful_ingredients_detected?.length > 0 ? 'text-[#ba1a1a]' : 'text-[#006a39]'}`}>
                {cosm.harmful_ingredients_detected?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className={`${theme.bg} ${theme.border} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-xl" style={{ color: theme.ring }}>smart_toy</span>
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: theme.ring }}>AI Dermatologist Summary</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed font-medium">
              {resultsData.analysis_summary || 'Cosmetic safety analysis complete. Review the sections below for ingredient-level details.'}
            </p>
          </div>

          {/* Conflict summary */}
          {allergyConflicts.length > 0 && (
            <div className="bg-[#ba1a1a]/8 border border-[#ba1a1a]/25 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-xl">emergency</span>
                <p className="text-xs font-extrabold text-[#ba1a1a]">Cosmetic Allergy Conflict!</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergyConflicts.map((a, i) => (
                  <span key={i} className="text-[9px] font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">{a.name}</span>
                ))}
              </div>
            </div>
          )}
          {flags.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-outline-variant/30 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Skin Profile Flags</p>
              {flags.slice(0, 3).map((f, i) => {
                const isDanger = ['danger','critical'].includes(f.flag_type?.toLowerCase());
                return (
                  <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl ${isDanger ? 'bg-[#ba1a1a]/8 border border-[#ba1a1a]/20' : 'bg-[#B45309]/8 border border-[#B45309]/20'}`}>
                    <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${isDanger ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>{isDanger ? 'dangerous' : 'warning'}</span>
                    <span className={`text-xs font-semibold leading-snug ${isDanger ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>{f.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── INGREDIENT ANALYSIS BY CATEGORY ── */}
      <Section icon="science" iconColor="bg-tertiary/10" iconText="text-tertiary" title="Ingredient Category Analysis" subtitle="Chemical categories detected in this product">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {detectedCategories.map((c, i) => (
            <IngredientChip key={i} name={c.name} found={c.found} severity={c.severity} icon={c.icon} />
          ))}
        </div>
        {/* Full ingredient list */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">All Ingredients ({ingredients.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ing, i) => {
              const isBad = /paraben|sulfate|mineral oil|formaldehyde|phthalate/i.test(ing);
              const isCaution = /fragrance|parfum|silicone|alcohol denat/i.test(ing);
              return (
                <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${isBad ? 'bg-[#ba1a1a]/8 border-[#ba1a1a]/20 text-[#ba1a1a]' : isCaution ? 'bg-[#B45309]/8 border-[#B45309]/20 text-[#B45309]' : 'bg-surface-container border-outline-variant/25 text-on-surface-variant'}`}>
                  {ing}
                </span>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── SKIN COMPATIBILITY ── */}
      <Section icon="face" iconColor="bg-primary/10" iconText="text-primary" title="Skin Compatibility" subtitle="Matched to your personal skin profile"
        badge={
          skinCompatMatrix.filter(s => s.userHas && s.compatible === 'incompatible').length > 0
            ? <span className="text-[9px] font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full">{skinCompatMatrix.filter(s => s.userHas && s.compatible === 'incompatible').length} incompatible</span>
            : null
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skinCompatMatrix.map((s, i) => (
            <SkinCompatRow key={i} label={s.label} icon={s.icon} compatible={s.compatible} reason={s.reason} userHas={s.userHas} />
          ))}
        </div>
      </Section>

      {/* ── COSMETIC ALLERGY CHECK ── */}
      <Section icon="emergency" iconColor="bg-[#ba1a1a]/10" iconText="text-[#ba1a1a]" title="Cosmetic Allergy Check" subtitle="Matched against your cosmetic avoid list from Health Profile">
        {cosmeticAllergyItems.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-[#006a39] text-2xl">check_circle</span>
            <div>
              <p className="text-sm font-bold text-[#006a39]">No cosmetic avoid list set</p>
              <p className="text-xs text-on-surface-variant">Update your Health Profile with cosmetic allergies for personalized checks.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cosmeticAllergyItems.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-3.5 rounded-2xl border ${item.found ? 'bg-[#ba1a1a]/6 border-[#ba1a1a]/25' : 'bg-[#006a39]/6 border-[#006a39]/20'}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-xl ${item.found ? 'text-[#ba1a1a]' : 'text-[#006a39]'}`}>{item.found ? 'cancel' : 'check_circle'}</span>
                  <span className="text-xs font-semibold text-on-surface">{item.name}</span>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-white ${item.found ? 'bg-[#ba1a1a]' : 'bg-[#006a39]'}`}>
                  {item.found ? '⚠ DETECTED' : '✓ NOT FOUND'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── PREGNANCY SAFETY ── */}
      <Section icon="pregnant_woman" iconColor="bg-[#B45309]/10" iconText="text-[#B45309]" title="Pregnancy Safety">
        <div className={`flex items-start gap-4 p-4 rounded-2xl border ${conditions.pregnancy ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/25' : 'bg-[#B45309]/5 border-[#B45309]/25'}`}>
          <span className={`material-symbols-outlined text-2xl flex-shrink-0 ${conditions.pregnancy ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>pregnant_woman</span>
          <div>
            {conditions.pregnancy ? (
              <>
                <p className="text-xs font-extrabold text-[#ba1a1a] mb-1">⚠ You are pregnant — Extra caution required</p>
                {ingrText.includes('retinol') && <p className="text-xs text-on-surface-variant mb-1">⛔ Retinol/Retinoids are contraindicated during pregnancy — causes birth defects.</p>}
                {ingrText.includes('salicylic acid') && <p className="text-xs text-on-surface-variant mb-1">⚠ Salicylic Acid — avoid high concentrations during pregnancy.</p>}
                {ingrText.includes('formaldehyde') && <p className="text-xs text-on-surface-variant mb-1">⛔ Formaldehyde releasers — avoid during pregnancy.</p>}
                <p className="text-xs text-on-surface-variant">Consult your OB/GYN before using any new skincare product during pregnancy.</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-[#B45309] mb-1">General Pregnancy Guidance</p>
                <p className="text-xs text-on-surface-variant">
                  {ingrText.includes('retinol') ? '⚠ Contains Retinol — avoid if pregnant or planning pregnancy.' : 'No major pregnancy-contraindicated ingredients detected. Always consult your doctor if pregnant.'}
                </p>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ── HAIR COMPATIBILITY (if hair product) ── */}
      {isHairProduct && (
        <Section icon="content_cut" iconColor="bg-primary/10" iconText="text-primary" title="Hair Compatibility" subtitle="Matched to your hair profile">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hairCompatMatrix.map((h, i) => (
              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${h.compatible === 'compatible' ? 'bg-[#006a39]/5 border-[#006a39]/20' : h.compatible === 'caution' ? 'bg-[#B45309]/5 border-[#B45309]/20' : 'bg-[#ba1a1a]/5 border-[#ba1a1a]/20'} ${!h.userHas ? 'opacity-45' : ''}`}>
                <span className={`material-symbols-outlined text-xl flex-shrink-0 ${h.compatible === 'compatible' ? 'text-[#006a39]' : h.compatible === 'caution' ? 'text-[#B45309]' : 'text-[#ba1a1a]'}`}>content_cut</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-on-surface">{h.label}</p>
                  {!h.userHas && <p className="text-[10px] text-on-surface-variant italic">Not in your profile</p>}
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${h.compatible === 'compatible' ? 'bg-[#006a39]' : h.compatible === 'caution' ? 'bg-[#B45309]' : 'bg-[#ba1a1a]'}`}>
                  {h.compatible === 'compatible' ? '✓ OK' : h.compatible === 'caution' ? '~ Caution' : '✗ Avoid'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── BENEFITS & RISKS ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">balance</span>
          </div>
          <h2 className="text-sm font-extrabold text-on-surface">Benefits &amp; Risks</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px">
          <div className="p-5 bg-[#006a39]/3">
            <h3 className="text-xs font-extrabold text-[#006a39] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">thumb_up</span> Benefits
            </h3>
            {benefits.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-on-surface">
                    <span className="w-4 h-4 rounded-full bg-[#006a39] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-on-surface-variant italic">No notable skin benefits identified.</p>}
          </div>
          <div className="p-5 bg-[#ba1a1a]/3 border-t sm:border-t-0 sm:border-l border-outline-variant/20">
            <h3 className="text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">thumb_down</span> Risks
            </h3>
            {risks.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-on-surface">
                    <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✗</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-on-surface-variant italic">No significant risks identified.</p>}
          </div>
        </div>
      </div>

      {/* ── SAFER ALTERNATIVES ── */}
      {alts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Safer Alternative Products</h2>
              <p className="text-[10px] text-on-surface-variant">Products better matched to your skin profile</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alts.slice(0, 3).map((alt, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-outline-variant/30 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative border border-outline-variant/20">
                    <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" onError={e => { e.target.src = '/cosmetic_label.png'; }} />
                    <span className="absolute top-0.5 left-0.5 text-[7px] font-extrabold bg-tertiary text-white px-1 py-0.5 rounded">{alt.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-on-surface">{alt.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{alt.desc}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(alt.tags || []).map((t, i) => (
                    <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase tracking-wider">{t}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-extrabold text-tertiary">{alt.price}</span>
                  <button className="text-[10px] font-bold bg-tertiary/10 text-tertiary px-3 py-1 rounded-full hover:bg-tertiary hover:text-white transition-colors cursor-pointer border-none">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI DERMATOLOGIST RECOMMENDATION ── */}
      <div className={`rounded-3xl p-6 border-2 ${score100 >= 75 ? 'border-[#006a39]/25 bg-[#006a39]/5' : score100 >= 50 ? 'border-[#B45309]/25 bg-[#B45309]/5' : 'border-[#ba1a1a]/25 bg-[#ba1a1a]/5'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.badgeBg}`}>
            <span className="material-symbols-outlined text-white text-2xl">face_retouching_natural</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-on-surface mb-2">AI Dermatologist Recommendation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {score100 >= 75 && allergyConflicts.length === 0
                ? `${resultsData.product_name} appears well-suited for your ${skinType} skin type. No harmful ingredients or allergy conflicts detected. A patch test is still recommended before full use.`
                : score100 >= 50
                ? `${resultsData.product_name} has moderate suitability for your skin profile. ${allergyConflicts.length > 0 ? `${allergyConflicts.length} ingredient(s) conflict with your avoid list. ` : ''}Consider patch testing and consulting a dermatologist.`
                : `${resultsData.product_name} is NOT recommended for your skin profile. ${allergyConflicts.length > 0 ? `It contains ${allergyConflicts.length} ingredient(s) you are sensitive to. ` : ''}Multiple harmful or incompatible ingredients were detected. Please consult a dermatologist for a safer alternative.`
              }
            </p>
            <p className="text-[10px] text-on-surface-variant mt-3 italic">
              Guardian AI is an informational tool. Always perform a patch test and consult a licensed dermatologist.
            </p>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 text-[10px] text-on-surface-variant leading-relaxed text-center">
        {resultsData.disclaimer || 'COSMETIC DISCLAIMER: This analysis is for informational purposes only. Always perform a patch test before regular use and consult a dermatologist for personalized skincare advice.'}
      </div>
    </div>
  );
}
