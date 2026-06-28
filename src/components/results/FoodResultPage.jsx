import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────
   Helper: Score on 0–100 scale
───────────────────────────────────────── */
const toHundred = (score) => Math.round((parseFloat(score) || 0) * 10);

/* ─────────────────────────────────────────
   Helper: Colour theme based on score
───────────────────────────────────────── */
function getScoreTheme(score100) {
  if (score100 >= 75) return {
    ring: '#006a39', text: 'text-[#006a39]', bg: 'bg-[#006a39]/10',
    border: 'border-[#006a39]/20', badgeBg: 'bg-[#006a39]', badgeText: 'text-white',
    label: 'Safe', icon: 'check_circle', glow: 'shadow-[0_0_32px_rgba(0,106,57,0.18)]'
  };
  if (score100 >= 50) return {
    ring: '#B45309', text: 'text-[#B45309]', bg: 'bg-[#B45309]/10',
    border: 'border-[#B45309]/20', badgeBg: 'bg-[#B45309]', badgeText: 'text-white',
    label: 'Use Occasionally', icon: 'gpp_maybe', glow: 'shadow-[0_0_32px_rgba(180,83,9,0.16)]'
  };
  return {
    ring: '#ba1a1a', text: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10',
    border: 'border-[#ba1a1a]/20', badgeBg: 'bg-[#ba1a1a]', badgeText: 'text-white',
    label: 'Avoid', icon: 'dangerous', glow: 'shadow-[0_0_32px_rgba(186,26,26,0.18)]'
  };
}

/* ─────────────────────────────────────────
   Helper: Ingredient risk classification
───────────────────────────────────────── */
function classifyIngredient(name, flags) {
  const n = name.toLowerCase();
  const flagged = flags?.some(f => f.message?.toLowerCase().includes(n));
  if (flagged) return 'high';
  if (/sugar|fructose|syrup|dextrose|maltose|dye|red\s*\d|blue\s*\d|yellow\s*\d|bht|bha|nitrate|benzoate|aspartame|saccharin|msg|glutamate|carrageenan|vanillin|artificial/i.test(n)) return 'moderate';
  if (/palm oil|soy lecithin|salt|sodium|caffeine|colorin/i.test(n)) return 'moderate';
  return 'safe';
}

const RISK_CONFIG = {
  high:     { color: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10', border: 'border-[#ba1a1a]/25', dot: 'bg-[#ba1a1a]', label: 'High Risk', emoji: '🔴' },
  moderate: { color: 'text-[#B45309]', bg: 'bg-[#B45309]/10', border: 'border-[#B45309]/25', dot: 'bg-[#B45309]', label: 'Moderate',  emoji: '🟠' },
  safe:     { color: 'text-[#006a39]', bg: 'bg-[#006a39]/10', border: 'border-[#006a39]/25', dot: 'bg-[#006a39]', label: 'Safe',      emoji: '🟢' },
};

/* ─────────────────────────────────────────
   Helper: Nutrient bar
───────────────────────────────────────── */
function NutrientBar({ label, value, unit, max, level }) {
  const pct = Math.min(100, (parseFloat(value) / max) * 100) || 0;
  const barColor = level === 'high' ? 'bg-[#ba1a1a]' : level === 'medium' ? 'bg-[#B45309]' : 'bg-[#006a39]';
  const textColor = level === 'high' ? 'text-[#ba1a1a]' : level === 'medium' ? 'text-[#B45309]' : 'text-[#006a39]';
  const badgeBg = level === 'high' ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' : level === 'medium' ? 'bg-[#B45309]/10 text-[#B45309]' : 'bg-[#006a39]/10 text-[#006a39]';
  const lvlLabel = level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface">{value ? `${value}${unit}` : '—'}</span>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>{lvlLabel}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Profile Match Row
───────────────────────────────────────── */
function ProfileMatchRow({ icon, condition, verdict, detail, severity }) {
  const isWarn = severity === 'danger';
  const isCaution = severity === 'caution';
  const isOk = !isWarn && !isCaution;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
      isWarn ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/20' :
      isCaution ? 'bg-[#B45309]/5 border-[#B45309]/20' :
      'bg-[#006a39]/5 border-[#006a39]/20'
    }`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isWarn ? 'bg-[#ba1a1a]/15' : isCaution ? 'bg-[#B45309]/15' : 'bg-[#006a39]/15'
      }`}>
        <span className={`material-symbols-outlined text-[18px] ${
          isWarn ? 'text-[#ba1a1a]' : isCaution ? 'text-[#B45309]' : 'text-[#006a39]'
        }`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface">{condition}</span>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isWarn ? 'bg-[#ba1a1a] text-white' : isCaution ? 'bg-[#B45309] text-white' : 'bg-[#006a39] text-white'
          }`}>{verdict}</span>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Allergy Alert Card
───────────────────────────────────────── */
function AllergyCard({ allergen, detected, icon }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
      detected
        ? 'bg-[#ba1a1a]/8 border-[#ba1a1a]/40 shadow-[0_2px_12px_rgba(186,26,26,0.12)]'
        : 'bg-surface-container border-outline-variant/20 opacity-50'
    }`}>
      <span className="text-2xl">{icon}</span>
      <span className={`text-[10px] font-extrabold uppercase tracking-wider text-center ${detected ? 'text-[#ba1a1a]' : 'text-on-surface-variant'}`}>
        {allergen}
      </span>
      {detected && (
        <span className="text-[8px] font-extrabold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
          ⚠ CONTAINS
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function FoodResultPage({ resultsData, switchView, userProfile, apiSettings }) {
  const [scoreCount, setScoreCount] = useState(0);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ nutrition: true, ingredients: true, profile: true, allergy: true, proscons: true, alternatives: true });

  const score100 = toHundred(resultsData?.safety_score);
  const theme = getScoreTheme(score100);

  // Score counter animation
  useEffect(() => {
    setScoreCount(0);
    const duration = 1200;
    const steps = 60;
    const inc = score100 / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= score100) { setScoreCount(score100); clearInterval(t); }
      else setScoreCount(Math.round(cur));
    }, duration / steps);
    return () => clearInterval(t);
  }, [score100]);

  if (!resultsData) return null;

  const ingredients = resultsData.extracted_ingredients || [];
  const flags = resultsData.compatibility_flags || [];
  const food = resultsData.food_details || {};
  const alts = resultsData.better_alternatives || [];

  // ── Confidence heuristic ──
  const confidence = score100 >= 75 ? 96 : score100 >= 50 ? 87 : 79;

  // ── Nutrition data ──
  const nutrition = resultsData.nutrition || {};
  const nutrientRows = [
    { label: 'Calories',      value: nutrition.calories,       unit: ' kcal', max: 500,  level: parseFloat(nutrition.calories) > 300 ? 'high' : parseFloat(nutrition.calories) > 150 ? 'medium' : 'low' },
    { label: 'Protein',       value: nutrition.protein,        unit: 'g',     max: 50,   level: parseFloat(nutrition.protein) >= 15 ? 'low' : 'medium' },
    { label: 'Carbohydrates', value: nutrition.carbs,          unit: 'g',     max: 100,  level: parseFloat(nutrition.carbs) > 60 ? 'high' : parseFloat(nutrition.carbs) > 30 ? 'medium' : 'low' },
    { label: 'Total Sugar',   value: nutrition.sugar,          unit: 'g',     max: 50,   level: food.sugar_analysis === 'High' ? 'high' : food.sugar_analysis === 'Medium' ? 'medium' : 'low' },
    { label: 'Total Fat',     value: nutrition.fat,            unit: 'g',     max: 30,   level: food.fat_analysis === 'High' ? 'high' : food.fat_analysis === 'Medium' ? 'medium' : 'low' },
    { label: 'Saturated Fat', value: nutrition.saturated_fat,  unit: 'g',     max: 20,   level: parseFloat(nutrition.saturated_fat) > 5 ? 'high' : 'low' },
    { label: 'Trans Fat',     value: nutrition.trans_fat,      unit: 'g',     max: 5,    level: parseFloat(nutrition.trans_fat) > 0.5 ? 'high' : 'low' },
    { label: 'Dietary Fiber', value: nutrition.fiber,          unit: 'g',     max: 10,   level: parseFloat(nutrition.fiber) >= 5 ? 'low' : 'medium' },
    { label: 'Sodium',        value: nutrition.sodium,         unit: 'mg',    max: 2000, level: food.sodium_analysis === 'High' ? 'high' : food.sodium_analysis === 'Medium' ? 'medium' : 'low' },
    { label: 'Potassium',     value: nutrition.potassium,      unit: 'mg',    max: 4700, level: parseFloat(nutrition.potassium) > 2000 ? 'medium' : 'low' },
  ];

  // ── Allergy detection ──
  const ingrText = ingredients.join(' ').toLowerCase();
  const allergenMap = [
    { name: 'Milk / Dairy', icon: '🥛', keywords: ['milk','dairy','whey','casein','lactose','cream','butter'] },
    { name: 'Gluten / Wheat', icon: '🌾', keywords: ['wheat','gluten','barley','rye','oat'] },
    { name: 'Soy',          icon: '🫘', keywords: ['soy','soya','lecithin'] },
    { name: 'Peanuts',      icon: '🥜', keywords: ['peanut','groundnut'] },
    { name: 'Eggs',         icon: '🥚', keywords: ['egg','albumin'] },
    { name: 'Tree Nuts',    icon: '🌰', keywords: ['almond','cashew','walnut','pecan','hazelnut','pistachio','tree nut'] },
    { name: 'Fish',         icon: '🐟', keywords: ['fish','cod','salmon','tuna','anchovy'] },
    { name: 'Shellfish',    icon: '🦐', keywords: ['shellfish','shrimp','crab','lobster','prawn'] },
    { name: 'Sesame',       icon: '🌿', keywords: ['sesame','tahini'] },
  ];
  const detectedAllergens = allergenMap.map(a => ({
    ...a, detected: a.keywords.some(k => ingrText.includes(k))
  }));

  // ── Profile Match ──
  const profile = userProfile || {};
  const conditions = profile.medical_profile?.conditions || {};
  const goals = profile.dietary_goals || {};
  const skinConcerns = profile.skin_profile?.skin_concerns || [];
  const hasSugar = ingrText.includes('sugar') || ingrText.includes('fructose') || ingrText.includes('syrup');
  const hasSodium = ingrText.includes('salt') || ingrText.includes('sodium');
  const hasHighFat = food.fat_analysis === 'High';
  const hasMilk = detectedAllergens.find(a => a.name === 'Milk / Dairy')?.detected;
  const hasPeanut = detectedAllergens.find(a => a.name === 'Peanuts')?.detected;
  const hasGluten = detectedAllergens.find(a => a.name === 'Gluten / Wheat')?.detected;
  const hasSoy = detectedAllergens.find(a => a.name === 'Soy')?.detected;
  const hasMeat = ingrText.includes('beef') || ingrText.includes('pork') || ingrText.includes('chicken') || ingrText.includes('meat') || ingrText.includes('fish') || ingrText.includes('gelatin');
  const hasMeatOrEgg = hasMeat || (ingrText.includes('egg') && !ingrText.includes('eggfree'));
  const dietPref = profile.dietaryPreference || profile.dietary_preference || 'non-vegetarian';
  const isVeg = dietPref === 'vegetarian' || dietPref === 'vegan';
  const isVegan = dietPref === 'vegan';
  const userHasNutAllergy = goals.nut_free || (profile.allergies || '').toLowerCase().includes('peanut') || (profile.allergies || '').toLowerCase().includes('nut');
  const userHasDairyAllergy = goals.dairy_free || (profile.allergies || '').toLowerCase().includes('milk') || (profile.allergies || '').toLowerCase().includes('dairy');
  const userHasGlutenFree = goals.gluten_free || (profile.allergies || '').toLowerCase().includes('wheat') || (profile.allergies || '').toLowerCase().includes('gluten');
  const userHasSoyFree = goals.soy_free;

  const profileMatches = [
    conditions.diabetes && { icon: 'glucose', condition: 'You have Diabetes', verdict: hasSugar ? 'High Sugar Warning' : 'Diabetic Safe', detail: hasSugar ? 'This product contains high sugar content which can spike blood glucose levels. Consult your diabetologist before consuming.' : 'No significant sugar compounds detected. Compatible with diabetic dietary management.', severity: hasSugar ? 'danger' : 'ok' },
    conditions.hypertension && { icon: 'monitor_heart', condition: 'You have Hypertension', verdict: hasSodium ? 'High Sodium Warning' : 'BP Safe', detail: hasSodium ? 'Elevated sodium content detected. Regular consumption can raise blood pressure and counteract hypertension medication.' : 'Sodium levels appear manageable. Low risk for blood pressure elevation.', severity: hasSodium ? 'danger' : 'ok' },
    conditions.kidney_disease && { icon: 'nephrology', condition: 'You have Kidney Disease', verdict: nutrition.potassium > 400 ? 'High Potassium Risk' : 'Kidney Manageable', detail: nutrition.potassium > 400 ? 'Elevated potassium can accumulate in impaired kidneys causing dangerous hyperkalemia. Avoid or restrict serving.' : 'Potassium within safer range for kidney-impaired individuals.', severity: nutrition.potassium > 400 ? 'danger' : 'ok' },
    (goals.weight_loss || profile.health_goals?.weight_loss) && { icon: 'monitor_weight', condition: 'Your Goal: Weight Loss', verdict: (hasSugar || hasHighFat) ? 'Not Recommended' : 'Supports Goal', detail: (hasSugar || hasHighFat) ? 'High sugar and fat content will impede caloric deficit. Poor match for weight loss goals.' : 'Low sugar and fat profile. Supports caloric control and weight management.', severity: (hasSugar || hasHighFat) ? 'danger' : 'ok' },
    userHasNutAllergy && hasPeanut && { icon: 'warning', condition: 'Peanut Allergy Detected', verdict: 'Contains Peanuts', detail: 'This product contains peanuts or peanut oil. AVOID — anaphylaxis risk for allergic individuals.', severity: 'danger' },
    userHasDairyAllergy && hasMilk && { icon: 'warning', condition: 'Milk Allergy Detected', verdict: 'Contains Dairy', detail: 'Dairy ingredients detected. This product is incompatible with your milk allergy profile.', severity: 'danger' },
    userHasGlutenFree && hasGluten && { icon: 'grain', condition: 'Gluten-Free Preference', verdict: 'Contains Gluten', detail: 'Wheat or gluten-derived ingredients detected. Not suitable for gluten-free diet.', severity: 'danger' },
    userHasSoyFree && hasSoy && { icon: 'eco', condition: 'Soy-Free Preference', verdict: 'Contains Soy', detail: 'Soy lecithin or soy derivatives detected. Not suitable for soy-free diet.', severity: 'caution' },
    isVeg && hasMeat && { icon: 'no_meals', condition: `You are ${isVegan ? 'Vegan' : 'Vegetarian'}`, verdict: 'Not Vegetarian', detail: 'This product contains meat, fish, or gelatin-derived ingredients — incompatible with your dietary preference.', severity: 'danger' },
    !isVeg && !hasMeatOrEgg && { icon: 'check_circle', condition: 'Non-Vegetarian Eater', verdict: 'No Meat Detected', detail: 'No meat or meat derivatives found in ingredient list.', severity: 'ok' },
    skinConcerns.includes('acne') && hasSugar && { icon: 'face', condition: 'Your Skin Goal: Acne Reduction', verdict: 'Sugar May Trigger Acne', detail: 'High glycemic foods increase insulin, triggering excess sebum and inflammatory acne breakouts.', severity: 'caution' },
    conditions.heart_disease && hasHighFat && { icon: 'cardiology', condition: 'You have Heart Disease', verdict: 'High Fat Warning', detail: 'Saturated and trans fats increase LDL cholesterol, increasing cardiovascular risk.', severity: 'danger' },
  ].filter(Boolean);

  // ── Pros & Cons ──
  const pros = [
    ...(food.diabetes_friendly ? ['Diabetic Safe — low sugar'] : []),
    ...(food.weight_loss_friendly ? ['Low Calorie — supports weight control'] : []),
    ...((parseFloat(nutrition.protein) >= 10) ? [`Good Protein Source — ${nutrition.protein}g`] : []),
    ...((parseFloat(nutrition.fiber) >= 5) ? [`High Fiber — ${nutrition.fiber}g`] : []),
    ...(food.fat_analysis === 'Low' ? ['Low Fat — heart friendly'] : []),
    ...(ingredients.some(i => /vitamin|mineral|calcium|iron|zinc|magnesium/i.test(i)) ? ['Contains vitamins & minerals'] : []),
  ];
  const cons = [
    ...(food.sugar_analysis === 'High' ? ['High Sugar — diabetes & weight risk'] : []),
    ...(food.fat_analysis === 'High' ? ['High Fat — cardiovascular concern'] : []),
    ...(food.sodium_analysis === 'High' ? ['High Sodium — hypertension risk'] : []),
    ...(food.harmful_additives?.length > 0 ? [`Harmful Additives: ${food.harmful_additives.slice(0,2).join(', ')}`] : []),
    ...(ingredients.some(i => /artificial color|red dye|yellow\s*\d|blue\s*\d/i.test(i)) ? ['Artificial Colors — WHO watchlist'] : []),
    ...(ingredients.some(i => /palm oil/i.test(i)) ? ['Palm Oil — environmental & health concern'] : []),
    ...(ingredients.some(i => /preservative|benzoate|nitrate/i.test(i)) ? ['Contains Preservatives'] : []),
  ];

  // ── Final verdict ──
  let verdict = 'OCCASIONALLY';
  let verdictDetail = 'This product has mixed nutritional value. Consume in moderation and be aware of your health conditions.';
  let verdictColor = 'bg-[#B45309]';
  if (score100 >= 75 && flags.length === 0) {
    verdict = 'YES'; verdictColor = 'bg-[#006a39]';
    verdictDetail = 'This product is generally compatible with your health profile. Safe to consume as part of a balanced diet.';
  } else if (score100 < 45 || flags.some(f => f.flag_type === 'Danger' || f.flag_type === 'danger')) {
    verdict = 'NO'; verdictColor = 'bg-[#ba1a1a]';
    verdictDetail = 'This product poses significant risks for your health profile. Multiple critical flags were raised — avoid or consult your doctor.';
  }

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

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
        <div className="absolute inset-0 bg-gradient-to-br from-[#006a39]/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
          {/* Product image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/20 shadow-sm">
              <img
                src={resultsData.image || '/cereal_label.png'}
                alt={resultsData.product_name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/cereal_label.png'; }}
              />
            </div>
          </div>
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#006a39]/10 text-[#006a39] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[12px]">restaurant</span>
                Food Guardian
              </span>
              {resultsData.category && (
                <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {resultsData.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight mb-1">
              {resultsData.product_name || 'Unknown Product'}
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mb-3">
              {resultsData.brand_name || 'Unknown Brand'}
            </p>
            <div className="flex flex-wrap gap-2">
              {resultsData.barcode && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px]">barcode</span>
                  {resultsData.barcode}
                </span>
              )}
              {resultsData.brand_name && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px]">storefront</span>
                  {resultsData.brand_name}
                </span>
              )}
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 sm:flex-col sm:items-end">
            <button onClick={() => switchView('scan')} className="border border-outline px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-white">
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span className="hidden sm:inline">Scan Another</span>
            </button>
            <button onClick={() => alert('Report shared')} className="bg-[#006a39] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer border-none shadow-sm">
              <span className="material-symbols-outlined text-[15px]">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI SCORE + QUICK SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Score Ring Card */}
        <div className={`md:col-span-2 bg-white rounded-3xl p-6 border ${theme.border} ${theme.glow} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: theme.ring }} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">AI Safety Score</span>

          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#ebeef4" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={theme.ring} strokeWidth="10" strokeLinecap="round"
                style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold leading-none" style={{ color: theme.ring }}>{scoreCount}</span>
              <span className="text-[9px] text-on-surface-variant font-bold mt-0.5">/ 100</span>
            </div>
          </div>

          <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-2 ${theme.badgeBg} ${theme.badgeText}`}>
            <span className="material-symbols-outlined text-[13px] mr-1 align-middle">{theme.icon}</span>
            {theme.label}
          </span>

          <div className="flex gap-3 w-full mt-3">
            <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Confidence</p>
              <p className={`text-base font-extrabold ${theme.text}`}>{confidence}%</p>
            </div>
            <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 text-center">
              <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Risk Level</p>
              <p className={`text-base font-extrabold ${score100 >= 75 ? 'text-[#006a39]' : score100 >= 50 ? 'text-[#B45309]' : 'text-[#ba1a1a]'}`}>
                {score100 >= 75 ? 'Low' : score100 >= 50 ? 'Medium' : 'High'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary + Flags */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* Summary banner */}
          <div className={`${theme.bg} ${theme.border} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-xl" style={{ color: theme.ring }}>smart_toy</span>
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: theme.ring }}>AI Quick Summary</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed font-medium">
              {resultsData.analysis_summary || 'Analysis complete. Review the sections below for detailed insights.'}
            </p>
          </div>

          {/* Compatibility flags */}
          {flags.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-outline-variant/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Profile Flags</p>
              <div className="flex flex-col gap-2">
                {flags.map((f, i) => {
                  const isDanger = ['danger','critical'].includes(f.flag_type?.toLowerCase());
                  return (
                    <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl ${isDanger ? 'bg-[#ba1a1a]/8 border border-[#ba1a1a]/20' : 'bg-[#B45309]/8 border border-[#B45309]/20'}`}>
                      <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${isDanger ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>
                        {isDanger ? 'dangerous' : 'warning'}
                      </span>
                      <span className={`text-xs font-semibold leading-snug ${isDanger ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>{f.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── NUTRITION ANALYSIS ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('nutrition')} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006a39]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006a39] text-xl">nutrition</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Nutrition Analysis</h2>
              <p className="text-[10px] text-on-surface-variant">Per serving breakdown with risk levels</p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedSections.nutrition ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
        {expandedSections.nutrition && (
          <div className="px-5 pb-5 border-t border-outline-variant/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4">
              {nutrientRows.map((n, i) => (
                <NutrientBar key={i} {...n} />
              ))}
            </div>
            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-outline-variant/20">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${food.diabetes_friendly ? 'bg-[#006a39]/10 text-[#006a39]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                {food.diabetes_friendly ? '✓ Diabetes Friendly' : '✗ Not Diabetes Friendly'}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${food.weight_loss_friendly ? 'bg-[#006a39]/10 text-[#006a39]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                {food.weight_loss_friendly ? '✓ Weight Loss Friendly' : '✗ Not Weight Loss Friendly'}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${food.sugar_analysis !== 'High' ? 'bg-[#006a39]/10 text-[#006a39]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                Sugar: {food.sugar_analysis || 'Low'}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${food.sodium_analysis !== 'High' ? 'bg-[#006a39]/10 text-[#006a39]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                Sodium: {food.sodium_analysis || 'Low'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── INGREDIENT ANALYSIS ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('ingredients')} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">science</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Ingredient Analysis</h2>
              <p className="text-[10px] text-on-surface-variant">{ingredients.length} ingredients extracted and classified</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 hidden sm:flex">
              <span className="text-[9px] font-bold bg-[#ba1a1a]/10 text-[#ba1a1a] px-2 py-0.5 rounded-full">{ingredients.filter(i => classifyIngredient(i, flags) === 'high').length} High Risk</span>
              <span className="text-[9px] font-bold bg-[#B45309]/10 text-[#B45309] px-2 py-0.5 rounded-full">{ingredients.filter(i => classifyIngredient(i, flags) === 'moderate').length} Moderate</span>
              <span className="text-[9px] font-bold bg-[#006a39]/10 text-[#006a39] px-2 py-0.5 rounded-full">{ingredients.filter(i => classifyIngredient(i, flags) === 'safe').length} Safe</span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedSections.ingredients ? 'rotate-180' : ''}`}>expand_more</span>
          </div>
        </button>
        {expandedSections.ingredients && (
          <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, idx) => {
                const risk = classifyIngredient(ing, flags);
                const rc = RISK_CONFIG[risk];
                const isOpen = expandedIngredient === idx;
                return (
                  <div key={idx} className={`rounded-xl border overflow-hidden ${rc.border}`}>
                    <div
                      onClick={() => setExpandedIngredient(isOpen ? null : idx)}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:brightness-95 transition-all ${rc.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rc.dot}`} />
                        <span className="text-xs font-semibold text-on-surface">{ing}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider ${rc.color}`}>{rc.emoji} {rc.label}</span>
                        <span className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 py-3 bg-white border-t border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed animate-[fadeIn_0.2s_ease]">
                        {risk === 'high' && <p><strong className="text-[#ba1a1a]">⚠ High Risk:</strong> This ingredient has been flagged as harmful or allergenic based on your health profile. Consider avoiding products with this ingredient.</p>}
                        {risk === 'moderate' && <p><strong className="text-[#B45309]">⚡ Moderate:</strong> This ingredient is generally safe in small amounts but can pose risks in excess or for specific health conditions.</p>}
                        {risk === 'safe' && <p><strong className="text-[#006a39]">✓ Safe:</strong> This ingredient is considered generally safe and no flags were raised against your health profile.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── HEALTH PROFILE MATCHING ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('profile')} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-xl">person_check</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Health Profile Matching</h2>
              <p className="text-[10px] text-on-surface-variant">Personalized analysis based on your medical & dietary profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profileMatches.filter(m => m.severity === 'danger').length > 0 && (
              <span className="text-[9px] font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full">{profileMatches.filter(m => m.severity === 'danger').length} warnings</span>
            )}
            <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedSections.profile ? 'rotate-180' : ''}`}>expand_more</span>
          </div>
        </button>
        {expandedSections.profile && (
          <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">
            {profileMatches.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-[#006a39]/5 rounded-2xl border border-[#006a39]/20">
                <span className="material-symbols-outlined text-[#006a39] text-2xl">verified</span>
                <div>
                  <p className="text-sm font-bold text-[#006a39]">Fully Compatible</p>
                  <p className="text-xs text-on-surface-variant">No conflicts detected with your health profile.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {profileMatches.map((m, i) => <ProfileMatchRow key={i} {...m} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ALLERGY ALERTS ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('allergy')} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ba1a1a]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ba1a1a] text-xl">emergency</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Allergy Alerts</h2>
              <p className="text-[10px] text-on-surface-variant">
                {detectedAllergens.filter(a => a.detected).length > 0
                  ? `⚠ ${detectedAllergens.filter(a => a.detected).length} allergen(s) detected`
                  : 'No major allergens detected'}
              </p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedSections.allergy ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
        {expandedSections.allergy && (
          <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">
            {detectedAllergens.some(a => a.detected) && (
              <div className="flex items-center gap-2 p-3 bg-[#ba1a1a]/8 border border-[#ba1a1a]/25 rounded-2xl mb-4 animate-pulse">
                <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
                <p className="text-xs font-bold text-[#ba1a1a]">Allergens detected! Check carefully if you have any food allergies.</p>
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {detectedAllergens.map((a, i) => <AllergyCard key={i} {...a} allergen={a.name} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── PROS & CONS ── */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('proscons')} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">balance</span>
            </div>
            <h2 className="text-sm font-extrabold text-on-surface">Pros &amp; Cons</h2>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedSections.proscons ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
        {expandedSections.proscons && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border-t border-outline-variant/20">
            <div className="p-5 bg-[#006a39]/3">
              <h3 className="text-xs font-extrabold text-[#006a39] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">thumb_up</span> Pros
              </h3>
              {pros.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-on-surface">
                      <span className="w-4 h-4 rounded-full bg-[#006a39] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-on-surface-variant italic">No notable benefits identified.</p>}
            </div>
            <div className="p-5 bg-[#ba1a1a]/3 border-t sm:border-t-0 sm:border-l border-outline-variant/20">
              <h3 className="text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">thumb_down</span> Cons
              </h3>
              {cons.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-on-surface">
                      <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✗</span>
                      {c}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-on-surface-variant italic">No significant concerns identified.</p>}
            </div>
          </div>
        )}
      </div>

      {/* ── HEALTHIER ALTERNATIVES ── */}
      {alts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006a39]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006a39] text-xl">eco</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-on-surface">Healthier Alternatives</h2>
              <p className="text-[10px] text-on-surface-variant">Products better suited to your health profile</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alts.slice(0, 3).map((alt, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-outline-variant/30 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative">
                    <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" onError={e => { e.target.src = '/cereal_label.png'; }} />
                    <span className="absolute top-1 left-1 text-[8px] font-extrabold bg-[#006a39] text-white px-1.5 py-0.5 rounded-md">{alt.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-on-surface truncate">{alt.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{alt.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(alt.tags || []).map((t, i) => (
                    <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase tracking-wider">{t}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-extrabold text-[#006a39]">{alt.price}</span>
                  <button className="text-[10px] font-bold bg-[#006a39]/10 text-[#006a39] px-3 py-1 rounded-full hover:bg-[#006a39] hover:text-white transition-colors cursor-pointer border-none">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FINAL RECOMMENDATION ── */}
      <div className={`rounded-3xl p-6 border-2 ${verdict === 'YES' ? 'border-[#006a39]/30 bg-[#006a39]/5' : verdict === 'NO' ? 'border-[#ba1a1a]/30 bg-[#ba1a1a]/5' : 'border-[#B45309]/30 bg-[#B45309]/5'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${verdictColor} shadow-lg`}>
            <span className="text-white text-2xl sm:text-3xl font-black leading-none">{verdict}</span>
            <span className="text-white/80 text-[9px] uppercase tracking-widest mt-0.5">EAT?</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-on-surface mb-1.5">Should I Eat This?</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{verdictDetail}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-outline-variant/30 text-on-surface-variant">
                Safety Score: {score100}/100
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-outline-variant/30 text-on-surface-variant">
                {flags.length} flags raised
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 text-[10px] text-on-surface-variant leading-relaxed text-center">
        {resultsData.disclaimer || 'This AI analysis is for educational purposes only and does not replace professional medical or nutritional advice. Always verify labels and consult a healthcare professional.'}
      </div>
    </div>
  );
}
