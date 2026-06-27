import { useState, useEffect } from 'react';
import { 
  User, Stethoscope, Droplet, Coffee, Heart, 
  HeartPulse, Sparkles, RefreshCw, Scissors, Target, BellRing
} from 'lucide-react';
import ProgressSidebar from '../common/ProgressSidebar';

export default function ProfileView({ userProfile, saveProfile, showToast, apiSettings, saveSettings }) {
  // general
  const [name, setName] = useState('');
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState('male');
  const [allergies, setAllergies] = useState('');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');

  // medical conditions
  const [hypertension, setHypertension] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [kidney, setKidney] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [thyroid, setThyroid] = useState(false);
  const [asthma, setAsthma] = useState(false);
  const [pcos, setPcos] = useState(false);
  const [lactoseIntolerance, setLactoseIntolerance] = useState(false);
  const [glutenIntolerance, setGlutenIntolerance] = useState(false);
  const [medicalNone, setMedicalNone] = useState(false);
  const [currentMeds, setCurrentMeds] = useState('');

  // food allergies
  const [dairy, setDairy] = useState(false); // Milk
  const [nuts, setNuts] = useState(false);   // Peanuts / Nuts
  const [soy, setSoy] = useState(false);
  const [gluten, setGluten] = useState(false); // Wheat
  const [eggAllergy, setEggAllergy] = useState(false);
  const [treeNutAllergy, setTreeNutAllergy] = useState(false);
  const [fishAllergy, setFishAllergy] = useState(false);
  const [shellfishAllergy, setShellfishAllergy] = useState(false);
  const [sesameAllergy, setSesameAllergy] = useState(false);
  const [foodNone, setFoodNone] = useState(false);

  // dietary preference
  const [dietaryPreference, setDietaryPreference] = useState('vegetarian');
  const [sugar, setSugar] = useState(false);
  const [organic, setOrganic] = useState(false);
  const [weightLoss, setWeightLoss] = useState(false);

  // lifestyle
  const [smoking, setSmoking] = useState('never');
  const [alcohol, setAlcohol] = useState('never');
  const [exercise, setExercise] = useState('weekly');
  const [waterIntake, setWaterIntake] = useState('2-3l');

  // skin profile
  const [skinType, setSkinType] = useState('sensitive');
  const [skinTone, setSkinTone] = useState('medium');
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [skinConcernsNone, setSkinConcernsNone] = useState(false);

  // cosmetic allergies
  const [avoidCosmetics, setAvoidCosmetics] = useState('');
  const [avoidFragrance, setAvoidFragrance] = useState(false);
  const [avoidParabens, setAvoidParabens] = useState(false);
  const [avoidSulfates, setAvoidSulfates] = useState(false);
  const [avoidAlcohol, setAvoidAlcohol] = useState(false);
  const [avoidEssentialOils, setAvoidEssentialOils] = useState(false);
  const [avoidLanolin, setAvoidLanolin] = useState(false);
  const [avoidNickel, setAvoidNickel] = useState(false);
  const [avoidFormaldehyde, setAvoidFormaldehyde] = useState(false);
  const [avoidArtificialColors, setAvoidArtificialColors] = useState(false);
  const [avoidSilicone, setAvoidSilicone] = useState(false);
  const [avoidMineralOil, setAvoidMineralOil] = useState(false);
  const [cosmeticNone, setCosmeticNone] = useState(false);

  // hair profile
  const [hairType, setHairType] = useState('straight');
  const [hairConcerns, setHairConcerns] = useState([]);
  const [hairConcernsNone, setHairConcernsNone] = useState(false);

  // health goals
  const [weightGainGoal, setWeightGainGoal] = useState(false);
  const [muscleBuildingGoal, setMuscleBuildingGoal] = useState(false);
  const [healthyEatingGoal, setHealthyEatingGoal] = useState(false);
  const [betterSkinGoal, setBetterSkinGoal] = useState(false);
  const [acneReductionGoal, setAcneReductionGoal] = useState(false);
  const [antiAgingGoal, setAntiAgingGoal] = useState(false);
  const [hairCareGoal, setHairCareGoal] = useState(false);
  const [diabetesManagementGoal, setDiabetesManagementGoal] = useState(false);
  const [heartHealthGoal, setHeartHealthGoal] = useState(false);
  const [allergySafeGoal, setAllergySafeGoal] = useState(false);

  // notifications toggles
  const [notifyHarmful, setNotifyHarmful] = useState(true);
  const [notifyFoodAllergens, setNotifyFoodAllergens] = useState(true);
  const [notifyCosmeticAllergens, setNotifyCosmeticAllergens] = useState(true);
  const [notifyRecalls, setNotifyRecalls] = useState(true);
  const [notifyHighSugar, setNotifyHighSugar] = useState(true);
  const [notifyHighSodium, setNotifyHighSodium] = useState(true);
  const [notifySkinIrritants, setNotifySkinIrritants] = useState(true);
  const [notifyHealthTips, setNotifyHealthTips] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // API Settings integration
  const [mode, setMode] = useState(apiSettings?.mode || 'mock');
  const [apiKey, setApiKey] = useState(apiSettings?.apiKey || '');
  const [model, setModel] = useState(apiSettings?.model === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : (apiSettings?.model || 'gemini-2.5-flash'));
  const [verbose, setVerbose] = useState(apiSettings?.verbose !== false);
  const [haptic, setHaptic] = useState(apiSettings?.haptic !== false);

  // Sync / Reset settings state when apiSettings changes during render phase
  const [prevApiSettings, setPrevApiSettings] = useState(apiSettings);
  if (apiSettings !== prevApiSettings) {
    setPrevApiSettings(apiSettings);
    if (apiSettings) {
      setMode(apiSettings.mode || 'mock');
      setApiKey(apiSettings.apiKey || '');
      setModel(apiSettings.model === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : (apiSettings.model || 'gemini-2.5-flash'));
      setVerbose(apiSettings.verbose !== false);
      setHaptic(apiSettings.haptic !== false);
    }
  }

  // Sync inputs with userProfile prop on mount/change
  useEffect(() => {
    if (!userProfile) return;

    const timer = setTimeout(() => {
      setName(userProfile.name || '');
      setAge(userProfile.age || 35);
      setGender(userProfile.gender || 'male');
      setAllergies(userProfile.allergies || '');
      
      setGluten(!!userProfile.dietary_goals?.gluten_free);
      setDairy(!!userProfile.dietary_goals?.dairy_free);
      setNuts(!!userProfile.dietary_goals?.nut_free);
      setSoy(!!userProfile.dietary_goals?.soy_free);
      setSugar(!!userProfile.dietary_goals?.low_sugar);
      setOrganic(!!userProfile.dietary_goals?.organic_only);
      setWeightLoss(!!userProfile.dietary_goals?.weight_loss);

      setSkinType(userProfile.skin_profile?.skin_type || 'sensitive');
      setSkinConcerns(userProfile.skin_profile?.skin_concerns || []);
      
      const avoid = userProfile.skin_profile?.avoid_ingredients || [];
      setAvoidCosmetics(avoid.join(', '));
      setAvoidFragrance(avoid.includes('fragrance'));
      setAvoidParabens(avoid.includes('parabens'));
      setAvoidSulfates(avoid.includes('sulfates'));
      setAvoidAlcohol(avoid.includes('alcohol'));
      setAvoidEssentialOils(avoid.includes('essential oils') || avoid.includes('essential_oils'));
      setAvoidLanolin(avoid.includes('lanolin'));
      setAvoidNickel(avoid.includes('nickel'));
      setAvoidFormaldehyde(avoid.includes('formaldehyde'));
      setAvoidArtificialColors(avoid.includes('artificial colors') || avoid.includes('artificial_colors'));
      setAvoidSilicone(avoid.includes('silicone'));
      setAvoidMineralOil(avoid.includes('mineral oil') || avoid.includes('mineral_oil'));

      setHypertension(!!userProfile.medical_profile?.conditions?.hypertension);
      setPregnancy(!!userProfile.medical_profile?.conditions?.pregnancy);
      setDiabetes(!!userProfile.medical_profile?.conditions?.diabetes);
      setKidney(!!userProfile.medical_profile?.conditions?.kidney_disease);
      
      setHeartDisease(!!userProfile.medical_profile?.conditions?.heart_disease);
      setThyroid(!!userProfile.medical_profile?.conditions?.thyroid);
      setAsthma(!!userProfile.medical_profile?.conditions?.asthma);
      setPcos(!!userProfile.medical_profile?.conditions?.pcos);
      setLactoseIntolerance(!!userProfile.medical_profile?.conditions?.lactose_intolerance);
      setGlutenIntolerance(!!userProfile.medical_profile?.conditions?.gluten_intolerance);
      
      setCurrentMeds((userProfile.medical_profile?.current_medications || []).join(', '));
    }, 0);

    return () => clearTimeout(timer);
  }, [userProfile]);

  // Calculate profile completion percentage
  const totalFields = 20;
  const filledFields = [
    name,
    age,
    gender,
    allergies,
    gluten,
    dairy,
    nuts,
    soy,
    sugar,
    organic,
    weightLoss,
    skinType,
    skinConcerns.length > 0,
    avoidCosmetics || avoidParabens || avoidSulfates || avoidSilicone,
    hypertension,
    pregnancy,
    diabetes,
    kidney,
    currentMeds,
    smoking
  ].filter(Boolean).length;
  const completion = Math.min(Math.round((filledFields / totalFields) * 100), 100);

  // Exclusive checked selection triggers
  const handleMedicalConditionChange = (condition, value) => {
    if (condition === 'none') {
      setMedicalNone(value);
      if (value) {
        setHypertension(false);
        setPregnancy(false);
        setDiabetes(false);
        setKidney(false);
        setHeartDisease(false);
        setThyroid(false);
        setAsthma(false);
        setPcos(false);
        setLactoseIntolerance(false);
        setGlutenIntolerance(false);
      }
    } else {
      setMedicalNone(false);
      if (condition === 'hypertension') setHypertension(value);
      if (condition === 'pregnancy') setPregnancy(value);
      if (condition === 'diabetes') setDiabetes(value);
      if (condition === 'kidney') setKidney(value);
      if (condition === 'heart_disease') setHeartDisease(value);
      if (condition === 'thyroid') setThyroid(value);
      if (condition === 'asthma') setAsthma(value);
      if (condition === 'pcos') setPcos(value);
      if (condition === 'lactose_intolerance') setLactoseIntolerance(value);
      if (condition === 'gluten_intolerance') setGlutenIntolerance(value);
    }
  };

  const handleFoodAllergyChange = (allergy, value) => {
    if (allergy === 'none') {
      setFoodNone(value);
      if (value) {
        setDairy(false);
        setNuts(false);
        setSoy(false);
        setGluten(false);
        setEggAllergy(false);
        setTreeNutAllergy(false);
        setFishAllergy(false);
        setShellfishAllergy(false);
        setSesameAllergy(false);
      }
    } else {
      setFoodNone(false);
      if (allergy === 'dairy') setDairy(value);
      if (allergy === 'nuts') setNuts(value);
      if (allergy === 'soy') setSoy(value);
      if (allergy === 'gluten') setGluten(value);
      if (allergy === 'egg') setEggAllergy(value);
      if (allergy === 'treenut') setTreeNutAllergy(value);
      if (allergy === 'fish') setFishAllergy(value);
      if (allergy === 'shellfish') setShellfishAllergy(value);
      if (allergy === 'sesame') setSesameAllergy(value);
    }
  };

  const handleSkinConcernChange = (concern, value) => {
    if (concern === 'none') {
      setSkinConcernsNone(value);
      if (value) setSkinConcerns([]);
    } else {
      setSkinConcernsNone(false);
      if (value) {
        setSkinConcerns(prev => [...prev.filter(c => c !== 'none'), concern]);
      } else {
        setSkinConcerns(prev => prev.filter(c => c !== concern));
      }
    }
  };

  const handleCosmeticAllergyChange = (allergy, value) => {
    if (allergy === 'none') {
      setCosmeticNone(value);
      if (value) {
        setAvoidFragrance(false);
        setAvoidParabens(false);
        setAvoidSulfates(false);
        setAvoidAlcohol(false);
        setAvoidEssentialOils(false);
        setAvoidLanolin(false);
        setAvoidNickel(false);
        setAvoidFormaldehyde(false);
        setAvoidArtificialColors(false);
        setAvoidSilicone(false);
        setAvoidMineralOil(false);
      }
    } else {
      setCosmeticNone(false);
      if (allergy === 'fragrance') setAvoidFragrance(value);
      if (allergy === 'parabens') setAvoidParabens(value);
      if (allergy === 'sulfates') setAvoidSulfates(value);
      if (allergy === 'alcohol') setAvoidAlcohol(value);
      if (allergy === 'essential_oils') setAvoidEssentialOils(value);
      if (allergy === 'lanolin') setAvoidLanolin(value);
      if (allergy === 'nickel') setAvoidNickel(value);
      if (allergy === 'formaldehyde') setAvoidFormaldehyde(value);
      if (allergy === 'artificial_colors') setAvoidArtificialColors(value);
      if (allergy === 'silicone') setAvoidSilicone(value);
      if (allergy === 'mineral_oil') setAvoidMineralOil(value);
    }
  };

  const handleHairConcernChange = (concern, value) => {
    if (concern === 'none') {
      setHairConcernsNone(value);
      if (value) setHairConcerns([]);
    } else {
      setHairConcernsNone(false);
      if (value) {
        setHairConcerns(prev => [...prev, concern]);
      } else {
        setHairConcerns(prev => prev.filter(c => c !== concern));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Build avoid cosmetics array
    const updatedAvoid = [];
    if (avoidFragrance) updatedAvoid.push('fragrance');
    if (avoidParabens) updatedAvoid.push('parabens');
    if (avoidSulfates) updatedAvoid.push('sulfates');
    if (avoidAlcohol) updatedAvoid.push('alcohol');
    if (avoidEssentialOils) updatedAvoid.push('essential oils');
    if (avoidLanolin) updatedAvoid.push('lanolin');
    if (avoidNickel) updatedAvoid.push('nickel');
    if (avoidFormaldehyde) updatedAvoid.push('formaldehyde');
    if (avoidArtificialColors) updatedAvoid.push('artificial colors');
    if (avoidSilicone) updatedAvoid.push('silicone');
    if (avoidMineralOil) updatedAvoid.push('mineral oil');

    const customAvoid = avoidCosmetics.split(',').map(s => s.trim().toLowerCase()).filter(s => s && !updatedAvoid.includes(s));
    const finalAvoid = [...updatedAvoid, ...customAvoid];

    const updated = {
      name,
      age: parseInt(age) || 35,
      gender,
      allergies,
      dietary_goals: {
        gluten_free: gluten,
        dairy_free: dairy,
        nut_free: nuts,
        soy_free: soy,
        low_sugar: sugar,
        organic_only: organic,
        weight_loss: weightLoss
      },
      skin_profile: {
        skin_type: skinType,
        skin_concerns: skinConcerns,
        avoid_ingredients: finalAvoid
      },
      medical_profile: {
        conditions: {
          hypertension,
          pregnancy,
          diabetes,
          kidney_disease: kidney,
          heart_disease: heartDisease,
          thyroid,
          asthma,
          pcos,
          lactose_intolerance: lactoseIntolerance,
          gluten_intolerance: glutenIntolerance
        },
        current_medications: currentMeds.split(',').map(s => s.trim().toLowerCase()).filter(s => s),
        drug_allergies: userProfile.medical_profile?.drug_allergies || []
      }
    };

    setTimeout(() => {
      saveProfile(updated);
      if (saveSettings) {
        saveSettings({
          mode,
          apiKey: apiKey.trim(),
          model,
          verbose,
          haptic
        });
      }
      setIsSaving(false);
      if (showToast) showToast("Profile and configurations saved successfully!", "success");
    }, 1200);
  };


  const resetForm = () => {
    if (confirm("Reset health profile and settings to defaults?")) {
      setName('');
      setAge(35);
      setGender('male');
      setAllergies('');
      setGluten(false);
      setDairy(false);
      setNuts(false);
      setSoy(false);
      setSugar(false);
      setOrganic(false);
      setWeightLoss(false);
      
      setSkinType('sensitive');
      setSkinTone('medium');
      setSkinConcerns([]);
      setSkinConcernsNone(false);
      
      setAvoidCosmetics('');
      setAvoidFragrance(false);
      setAvoidParabens(false);
      setAvoidSulfates(false);
      setAvoidAlcohol(false);
      setAvoidEssentialOils(false);
      setAvoidLanolin(false);
      setAvoidNickel(false);
      setAvoidFormaldehyde(false);
      setAvoidArtificialColors(false);
      setAvoidSilicone(false);
      setAvoidMineralOil(false);
      setCosmeticNone(false);

      setHairType('straight');
      setHairConcerns([]);
      setHairConcernsNone(false);

      setWeightGainGoal(false);
      setMuscleBuildingGoal(false);
      setHealthyEatingGoal(false);
      setBetterSkinGoal(false);
      setAcneReductionGoal(false);
      setAntiAgingGoal(false);
      setHairCareGoal(false);
      setDiabetesManagementGoal(false);
      setHeartHealthGoal(false);
      setAllergySafeGoal(false);

      setHypertension(false);
      setPregnancy(false);
      setDiabetes(false);
      setKidney(false);
      setHeartDisease(false);
      setThyroid(false);
      setAsthma(false);
      setPcos(false);
      setLactoseIntolerance(false);
      setGlutenIntolerance(false);
      setMedicalNone(false);
      setCurrentMeds('');

      setNotifyHarmful(true);
      setNotifyFoodAllergens(true);
      setNotifyCosmeticAllergens(true);
      setNotifyRecalls(true);
      setNotifyHighSugar(true);
      setNotifyHighSodium(true);
      setNotifySkinIrritants(true);
      setNotifyHealthTips(true);

      // Reset integrated settings
      setMode('mock');
      setApiKey('');
      setModel('gemini-2.5-flash');
      setVerbose(true);
      setHaptic(true);

      if (showToast) showToast("Form cleared to defaults.", "info");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-[fadeIn_0.4s_ease] w-full items-start">
      
      {/* Sticky Progress Sidebar */}
      <aside className="w-full lg:w-1/4 lg:sticky lg:top-6 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex-shrink-0">
        <ProgressSidebar completion={completion} userProfile={userProfile} />
      </aside>

      {/* Main Redesigned Form Dashboard */}
      <div className="flex-grow w-full lg:w-3/4 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="mb-6 border-b border-outline-variant/30 pb-4">
            <h2 className="text-2xl font-black text-on-surface leading-tight flex items-center gap-2">
              <Sparkles size={26} className="text-primary animate-pulse" /> Health &amp; Skin Profile
            </h2>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Help Guardian AI personalize food and cosmetic safety recommendations based on your health, allergies, lifestyle, and skin profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* SECTION 1: Personal Information */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <User size={18} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    placeholder="Age"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Height (cm)</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary transition-all bg-white"
                    placeholder="Height in cm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary transition-all bg-white"
                    placeholder="Weight in kg"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Medical Conditions */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-red-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Stethoscope size={18} /> Medical Conditions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'diabetes', label: 'Diabetes', state: diabetes, icon: <HeartPulse size={14} /> },
                  { id: 'hypertension', label: 'Hypertension', state: hypertension, icon: <HeartPulse size={14} /> },
                  { id: 'heart_disease', label: 'Heart Disease', state: heartDisease, icon: <HeartPulse size={14} /> },
                  { id: 'kidney', label: 'Kidney Disease', state: kidney, icon: <HeartPulse size={14} /> },
                  { id: 'thyroid', label: 'Thyroid', state: thyroid, icon: <HeartPulse size={14} /> },
                  { id: 'asthma', label: 'Asthma', state: asthma, icon: <HeartPulse size={14} /> },
                  { id: 'pregnancy', label: 'Pregnancy', state: pregnancy, icon: <HeartPulse size={14} /> },
                  { id: 'pcos', label: 'PCOS', state: pcos, icon: <HeartPulse size={14} /> },
                  { id: 'lactose', label: 'Lactose Intolerant', state: lactoseIntolerance, icon: <HeartPulse size={14} /> },
                  { id: 'gluten_int', label: 'Gluten Intolerant', state: glutenIntolerance, icon: <HeartPulse size={14} /> },
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      item.state 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={(e) => handleMedicalConditionChange(item.id, e.target.checked)} 
                      className="sr-only" 
                    />
                    {item.icon}
                    {item.label}
                  </label>
                ))}
                <label 
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                    medicalNone 
                      ? 'bg-red-500/10 border-red-500 text-red-500' 
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={medicalNone} 
                    onChange={(e) => handleMedicalConditionChange('none', e.target.checked)} 
                    className="sr-only" 
                  />
                  None
                </label>
              </div>
            </div>

            {/* SECTION 3: Food Allergies */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Droplet size={18} /> Food Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'dairy', label: 'Milk', state: dairy },
                  { id: 'egg', label: 'Eggs', state: eggAllergy },
                  { id: 'nuts', label: 'Peanuts', state: nuts },
                  { id: 'treenut', label: 'Tree Nuts', state: treeNutAllergy },
                  { id: 'soy', label: 'Soy', state: soy },
                  { id: 'gluten', label: 'Wheat', state: gluten },
                  { id: 'fish', label: 'Fish', state: fishAllergy },
                  { id: 'shellfish', label: 'Shellfish', state: shellfishAllergy },
                  { id: 'sesame', label: 'Sesame', state: sesameAllergy },
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                      item.state 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={(e) => handleFoodAllergyChange(item.id, e.target.checked)} 
                      className="sr-only" 
                    />
                    {item.label}
                  </label>
                ))}
                <label 
                  className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                    foodNone 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={foodNone} 
                    onChange={(e) => handleFoodAllergyChange('none', e.target.checked)} 
                    className="sr-only" 
                  />
                  None
                </label>
              </div>
            </div>

            {/* SECTION 4: Dietary Preference */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-green-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Coffee size={18} /> Dietary Preference
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'vegetarian', label: 'Vegetarian' },
                  { value: 'vegan', label: 'Vegan' },
                  { value: 'eggetarian', label: 'Eggetarian' },
                  { value: 'non-vegetarian', label: 'Non Vegetarian' },
                ].map(item => (
                  <label 
                    key={item.value} 
                    className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      dietaryPreference === item.value 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="dietaryPref" 
                      value={item.value} 
                      checked={dietaryPreference === item.value} 
                      onChange={() => setDietaryPreference(item.value)} 
                      className="sr-only" 
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* SECTION 5: Lifestyle */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-indigo-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Heart size={18} /> Lifestyle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Smoking</label>
                  <select 
                    value={smoking} 
                    onChange={(e) => setSmoking(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="never">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="regularly">Regularly</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Alcohol</label>
                  <select 
                    value={alcohol} 
                    onChange={(e) => setAlcohol(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="never">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="frequently">Frequently</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Exercise</label>
                  <select 
                    value={exercise} 
                    onChange={(e) => setExercise(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="rarely">Rarely</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Daily Water Intake</label>
                  <select 
                    value={waterIntake} 
                    onChange={(e) => setWaterIntake(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="less-than-2l">Less than 2L</option>
                    <option value="2-3l">2–3L</option>
                    <option value="more-than-3l">More than 3L</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 6: Skin Profile */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-teal-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={18} /> Skin Profile
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-on-surface mb-2">Skin Type</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['normal', 'dry', 'oily', 'combination', 'sensitive'].map(type => (
                      <label 
                        key={type} 
                        className={`p-3 rounded-xl border text-center text-xs font-bold capitalize cursor-pointer transition-all ${
                          skinType === type 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="skinTypeRadio" 
                          value={type} 
                          checked={skinType === type} 
                          onChange={() => setSkinType(type)} 
                          className="sr-only" 
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-semibold text-on-surface">Skin Tone</label>
                  <select 
                    value={skinTone} 
                    onChange={(e) => setSkinTone(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                  >
                    <option value="fair">Fair</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="tan">Tan</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-on-surface mb-2">Skin Concerns</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'acne', label: 'Acne' },
                      { id: 'pimples', label: 'Pimples' },
                      { id: 'dark_spots', label: 'Dark Spots' },
                      { id: 'hyperpigmentation', label: 'Hyperpigmentation' },
                      { id: 'dryness', label: 'Dryness' },
                      { id: 'excess_oil', label: 'Excess Oil' },
                      { id: 'wrinkles', label: 'Wrinkles' },
                      { id: 'fine_lines', label: 'Fine Lines' },
                      { id: 'redness', label: 'Redness' },
                      { id: 'eczema', label: 'Eczema' },
                      { id: 'psoriasis', label: 'Psoriasis' },
                      { id: 'rosacea', label: 'Rosacea' },
                      { id: 'blackheads', label: 'Blackheads' },
                      { id: 'whiteheads', label: 'Whiteheads' },
                      { id: 'dull_skin', label: 'Dull Skin' },
                      { id: 'sun_damage', label: 'Sun Damage' },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${
                          skinConcerns.includes(item.id) 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={skinConcerns.includes(item.id)} 
                          onChange={(e) => handleSkinConcernChange(item.id, e.target.checked)} 
                          className="sr-only" 
                        />
                        {item.label}
                      </label>
                    ))}
                    <label 
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${
                        skinConcernsNone 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={skinConcernsNone} 
                        onChange={(e) => handleSkinConcernChange('none', e.target.checked)} 
                        className="sr-only" 
                      />
                      None
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 7: Cosmetic Allergies */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-pink-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Droplet size={18} /> Cosmetic Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'fragrance', label: 'Fragrance', state: avoidFragrance },
                  { id: 'parabens', label: 'Parabens', state: avoidParabens },
                  { id: 'sulfates', label: 'Sulfates', state: avoidSulfates },
                  { id: 'alcohol', label: 'Alcohol', state: avoidAlcohol },
                  { id: 'essential_oils', label: 'Essential Oils', state: avoidEssentialOils },
                  { id: 'lanolin', label: 'Lanolin', state: avoidLanolin },
                  { id: 'nickel', label: 'Nickel', state: avoidNickel },
                  { id: 'formaldehyde', label: 'Formaldehyde', state: avoidFormaldehyde },
                  { id: 'artificial_colors', label: 'Artificial Colors', state: avoidArtificialColors },
                  { id: 'silicone', label: 'Silicone', state: avoidSilicone },
                  { id: 'mineral_oil', label: 'Mineral Oil', state: avoidMineralOil },
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      item.state 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={(e) => handleCosmeticAllergyChange(item.id, e.target.checked)} 
                      className="sr-only" 
                    />
                    {item.id === 'silicone' && <Droplet size={12} />}
                    {item.label}
                  </label>
                ))}
                <label 
                  className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                    cosmeticNone 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={cosmeticNone} 
                    onChange={(e) => handleCosmeticAllergyChange('none', e.target.checked)} 
                    className="sr-only" 
                  />
                  None
                </label>
              </div>
            </div>

            {/* SECTION 8: Hair Profile */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-blue-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Scissors size={18} /> Hair Profile
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-on-surface mb-2">Hair Type</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['straight', 'wavy', 'curly', 'coily'].map(type => (
                      <label 
                        key={type} 
                        className={`p-3.5 rounded-xl border text-center text-xs font-bold capitalize cursor-pointer transition-all ${
                          hairType === type 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="hairTypeRadio" 
                          value={type} 
                          checked={hairType === type} 
                          onChange={() => setHairType(type)} 
                          className="sr-only" 
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-on-surface mb-2">Hair Concerns</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'hair_fall', label: 'Hair Fall' },
                      { id: 'dandruff', label: 'Dandruff' },
                      { id: 'dry_hair', label: 'Dry Hair' },
                      { id: 'oily_scalp', label: 'Oily Scalp' },
                      { id: 'split_ends', label: 'Split Ends' },
                      { id: 'color_treated', label: 'Color Treated' },
                      { id: 'sensitive_scalp', label: 'Sensitive Scalp' },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${
                          hairConcerns.includes(item.id) 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={hairConcerns.includes(item.id)} 
                          onChange={(e) => handleHairConcernChange(item.id, e.target.checked)} 
                          className="sr-only" 
                        />
                        {item.label}
                      </label>
                    ))}
                    <label 
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${
                        hairConcernsNone 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={hairConcernsNone} 
                        onChange={(e) => handleHairConcernChange('none', e.target.checked)} 
                        className="sr-only" 
                      />
                      None
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 9: Health Goals */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-green-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Target size={18} /> Health Goals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'weight_loss', label: 'Weight Loss', state: weightLoss, setter: setWeightLoss },
                  { id: 'weight_gain', label: 'Weight Gain', state: weightGainGoal, setter: setWeightGainGoal },
                  { id: 'muscle', label: 'Muscle Building', state: muscleBuildingGoal, setter: setMuscleBuildingGoal },
                  { id: 'healthy_eat', label: 'Healthy Eating', state: healthyEatingGoal, setter: setHealthyEatingGoal },
                  { id: 'better_skin', label: 'Better Skin', state: betterSkinGoal, setter: setBetterSkinGoal },
                  { id: 'acne_red', label: 'Acne Reduction', state: acneReductionGoal, setter: setAcneReductionGoal },
                  { id: 'anti_aging', label: 'Anti Aging', state: antiAgingGoal, setter: setAntiAgingGoal },
                  { id: 'hair_care', label: 'Hair Care', state: hairCareGoal, setter: setHairCareGoal },
                  { id: 'diabetes_manage', label: 'Diabetes Management', state: diabetesManagementGoal, setter: setDiabetesManagementGoal },
                  { id: 'heart_health', label: 'Heart Health', state: heartHealthGoal, setter: setHeartHealthGoal },
                  { id: 'allergy_safe', label: 'Allergy Safe Products', state: allergySafeGoal, setter: setAllergySafeGoal },
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      item.state 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={(e) => item.setter(e.target.checked)} 
                      className="sr-only" 
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* SECTION 10: Notifications */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-blue-600 flex items-center gap-1.5 uppercase tracking-wider">
                <BellRing size={18} /> Notifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'notifyHarmful', label: 'Harmful Ingredients', state: notifyHarmful, setter: setNotifyHarmful, desc: 'Controversial or carcinogenic additives' },
                  { id: 'notifyFood', label: 'Food Allergens', state: notifyFoodAllergens, setter: setNotifyFoodAllergens, desc: 'Flag match items from food allergies' },
                  { id: 'notifyCosm', label: 'Cosmetic Allergens', state: notifyCosmeticAllergens, setter: setNotifyCosmeticAllergens, desc: 'Warning matches on makeup items' },
                  { id: 'notifyRecalls', label: 'Product Recalls', state: notifyRecalls, setter: setNotifyRecalls, desc: 'Active recalls matching search history' },
                  { id: 'notifySugar', label: 'High Sugar Products', state: notifyHighSugar, setter: setNotifyHighSugar, desc: 'High sugars (diabetes helper)' },
                  { id: 'notifySodium', label: 'High Sodium Products', state: notifyHighSodium, setter: setNotifyHighSodium, desc: 'High sodium (hypertension helper)' },
                  { id: 'notifySkin', label: 'Skin Irritants', state: notifySkinIrritants, setter: setNotifySkinIrritants, desc: 'Items causing skin concern flare-ups' },
                  { id: 'notifyTips', label: 'AI Health Tips', state: notifyHealthTips, setter: setNotifyHealthTips, desc: 'Daily health & hygiene insight feeds' },
                ].map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                    <div className="flex flex-col pr-4">
                      <span className="text-xs font-bold text-on-surface">{item.label}</span>
                      <span className="text-[10px] text-on-surface-variant">{item.desc}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={item.state} 
                        onChange={(e) => item.setter(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-outline-variant/60 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 11: Gemini AI Settings */}
            <div className="flex flex-col gap-4 border-t border-outline-variant/30 pt-6">
              <h3 className="text-sm font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Gemini AI Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Operation Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Operation Mode</label>
                  <select 
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="mock">Simulated Mode (Mock Data - Offline)</option>
                    <option value="gemini">Gemini API Mode (Real AI Label Analysis)</option>
                  </select>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Choose whether to run on mock rules or call Google's live Gemini models.
                  </p>
                </div>

                {/* Gemini Model */}
                {mode === 'gemini' && (
                  <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease]">
                    <label className="text-xs font-semibold text-on-surface">Gemini LLM Model</label>
                    <select 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                    </select>
                  </div>
                )}
                
              </div>

              {/* Gemini API Key */}
              {mode === 'gemini' && (
                <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease]">
                  <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                    <span>Gemini API Key</span>
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Get Key from Google AI Studio
                    </a>
                  </label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    placeholder="Paste your Gemini API Key here (AIzaSy...)"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSaving && <RefreshCw size={14} className="animate-spin" />}
                {isSaving ? 'Saving Profile...' : 'Save Health Profile'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3.5 border border-outline rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors bg-transparent text-on-surface cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        </div>



      </div>
    </div>
  );
}
