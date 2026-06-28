import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────
   Helper: Score on 0–100 scale
───────────────────────────────────────── */
const toHundred = (score) => Math.round((parseFloat(score) || 0) * 10);

/* ─────────────────────────────────────────
   Helper: Score theme
───────────────────────────────────────── */
function getScoreTheme(score100) {
  if (score100 >= 75) return { ring: '#006a39', text: 'text-[#006a39]', bg: 'bg-[#006a39]/10', border: 'border-[#006a39]/25', badgeBg: 'bg-[#006a39]', label: 'Safe to Use', icon: 'check_circle', glow: 'shadow-[0_0_32px_rgba(0,106,57,0.18)]' };
  if (score100 >= 50) return { ring: '#B45309', text: 'text-[#B45309]', bg: 'bg-[#B45309]/10', border: 'border-[#B45309]/25', badgeBg: 'bg-[#B45309]', label: 'Doctor Advised', icon: 'gpp_maybe', glow: 'shadow-[0_0_32px_rgba(180,83,9,0.16)]' };
  return { ring: '#ba1a1a', text: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10', border: 'border-[#ba1a1a]/25', badgeBg: 'bg-[#ba1a1a]', label: 'Avoid', icon: 'dangerous', glow: 'shadow-[0_0_32px_rgba(186,26,26,0.18)]' };
}

/* ─────────────────────────────────────────
   Helper: Condition Safety Row
───────────────────────────────────────── */
function ConditionSafetyCard({ icon, condition, userHas, status, reason }) {
  if (!userHas && status === 'NA') return null;
  const isAvoid = status === 'avoid';
  const isCaution = status === 'caution';
  const isOk = !isAvoid && !isCaution;
  const label = isAvoid ? 'AVOID' : isCaution ? 'Doctor Advice' : 'Safe';
  return (
    <div className={`flex flex-col gap-2 p-4 rounded-2xl border ${isAvoid ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/25' : isCaution ? 'bg-[#B45309]/5 border-[#B45309]/25' : 'bg-[#006a39]/5 border-[#006a39]/25'} ${!userHas ? 'opacity-45' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-xl ${isAvoid ? 'text-[#ba1a1a]' : isCaution ? 'text-[#B45309]' : 'text-[#006a39]'}`}>{icon}</span>
          <span className="text-xs font-bold text-on-surface">{condition}</span>
        </div>
        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-white ${isAvoid ? 'bg-[#ba1a1a]' : isCaution ? 'bg-[#B45309]' : 'bg-[#006a39]'}`}>{label}</span>
      </div>
      {reason && <p className="text-[11px] text-on-surface-variant leading-relaxed">{reason}</p>}
      {!userHas && <p className="text-[10px] text-on-surface-variant italic">Not in your profile</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Warning Banner
───────────────────────────────────────── */
function WarningBanner({ icon, title, detail, type = 'warning' }) {
  const styles = {
    danger:  { bg: 'bg-[#ba1a1a]/8 border-[#ba1a1a]/30', text: 'text-[#ba1a1a]', icon: 'dangerous' },
    warning: { bg: 'bg-[#B45309]/8 border-[#B45309]/30', text: 'text-[#B45309]', icon: 'warning' },
    info:    { bg: 'bg-secondary/8 border-secondary/30',  text: 'text-secondary',  icon: 'info' },
    safe:    { bg: 'bg-[#006a39]/8 border-[#006a39]/30', text: 'text-[#006a39]',  icon: 'check_circle' },
  };
  const s = styles[type] || styles.warning;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${s.bg}`}>
      <span className={`material-symbols-outlined text-xl flex-shrink-0 ${s.text}`}>{icon || s.icon}</span>
      <div>
        <p className={`text-xs font-extrabold ${s.text}`}>{title}</p>
        {detail && <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helper: Collapsible Section
───────────────────────────────────────── */
function Section({ icon, iconColor, title, subtitle, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-transparent border-none text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor || 'bg-secondary/10'}`}>
            <span className={`material-symbols-outlined text-xl ${iconColor ? '' : 'text-secondary'}`} style={iconColor?.startsWith('#') ? { color: iconColor } : {}}>{icon}</span>
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
export default function MedicineResultPage({ resultsData, switchView, userProfile, apiSettings }) {
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

  const med = resultsData.medicine_details || {};
  const flags = resultsData.compatibility_flags || [];
  const alts = resultsData.better_alternatives || [];
  const ingredients = resultsData.extracted_ingredients || [];

  const profile = userProfile || {};
  const conditions = profile.medical_profile?.conditions || {};
  const currentMeds = (() => {
    const m = profile.medical_profile?.current_medications;
    if (Array.isArray(m)) return m;
    if (typeof m === 'string') return m.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  })();

  // Ingredient checks
  const ingrText = ingredients.join(' ').toLowerCase();
  const isNsaid = /aspirin|ibuprofen|naproxen|ketoprofen/i.test(ingrText);
  const isMetformin = /metformin/i.test(ingrText) || (resultsData.product_name || '').toLowerCase().includes('metformin');
  const hasCaffeine = /caffeine/i.test(ingrText);
  const hasAcetaminophen = /acetaminophen|paracetamol/i.test(ingrText);
  const isSteroid = /cortisone|dexamethasone|prednisone|betamethasone/i.test(ingrText);
  const isBloodThinner = /warfarin|heparin|aspirin|clopidogrel/i.test(ingrText);
  const hasSedative = /diazepam|lorazepam|alprazolam|clonazepam|zolpidem/i.test(ingrText);

  // Medicine type detection
  const typeRaw = resultsData.medicine_type || '';
  const medicineForms = ['Tablet','Capsule','Syrup','Injection','Cream','Gel','Drops','Inhaler','Patch','Suspension'];
  const detectedForm = medicineForms.find(f => ingrText.includes(f.toLowerCase()) || (resultsData.product_name || '').toLowerCase().includes(f.toLowerCase()) || typeRaw.toLowerCase().includes(f.toLowerCase())) || 'Tablet';

  // Confidence heuristic
  const confidence = score100 >= 75 ? 94 : score100 >= 50 ? 86 : 78;

  // ── Per-condition safety matrix ──
  const conditionMatrix = [
    {
      icon: 'nephrology', condition: 'Kidney Disease', userHas: !!conditions.kidney_disease,
      status: conditions.kidney_disease && (isNsaid || isMetformin) ? 'avoid' : conditions.kidney_disease ? 'caution' : 'ok',
      reason: isNsaid ? 'NSAIDs reduce renal blood flow and are nephrotoxic. Contraindicated in kidney disease.' : isMetformin ? 'Metformin accumulates in renal impairment causing lactic acidosis risk.' : 'No direct renal contraindication detected for this medicine.'
    },
    {
      icon: 'cardiology', condition: 'Heart Disease', userHas: !!conditions.heart_disease,
      status: conditions.heart_disease && (isNsaid || isSteroid) ? 'avoid' : conditions.heart_disease && (hasCaffeine || isBloodThinner) ? 'caution' : 'ok',
      reason: isNsaid && conditions.heart_disease ? 'NSAIDs increase sodium retention, fluid overload and worsen heart failure.' : conditions.heart_disease ? 'Consult cardiologist before use. Monitor cardiac parameters.' : 'No cardiac contraindication detected.'
    },
    {
      icon: 'pulmonology', condition: 'Asthma', userHas: !!conditions.asthma,
      status: conditions.asthma && isNsaid ? 'avoid' : conditions.asthma ? 'caution' : 'ok',
      reason: isNsaid && conditions.asthma ? 'Aspirin-exacerbated respiratory disease (AERD): NSAIDs can trigger severe bronchospasm in asthma patients.' : conditions.asthma ? 'Monitor respiratory function. Some medicines may affect bronchodilation.' : 'No pulmonary contraindication detected.'
    },
    {
      icon: 'pregnant_woman', condition: 'Pregnancy', userHas: !!conditions.pregnancy,
      status: conditions.pregnancy && isNsaid ? 'avoid' : conditions.pregnancy ? 'caution' : 'ok',
      reason: isNsaid && conditions.pregnancy ? 'NSAIDs contraindicated in pregnancy — risk of premature closure of fetal ductus arteriosus in 3rd trimester.' : conditions.pregnancy ? 'Consult your OB/GYN before taking any medication during pregnancy.' : 'Not applicable to your profile.'
    },
    {
      icon: 'glucose', condition: 'Diabetes', userHas: !!conditions.diabetes,
      status: conditions.diabetes && isSteroid ? 'avoid' : conditions.diabetes && (hasCaffeine || isNsaid) ? 'caution' : 'ok',
      reason: isSteroid && conditions.diabetes ? 'Corticosteroids cause hyperglycemia and insulin resistance — serious risk for diabetics.' : conditions.diabetes ? 'Monitor blood sugar levels. Some medicines affect glucose metabolism.' : 'No diabetic interaction detected.'
    },
    {
      icon: 'monitor_heart', condition: 'Hypertension', userHas: !!conditions.hypertension,
      status: conditions.hypertension && (isNsaid || hasCaffeine) ? 'caution' : 'ok',
      reason: isNsaid && conditions.hypertension ? 'NSAIDs cause sodium/water retention and reduce efficacy of antihypertensive drugs.' : hasCaffeine && conditions.hypertension ? 'Caffeine raises blood pressure acutely. Use with caution.' : 'No significant blood pressure interaction detected.'
    },
    {
      icon: 'gastroenterology', condition: 'Liver Disease', userHas: !!(conditions.liver_disease || conditions.fatty_liver),
      status: (conditions.liver_disease || conditions.fatty_liver) && hasAcetaminophen ? 'avoid' : (conditions.liver_disease || conditions.fatty_liver) ? 'caution' : 'ok',
      reason: hasAcetaminophen && (conditions.liver_disease || conditions.fatty_liver) ? 'Acetaminophen is hepatotoxic in liver disease — even normal doses can cause acute liver failure.' : (conditions.liver_disease || conditions.fatty_liver) ? 'Hepatic metabolism may be impaired. Consult hepatologist.' : 'No hepatic contraindication detected.'
    },
    {
      icon: 'endocrinology', condition: 'Thyroid', userHas: !!conditions.thyroid,
      status: conditions.thyroid && (isSteroid || hasSedative) ? 'caution' : 'ok',
      reason: conditions.thyroid ? 'Some medications can interfere with thyroid hormone levels. Discuss with your endocrinologist.' : 'No thyroid interaction detected.'
    },
    {
      icon: 'fertility', condition: 'PCOS', userHas: !!conditions.pcos,
      status: conditions.pcos && isSteroid ? 'caution' : 'ok',
      reason: conditions.pcos && isSteroid ? 'Steroids can worsen insulin resistance and androgenic symptoms in PCOS.' : conditions.pcos ? 'Some medicines affect hormonal balance relevant to PCOS management.' : 'No PCOS-specific interaction detected.'
    },
  ];

  // Driving warning
  const isDrivingRisk = hasSedative || /antihistamine|cetirizine|loratadine|diphenhydramine/i.test(ingrText);
  // Alcohol interaction
  const isAlcoholRisk = hasAcetaminophen || hasSedative || /metronidazole|tinidazole/i.test(ingrText);
  // Food interaction
  const hasFoodInteraction = /warfarin|metronidazole|tetracycline|ciprofloxacin|thyroid/i.test(ingrText);

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
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/20 shadow-sm">
              <img src={resultsData.image || '/medicine_label.png'} alt={resultsData.product_name} className="w-full h-full object-cover" onError={e => { e.target.src = '/medicine_label.png'; }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined text-[12px]">medication</span>
                Medicine Guardian
              </span>
              {/* Medicine type badge */}
              <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {detectedForm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight mb-0.5">
              {resultsData.product_name || 'Unknown Medicine'}
            </h1>
            <p className="text-sm text-on-surface-variant font-medium">{resultsData.brand_name || 'Unknown Brand'}</p>
            {resultsData.generic_name && (
              <p className="text-xs text-secondary font-semibold mt-0.5">Generic: {resultsData.generic_name}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {med.strength && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-secondary/10 text-secondary px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[13px]">scale</span>
                  Strength: {med.strength}
                </span>
              )}
              {resultsData.manufacturer && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px]">factory</span>
                  {resultsData.manufacturer}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col sm:items-end">
            <button onClick={() => switchView('scan')} className="border border-outline px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-white">
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span className="hidden sm:inline">Scan Another</span>
            </button>
            <button onClick={() => alert('Report shared')} className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer border-none shadow-sm">
              <span className="material-symbols-outlined text-[15px]">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI SCORE + SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Score ring */}
        <div className={`md:col-span-2 bg-white rounded-3xl p-6 border ${theme.border} ${theme.glow} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: theme.ring }} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">AI Safety Score</span>
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
              <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Flags</p>
              <p className={`text-base font-extrabold ${flags.length > 0 ? 'text-[#ba1a1a]' : 'text-[#006a39]'}`}>{flags.length}</p>
            </div>
          </div>
        </div>

        {/* Summary + flags */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className={`${theme.bg} ${theme.border} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-xl" style={{ color: theme.ring }}>smart_toy</span>
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: theme.ring }}>AI Medical Summary</span>
            </div>
            <p className="text-sm text-on-surface leading-relaxed font-medium">
              {resultsData.analysis_summary || 'Medicine analysis complete. Review sections below for detailed safety information.'}
            </p>
          </div>
          {/* Current medications warning */}
          {currentMeds.length > 0 && (
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Your Current Medications</p>
              <div className="flex flex-wrap gap-1.5">
                {currentMeds.map((m, i) => (
                  <span key={i} className="text-xs font-semibold bg-secondary/10 text-secondary px-2.5 py-1 rounded-lg capitalize">{m}</span>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2">Drug interactions checked against these medications.</p>
            </div>
          )}
          {flags.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-outline-variant/30 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Critical Flags</p>
              {flags.slice(0, 4).map((f, i) => {
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

      {/* ── MEDICINE PURPOSE ── */}
      <Section icon="medical_information" iconColor="bg-secondary/10" title="Medicine Purpose" subtitle="What this medicine treats">
        {med.uses?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {med.uses.map((use, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary/8 text-secondary border border-secondary/20 px-3 py-1.5 rounded-xl">
                <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                {use}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">No usage information available for this medicine.</p>
        )}
      </Section>

      {/* ── DOSAGE ── */}
      <Section icon="schedule" iconColor="bg-[#006a39]/10" title="Dosage Guidelines" subtitle="Recommended dosage by patient group">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Adults', icon: 'person', dose: resultsData.dosage_adult || med.dosage_adult || (med.strength ? `${med.strength} — as directed by physician` : 'As directed by physician'), detail: 'Standard adult dosage' },
            { label: 'Children', icon: 'child_care', dose: resultsData.dosage_child || med.dosage_child || 'Consult pediatrician', detail: 'Weight-based dosing required' },
            { label: 'Elderly (65+)', icon: 'elderly', dose: resultsData.dosage_elderly || med.dosage_elderly || 'Reduced dose — consult doctor', detail: 'Renal/hepatic clearance reduced' },
          ].map((d, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2 border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">{d.icon}</span>
                <span className="text-xs font-extrabold text-on-surface">{d.label}</span>
              </div>
              <p className="text-sm font-bold text-on-surface">{d.dose}</p>
              <p className="text-[10px] text-on-surface-variant">{d.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-[#B45309]/8 border border-[#B45309]/25 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[#B45309] text-[18px]">warning</span>
          <p className="text-[11px] text-[#B45309] font-semibold">Always follow your doctor's prescribed dosage. Do not self-medicate.</p>
        </div>
      </Section>

      {/* ── SIDE EFFECTS ── */}
      <Section icon="health_and_safety" iconColor="bg-[#ba1a1a]/10" title="Side Effects" subtitle="Known adverse reactions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#B45309]" />
              <h3 className="text-xs font-extrabold text-[#B45309] uppercase tracking-wider">Common Side Effects</h3>
            </div>
            <div className="flex flex-col gap-2">
              {(med.side_effects?.common || ['Nausea', 'Headache', 'Stomach upset']).map((se, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 bg-[#B45309]/5 rounded-xl border border-[#B45309]/15">
                  <span className="material-symbols-outlined text-[16px] text-[#B45309] flex-shrink-0">circle</span>
                  <span className="text-xs text-on-surface">{se}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              <h3 className="text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider">Serious Side Effects</h3>
            </div>
            <div className="flex flex-col gap-2">
              {(med.side_effects?.serious || ['Severe allergic reaction', 'Seek medical help immediately']).map((se, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 bg-[#ba1a1a]/5 rounded-xl border border-[#ba1a1a]/15">
                  <span className="material-symbols-outlined text-[16px] text-[#ba1a1a] flex-shrink-0">emergency</span>
                  <span className="text-xs text-on-surface">{se}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── WHO SHOULD NOT TAKE IT ── */}
      <Section icon="person_cancel" iconColor="bg-[#ba1a1a]/10" title="Who Should NOT Take This?" subtitle="Contraindications matched to your health profile"
        badge={
          conditionMatrix.filter(c => c.userHas && c.status === 'avoid').length > 0
            ? <span className="text-[9px] font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full">{conditionMatrix.filter(c => c.userHas && c.status === 'avoid').length} contraindication(s)</span>
            : null
        }
      >
        {med.personalized_warnings?.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {med.personalized_warnings.map((w, i) => (
              <WarningBanner key={i} icon="assignment_late" title="Personalized Warning" detail={w} type="danger" />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {conditionMatrix.map((c, i) => <ConditionSafetyCard key={i} {...c} />)}
        </div>
      </Section>

      {/* ── DRUG INTERACTIONS ── */}
      {med.drug_interactions?.length > 0 && (
        <Section icon="swap_horizontal_circle" iconColor="bg-[#ba1a1a]/10" title="Drug Interactions" subtitle="Detected interactions with your current medications">
          <div className="flex flex-col gap-3">
            {med.drug_interactions.map((inter, i) => {
              const isDanger = inter.severity?.toLowerCase() === 'danger';
              return (
                <div key={i} className={`p-4 rounded-2xl border ${isDanger ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/25' : 'bg-[#B45309]/5 border-[#B45309]/25'}`}>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-xl ${isDanger ? 'text-[#ba1a1a]' : 'text-[#B45309]'}`}>medication</span>
                      <span className="text-xs font-extrabold text-on-surface">{inter.drug_a} + {inter.drug_b}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-white ${isDanger ? 'bg-[#ba1a1a]' : 'bg-[#B45309]'}`}>
                      {inter.severity} Interaction
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{inter.description}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── WARNINGS: Food, Alcohol, Driving, Pregnancy, Breastfeeding ── */}
      <Section icon="warning" iconColor="bg-[#B45309]/10" title="Important Warnings" subtitle="Food, alcohol, driving and special population warnings">
        <div className="flex flex-col gap-3">
          <WarningBanner
            icon="no_food"
            title="Food Interactions"
            type={hasFoodInteraction ? 'warning' : 'info'}
            detail={hasFoodInteraction
              ? 'This medicine has known food interactions. Avoid grapefruit, dairy (tetracyclines) or high-Vitamin K foods (warfarin) while taking this medicine.'
              : 'No major food interactions detected. Take with food if it causes stomach upset.'}
          />
          <WarningBanner
            icon="no_drinks"
            title="Alcohol Warning"
            type={isAlcoholRisk ? 'danger' : 'info'}
            detail={isAlcoholRisk
              ? 'Combining this medicine with alcohol is dangerous. Risk of liver damage (acetaminophen) or enhanced CNS depression (sedatives).'
              : 'Moderate alcohol consumption is generally not directly contraindicated, but avoid excess alcohol while on medication.'}
          />
          <WarningBanner
            icon="directions_car"
            title="Driving &amp; Operating Machinery"
            type={isDrivingRisk ? 'warning' : 'safe'}
            detail={isDrivingRisk
              ? 'This medicine may cause drowsiness, dizziness or impaired concentration. Do NOT drive or operate heavy machinery.'
              : 'No significant CNS effects detected. Driving is generally safe unless you experience dizziness.'}
          />
          <WarningBanner
            icon="pregnant_woman"
            title="Pregnancy Safety"
            type={conditions.pregnancy && isNsaid ? 'danger' : conditions.pregnancy ? 'warning' : 'info'}
            detail={conditions.pregnancy && isNsaid
              ? '⚠ CONTRAINDICATED IN PREGNANCY: NSAIDs carry serious fetal risk. Consult your OB/GYN immediately.'
              : 'Consult your OB/GYN before taking any medication during pregnancy. Safety varies by trimester.'}
          />
          <WarningBanner
            icon="breastfeeding"
            title="Breastfeeding Safety"
            type="info"
            detail="Consult your doctor before taking this medicine while breastfeeding. Most drugs transfer into breast milk to some degree."
          />
        </div>
      </Section>

      {/* ── ALTERNATIVE MEDICINES ── */}
      {alts.length > 0 && (
        <Section icon="compare_arrows" iconColor="bg-[#006a39]/10" title="Alternative Medicines" subtitle="Same therapeutic class — confirm with doctor or pharmacist before switching">
          <div className="bg-[#B45309]/8 border border-[#B45309]/25 rounded-xl p-3 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#B45309] text-[18px]">info</span>
            <p className="text-[11px] text-[#B45309] font-semibold">Always confirm with a licensed doctor or pharmacist before switching medicines.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alts.slice(0, 3).map((alt, idx) => (
              <div key={idx} className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-outline-variant/20 relative">
                    <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" onError={e => { e.target.src = '/medicine_label.png'; }} />
                    <span className="absolute top-0.5 left-0.5 text-[7px] font-extrabold bg-secondary text-white px-1 py-0.5 rounded">{alt.score}</span>
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
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── AI RECOMMENDATION ── */}
      <div className={`rounded-3xl p-6 border-2 ${score100 >= 75 ? 'border-[#006a39]/25 bg-[#006a39]/5' : score100 >= 50 ? 'border-[#B45309]/25 bg-[#B45309]/5' : 'border-[#ba1a1a]/25 bg-[#ba1a1a]/5'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.badgeBg}`}>
            <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-on-surface mb-2">AI Medical Recommendation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {score100 >= 75
                ? `${resultsData.product_name} appears generally compatible with your health profile. No major contraindications were detected. Ensure you follow the prescribed dosage and consult your doctor if you experience any unusual symptoms.`
                : score100 >= 50
                ? `${resultsData.product_name} requires medical supervision for your profile. One or more conditions in your health profile warrant a doctor's advice before use. Do not self-medicate.`
                : `${resultsData.product_name} has multiple critical interactions or contraindications with your health profile. This medicine is NOT recommended without direct physician supervision. Please consult your doctor immediately.`
              }
            </p>
            <p className="text-[10px] text-on-surface-variant mt-3 italic">Guardian AI is an informational assistant. Always consult a licensed physician before taking any medication.</p>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 text-[10px] text-on-surface-variant leading-relaxed text-center">
        {resultsData.disclaimer || 'MEDICAL DISCLAIMER: This analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a licensed physician before taking any medication.'}
      </div>
    </div>
  );
}
