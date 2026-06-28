import { useState, useEffect } from 'react';
import { 
  User, Stethoscope, Droplet, Coffee, Heart, 
  HeartPulse, Sparkles, RefreshCw, Scissors, Target, BellRing, 
  Check, ArrowLeft, ArrowRight, Settings, Info, LogOut 
} from 'lucide-react';
import ProgressSidebar from '../common/ProgressSidebar';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function ProfileView({ userProfile, saveProfile, showToast, apiSettings, saveSettings }) {
  // --- Profile States ---
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

  // API Local States (Integrated inside the Settings tab)
  const [apiMode, setApiMode] = useState(apiSettings?.mode || 'mock');
  const [apiKey, setApiKey] = useState(apiSettings?.apiKey || '');
  const [apiModel, setApiModel] = useState(apiSettings?.model || 'gemini-2.5-flash');
  const [apiVerbose, setApiVerbose] = useState(!!apiSettings?.verbose);
  const [apiHaptic, setApiHaptic] = useState(!!apiSettings?.haptic);

  // --- UI States ---
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // For profile editing layout
  const [onboardingStep, setOnboardingStep] = useState(1); // For onboarding wizard
  const [slideDirection, setSlideDirection] = useState('next');

  // Sync inputs with userProfile prop on mount/change
  useEffect(() => {
    if (!userProfile) return;

    const timer = setTimeout(() => {
      setName(userProfile.name || '');
      setAge(userProfile.age || 35);
      setGender(userProfile.gender || 'male');
      setAllergies(userProfile.allergies || '');
      setHeight(userProfile.height || '175');
      setWeight(userProfile.weight || '70');
      
      setGluten(!!userProfile.dietary_goals?.gluten_free);
      setDairy(!!userProfile.dietary_goals?.dairy_free);
      setNuts(!!userProfile.dietary_goals?.nut_free);
      setSoy(!!userProfile.dietary_goals?.soy_free);
      setSugar(!!userProfile.dietary_goals?.low_sugar);
      setOrganic(!!userProfile.dietary_goals?.organic_only);
      setWeightLoss(!!userProfile.dietary_goals?.weight_loss);

      setSkinType(userProfile.skin_profile?.skin_type || 'sensitive');
      setSkinTone(userProfile.skin_profile?.skin_tone || 'medium');
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

      setHairType(userProfile.hair_profile?.hair_type || 'straight');
      setHairConcerns(userProfile.hair_profile?.hair_concerns || []);

      setWeightGainGoal(!!userProfile.health_goals?.weight_gain);
      setMuscleBuildingGoal(!!userProfile.health_goals?.muscle_building);
      setHealthyEatingGoal(!!userProfile.health_goals?.healthy_eating);
      setBetterSkinGoal(!!userProfile.health_goals?.better_skin);
      setAcneReductionGoal(!!userProfile.health_goals?.acne_reduction);
      setAntiAgingGoal(!!userProfile.health_goals?.anti_aging);
      setHairCareGoal(!!userProfile.health_goals?.hair_care);
      setDiabetesManagementGoal(!!userProfile.health_goals?.diabetes_management);
      setHeartHealthGoal(!!userProfile.health_goals?.heart_health);
      setAllergySafeGoal(!!userProfile.health_goals?.allergy_safe);

      setNotifyHarmful(userProfile.notifications?.harmful !== false);
      setNotifyFoodAllergens(userProfile.notifications?.food_allergens !== false);
      setNotifyCosmeticAllergens(userProfile.notifications?.cosmetic_allergens !== false);
      setNotifyRecalls(userProfile.notifications?.recalls !== false);
      setNotifyHighSugar(userProfile.notifications?.high_sugar !== false);
      setNotifyHighSodium(userProfile.notifications?.high_sodium !== false);
      setNotifySkinIrritants(userProfile.notifications?.skin_irritants !== false);
      setNotifyHealthTips(userProfile.notifications?.health_tips !== false);
    }, 0);

    return () => clearTimeout(timer);
  }, [userProfile]);

  // Sync API settings state when prop changes
  useEffect(() => {
    if (apiSettings) {
      setApiMode(apiSettings.mode || 'mock');
      setApiKey(apiSettings.apiKey || '');
      setApiModel(apiSettings.model || 'gemini-2.5-flash');
      setApiVerbose(!!apiSettings.verbose);
      setApiHaptic(!!apiSettings.haptic);
    }
  }, [apiSettings]);

  // Calculate profile completion percentage
  const totalFields = 22;
  const filledFields = [
    name,
    age,
    gender,
    allergies,
    height,
    weight,
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

  // --- Exclusive Checked Handlers ---
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
      if (condition === 'lactose') setLactoseIntolerance(value);
      if (condition === 'gluten_int') setGlutenIntolerance(value);
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
      if (allergy === 'warm_sulf') setAvoidSulfates(value);
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

  // --- Save / Submit logic ---
  const buildProfilePayload = (isCompletedOverride = true) => {
    // Avoid cosmetics list build
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

    return {
      name,
      age: parseInt(age) || 35,
      gender,
      allergies,
      height: height || '175',
      weight: weight || '70',
      profileCompleted: isCompletedOverride,
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
        skin_tone: skinTone,
        skin_concerns: skinConcerns,
        avoid_ingredients: finalAvoid
      },
      hair_profile: {
        hair_type: hairType,
        hair_concerns: hairConcerns
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
        drug_allergies: userProfile?.medical_profile?.drug_allergies || []
      },
      lifestyle: {
        smoking,
        alcohol,
        exercise,
        water_intake: waterIntake
      },
      health_goals: {
        weight_gain: weightGainGoal,
        muscle_building: muscleBuildingGoal,
        healthy_eating: healthyEatingGoal,
        better_skin: betterSkinGoal,
        acne_reduction: acneReductionGoal,
        anti_aging: antiAgingGoal,
        hair_care: hairCareGoal,
        diabetes_management: diabetesManagementGoal,
        heart_health: heartHealthGoal,
        allergy_safe: allergySafeGoal
      },
      notifications: {
        harmful: notifyHarmful,
        food_allergens: notifyFoodAllergens,
        cosmetic_allergens: notifyCosmeticAllergens,
        recalls: notifyRecalls,
        high_sugar: notifyHighSugar,
        high_sodium: notifyHighSodium,
        skin_irritants: notifySkinIrritants,
        health_tips: notifyHealthTips
      }
    };
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    
    // Mandatory Validation
    if (!name.trim()) {
      if (showToast) showToast("Full Name is required.", "error");
      return;
    }
    if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
      if (showToast) showToast("Please enter a valid age.", "error");
      return;
    }
    if (!gender) {
      if (showToast) showToast("Gender is required.", "error");
      return;
    }

    setIsSaving(true);
    const updated = buildProfilePayload(true);

    // Save settings if changed
    if (saveSettings) {
      saveSettings({
        mode: apiMode,
        apiKey: apiKey,
        model: apiModel,
        verbose: apiVerbose,
        haptic: apiHaptic
      });
    }

    setTimeout(() => {
      saveProfile(updated);
      setIsSaving(false);
      if (showToast) showToast("Health profile and preferences saved successfully!", "success");
    }, 1000);
  };

  // --- Quick Complete for "Normal Person" ---
  const handleQuickComplete = (e) => {
    if (e) e.preventDefault();

    // Validate essentials first
    if (!name.trim()) {
      if (showToast) showToast("Please fill in your name first.", "error");
      return;
    }
    if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
      if (showToast) showToast("Please fill in a valid age.", "error");
      return;
    }
    if (!gender) {
      if (showToast) showToast("Please select your gender.", "error");
      return;
    }
    if (!height || parseInt(height) <= 0) {
      if (showToast) showToast("Please enter your height.", "error");
      return;
    }
    if (!weight || parseInt(weight) <= 0) {
      if (showToast) showToast("Please enter your weight.", "error");
      return;
    }

    setIsSaving(true);

    const normalProfile = {
      name,
      age: parseInt(age) || 25,
      gender,
      height: height || '175',
      weight: weight || '70',
      allergies: '',
      profileCompleted: true,
      dietary_goals: { gluten_free: false, dairy_free: false, nut_free: false, soy_free: false, low_sugar: false, organic_only: false, weight_loss: false },
      skin_profile: { skin_type: 'normal', skin_tone: skinTone || 'medium', skin_concerns: [], avoid_ingredients: [] },
      hair_profile: { hair_type: 'straight', hair_concerns: [] },
      medical_profile: {
        conditions: { hypertension: false, pregnancy: false, diabetes: false, kidney_disease: false, heart_disease: false, thyroid: false, asthma: false, pcos: false, lactose_intolerance: false, gluten_intolerance: false },
        current_medications: [],
        drug_allergies: []
      },
      lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'weekly', water_intake: '2-3l' },
      health_goals: { weight_gain: false, muscle_building: false, healthy_eating: true, better_skin: false, acne_reduction: false, anti_aging: false, hair_care: false, diabetes_management: false, heart_health: false, allergy_safe: false },
      notifications: { harmful: true, food_allergens: true, cosmetic_allergens: true, recalls: true, high_sugar: false, high_sodium: false, skin_irritants: false, health_tips: true }
    };

    setTimeout(() => {
      saveProfile(normalProfile);
      setIsSaving(false);
      if (showToast) showToast("Onboarding complete! Health profile initialized with normal settings.", "success");
    }, 1000);
  };

  const handleNextStep = () => {
    // Validate Step 1 Essentials before moving
    if (onboardingStep === 1) {
      if (!name.trim()) {
        if (showToast) showToast("Full Name is mandatory.", "error");
        return;
      }
      if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
        if (showToast) showToast("A valid age is mandatory.", "error");
        return;
      }
      if (!gender) {
        if (showToast) showToast("Gender selection is mandatory.", "error");
        return;
      }
      if (!height || parseInt(height) <= 0) {
        if (showToast) showToast("Height is mandatory.", "error");
        return;
      }
      if (!weight || parseInt(weight) <= 0) {
        if (showToast) showToast("Weight is mandatory.", "error");
        return;
      }
    }
    setSlideDirection('next');
    setOnboardingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setSlideDirection('prev');
    setOnboardingStep(prev => prev - 1);
  };

  const resetForm = () => {
    if (confirm("Reset health profile and settings to defaults?")) {
      setName('');
      setAge(35);
      setGender('male');
      setAllergies('');
      setHeight('175');
      setWeight('70');
      
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

      // Reset integrated settings correctly via callback
      if (saveSettings) {
        saveSettings({
          mode: 'mock',
          apiKey: '',
          model: 'gemini-2.5-flash',
          verbose: true,
          haptic: true
        });
      }

      if (showToast) showToast("Form cleared to defaults.", "info");
    }
  };

  // ==========================================
  // RENDER PATH 1: Onboarding Mode (Stepper)
  // ==========================================
  if (!userProfile?.profileCompleted) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-6 animate-fade-in">
        
        {/* Onboarding Header Banner */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-primary">Onboarding: Set Up Your Health Profile</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Welcome to Guardian AI! Please complete the essential health details below to start personalized product label analysis.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => signOut(auth)}
            className="px-4 py-2.5 bg-white border border-outline-variant text-on-surface hover:bg-red-50 hover:text-error hover:border-error text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>

        {/* Stepper Wizard Card */}
        <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-[0_16px_48px_-12px_rgba(0,106,57,0.06)]">
          
          {/* Visual Step Stepper Progress bar */}
          <div className="flex justify-between items-center mb-10 relative px-4">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out z-0" 
                style={{ width: `${((onboardingStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="z-10 flex flex-col items-center">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    onboardingStep > step 
                      ? 'bg-primary text-white' 
                      : onboardingStep === step
                        ? 'bg-primary-container text-white border-2 border-primary scale-110 shadow-md shadow-primary/20'
                        : 'bg-slate-100 text-on-surface-variant border border-outline-variant/50'
                  }`}
                >
                  {onboardingStep > step ? <Check size={14} strokeWidth={3} /> : step}
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider hidden sm:inline ${
                  onboardingStep === step ? 'text-primary font-black' : 'text-on-surface-variant'
                }`}>
                  {step === 1 ? 'Essentials' : step === 2 ? 'Sensitivities' : step === 3 ? 'Lifestyle' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>

          {/* Stepper Content Wrapper with React dynamic key key-mount transition */}
          <div 
            key={onboardingStep} 
            className={slideDirection === 'next' ? 'animate-slide-next' : 'animate-slide-prev'}
          >
            
            {/* STEP 1: General Essentials (MANDATORY) */}
            {onboardingStep === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <User size={20} className="text-primary" /> Basic Essentials (Mandatory)
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Please provide your core metrics. These fields are mandatory to calculate safe dietary and intake thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50"
                      placeholder="e.g. 28"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Gender</label>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 bg-slate-50/50 rounded-xl outline-none text-xs focus:border-primary transition-all"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Height (cm)</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50"
                      placeholder="e.g. 175"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50"
                      placeholder="e.g. 70"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Medical Conditions & Food Allergies (OPTIONAL / SKIP) */}
            {onboardingStep === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Stethoscope size={20} className="text-red-500" /> Allergies &amp; Medical Conditions
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Select any concerns that apply to you. If none apply, simply check the **None / Normal Person** boxes or click Next to leave empty.
                  </p>
                </div>

                {/* Medical conditions */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Medical Conditions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'diabetes', label: 'Diabetes', state: diabetes },
                      { id: 'hypertension', label: 'Hypertension', state: hypertension },
                      { id: 'heart_disease', label: 'Heart Disease', state: heartDisease },
                      { id: 'kidney', label: 'Kidney Disease', state: kidney },
                      { id: 'pregnancy', label: 'Pregnancy', state: pregnancy },
                      { id: 'lactose', label: 'Lactose Intolerance', state: lactoseIntolerance },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          item.state 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={item.state} 
                          onChange={(e) => handleMedicalConditionChange(item.id, e.target.checked)} 
                          className="sr-only" 
                        />
                        {item.label}
                      </label>
                    ))}
                    <label 
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        medicalNone 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={medicalNone} 
                        onChange={(e) => handleMedicalConditionChange('none', e.target.checked)} 
                        className="sr-only" 
                      />
                      None / Normal
                    </label>
                  </div>
                </div>

                {/* Food Allergies */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Food Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'dairy', label: 'Milk', state: dairy },
                      { id: 'egg', label: 'Eggs', state: eggAllergy },
                      { id: 'nuts', label: 'Peanuts', state: nuts },
                      { id: 'soy', label: 'Soy', state: soy },
                      { id: 'gluten', label: 'Wheat', state: gluten },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                          item.state 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
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
                          : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={foodNone} 
                        onChange={(e) => handleFoodAllergyChange('none', e.target.checked)} 
                        className="sr-only" 
                      />
                      No Allergies
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dietary & Cosmetic Preferences (OPTIONAL / SKIP) */}
            {onboardingStep === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Coffee size={20} className="text-green-600" /> Dietary &amp; Skin Preferences
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Set up your basic dietary preference and skin type to customize the AI safety recommendation engine.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Dietary Preference</label>
                    <select 
                      value={dietaryPreference} 
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 bg-slate-50/50 rounded-xl outline-none text-xs focus:border-primary transition-all"
                    >
                      <option value="non-vegetarian">Non-Vegetarian</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="eggetarian">Eggetarian</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Skin Type</label>
                    <select 
                      value={skinType} 
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full p-3.5 border border-outline-variant/60 bg-slate-50/50 rounded-xl outline-none text-xs focus:border-primary transition-all"
                    >
                      <option value="normal">Normal</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Dietary Goals</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { state: sugar, setter: setSugar, label: 'Low Sugar' },
                        { state: organic, setter: setOrganic, label: 'Organic Only' },
                        { state: weightLoss, setter: setWeightLoss, label: 'Weight Loss' },
                      ].map((item, idx) => (
                        <label 
                          key={idx}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            item.state 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
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
                </div>
              </div>
            )}

            {/* STEP 4: Summary & Confirm */}
            {onboardingStep === 4 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Target size={20} className="text-primary" /> Review &amp; Finish
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Confirm your details. Click **Complete Setup** to register your profile in the database.
                  </p>
                </div>

                <div className="p-5 bg-slate-50/80 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                    <div>
                      <span className="text-on-surface-variant font-medium block">Name</span>
                      <span className="font-extrabold text-on-surface mt-0.5 block">{name}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-medium block">Age &amp; Gender</span>
                      <span className="font-extrabold text-on-surface mt-0.5 block capitalize">{age} yrs, {gender}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-medium block">Height &amp; Weight</span>
                      <span className="font-extrabold text-on-surface mt-0.5 block">{height} cm | {weight} kg</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-medium block">Diet Preference</span>
                      <span className="font-extrabold text-on-surface mt-0.5 block capitalize">{dietaryPreference}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-outline-variant/30 pt-3 flex flex-col gap-1.5">
                    <span className="text-xs text-on-surface-variant font-medium">Flagged Allergens &amp; Conditions:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {diabetes && <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/50 rounded-md text-[10px] font-bold">Diabetes</span>}
                      {hypertension && <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/50 rounded-md text-[10px] font-bold">Hypertension</span>}
                      {dairy && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-md text-[10px] font-bold">Dairy Allergy</span>}
                      {nuts && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-md text-[10px] font-bold">Nut Allergy</span>}
                      {gluten && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-md text-[10px] font-bold">Wheat Allergy</span>}
                      {!diabetes && !hypertension && !dairy && !nuts && !gluten && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200/50 rounded-md text-[10px] font-bold">None (Standard Health Profile)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Form Wizard Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-10 pt-6 border-t border-outline-variant/30">
            
            {/* Step Back or Skip / Normal */}
            <div className="flex gap-2">
              {onboardingStep > 1 ? (
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-outline-variant hover:bg-slate-50 text-on-surface text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleQuickComplete}
                  disabled={isSaving}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> I'm a Normal Person (Skip Setup)
                </button>
              )}
            </div>

            {/* Next or Finish Button */}
            <div>
              {onboardingStep < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="px-6 py-3.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="px-6 py-3.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSaving && <RefreshCw size={14} className="animate-spin" />}
                  {isSaving ? 'Registering...' : 'Complete & Finish Setup'}
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // RENDER PATH 2: Normal Settings Mode (Tabbed)
  // ==========================================
  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in w-full items-start">
      
      {/* Left Navigation: Tabs Selector */}
      <aside className="w-full lg:w-1/4 bg-white p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex-shrink-0">
        <div className="mb-6 pb-4 border-b border-outline-variant/20 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Settings size={22} className="animate-spin-slow" />
            <h4 className="text-sm font-black uppercase tracking-wider">Account Settings</h4>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Update your profiles and configuration details here.
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { id: 'general', label: 'General Info', icon: <User size={15} /> },
            { id: 'medical', label: 'Medical Conditions', icon: <Stethoscope size={15} /> },
            { id: 'allergies', label: 'Allergies & Diet', icon: <Droplet size={15} /> },
            { id: 'skin', label: 'Skin & Cosmetics', icon: <Sparkles size={15} /> },
            { id: 'hair', label: 'Hair Profile', icon: <Scissors size={15} /> },
            { id: 'alerts', label: 'Alerts & API Settings', icon: <BellRing size={15} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full text-left p-3.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-slate-50 hover:text-on-surface hover:translate-x-1'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Sync percentage progress info */}
        <div className="mt-8 pt-4 border-t border-outline-variant/20">
          <ProgressSidebar completion={completion} userProfile={userProfile} />
        </div>
      </aside>

      {/* Right Content Panel: Editable Form Inputs */}
      <div className="flex-grow w-full lg:w-3/4 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm">
          
          <form onSubmit={handleSaveAll} className="flex flex-col gap-6">
            
            {/* TAB 1: General Info */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <User size={20} className="text-primary" /> Personal Metrics
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Core parameters utilized for product safety indexing.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Age</label>
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
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Gender</label>
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
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Custom Allergies Text</label>
                    <input 
                      type="text" 
                      value={allergies} 
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                      placeholder="e.g. strawberries, penicillin"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Height (cm)</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                      placeholder="Height"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                      placeholder="Weight"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Medical Conditions */}
            {activeTab === 'medical' && (
              <div className="flex flex-col gap-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Stethoscope size={20} className="text-red-500" /> Medical Profile &amp; Medications
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Flag medical conditions to identify contraindications in active scanner ingredients.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'diabetes', label: 'Diabetes', state: diabetes },
                    { id: 'hypertension', label: 'Hypertension', state: hypertension },
                    { id: 'heart_disease', label: 'Heart Disease', state: heartDisease },
                    { id: 'kidney', label: 'Kidney Disease', state: kidney },
                    { id: 'thyroid', label: 'Thyroid Problems', state: thyroid },
                    { id: 'asthma', label: 'Asthma', state: asthma },
                    { id: 'pregnancy', label: 'Pregnancy', state: pregnancy },
                    { id: 'pcos', label: 'PCOS / Hormonal', state: pcos },
                    { id: 'lactose', label: 'Lactose Intolerant', state: lactoseIntolerance },
                    { id: 'gluten_int', label: 'Gluten Intolerant', state: glutenIntolerance },
                  ].map(item => (
                    <label 
                      key={item.id} 
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        item.state 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={item.state} 
                        onChange={(e) => handleMedicalConditionChange(item.id, e.target.checked)} 
                        className="sr-only" 
                      />
                      {item.label}
                    </label>
                  ))}
                  <label 
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      medicalNone 
                        ? 'bg-red-500/10 border-red-500 text-red-500' 
                        : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={medicalNone} 
                      onChange={(e) => handleMedicalConditionChange('none', e.target.checked)} 
                      className="sr-only" 
                    />
                    None / Normal
                  </label>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Current Medications (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={currentMeds} 
                    onChange={(e) => setCurrentMeds(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    placeholder="e.g. metformin, lisinopril"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Allergies & Diet */}
            {activeTab === 'allergies' && (
              <div className="flex flex-col gap-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Droplet size={20} className="text-amber-500" /> Allergies &amp; Dietary preferences
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Flag matching food allergens and specific dietary objectives.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Food Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'dairy', label: 'Milk', state: dairy },
                      { id: 'egg', label: 'Eggs', state: eggAllergy },
                      { id: 'nuts', label: 'Peanuts', state: nuts },
                      { id: 'treenut', label: 'Tree Nuts', state: treeNutAllergy },
                      { id: 'soy', label: 'Soy', state: soy },
                      { id: 'gluten', label: 'Wheat / Gluten', state: gluten },
                      { id: 'fish', label: 'Fish', state: fishAllergy },
                      { id: 'shellfish', label: 'Shellfish', state: shellfishAllergy },
                      { id: 'sesame', label: 'Sesame', state: sesameAllergy },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                          item.state 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
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
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Dietary Preferences</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'non-vegetarian', label: 'Non Vegetarian' },
                      { value: 'vegetarian', label: 'Vegetarian' },
                      { value: 'vegan', label: 'Vegan' },
                      { value: 'eggetarian', label: 'Eggetarian' }
                    ].map(item => (
                      <label 
                        key={item.value} 
                        className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          dietaryPreference === item.value 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="dietaryPrefTab" 
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
              </div>
            )}

            {/* TAB 4: Skin & Cosmetics */}
            {activeTab === 'skin' && (
              <div className="flex flex-col gap-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Sparkles size={20} className="text-teal-600" /> Skin Profile &amp; Sensitivities
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Flag cosmetic chemicals and allergens to avoid in makeup and cosmetics scans.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Skin Type</label>
                    <select 
                      value={skinType} 
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                    >
                      <option value="normal">Normal</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Skin Tone</label>
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
                </div>

                <div className="flex flex-col gap-3 mt-1">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Cosmetic Allergen Exclusions</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'fragrance', label: 'Fragrance' },
                      { id: 'parabens', label: 'Parabens' },
                      { id: 'warm_sulf', label: 'Sulfates' },
                      { id: 'alcohol', label: 'Alcohol' },
                      { id: 'essential_oils', label: 'Essential Oils' },
                      { id: 'silicone', label: 'Silicone' },
                      { id: 'mineral_oil', label: 'Mineral Oil' },
                    ].map(item => (
                      <label 
                        key={item.id} 
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                          avoidFragrance || avoidParabens || avoidSulfates || avoidAlcohol || avoidEssentialOils || avoidSilicone || avoidMineralOil
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={item.id === 'fragrance' ? avoidFragrance : item.id === 'parabens' ? avoidParabens : item.id === 'warm_sulf' ? avoidSulfates : item.id === 'alcohol' ? avoidAlcohol : item.id === 'essential_oils' ? avoidEssentialOils : item.id === 'silicone' ? avoidSilicone : avoidMineralOil} 
                          onChange={(e) => handleCosmeticAllergyChange(item.id, e.target.checked)} 
                          className="sr-only" 
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Hair Profile */}
            {activeTab === 'hair' && (
              <div className="flex flex-col gap-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <Scissors size={20} className="text-blue-600" /> Hair &amp; Scalp Profile
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Personalized options for shampoo and scalp items.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider">Hair Type</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['straight', 'wavy', 'curly', 'coily'].map(type => (
                      <label 
                        key={type} 
                        className={`p-3.5 rounded-xl border text-center text-xs font-bold capitalize cursor-pointer transition-all ${
                          hairType === type 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-slate-50/50 border-outline-variant/40 text-on-surface-variant hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="hairTypeRadioTab" 
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
              </div>
            )}

            {/* TAB 6: Alerts & Settings */}
            {activeTab === 'alerts' && (
              <div className="flex flex-col gap-6">
                
                {/* Notification Settings */}
                <div className="flex flex-col gap-4">
                  <div className="pb-3 border-b border-outline-variant/20">
                    <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                      <BellRing size={18} className="text-blue-500" /> Notification Toggles
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Configure active scanning system popup warning alerts.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Harmful Ingredients', state: notifyHarmful, setter: setNotifyHarmful, desc: 'Flag carcinogens & controversies' },
                      { label: 'Food Allergens', state: notifyFoodAllergens, setter: setNotifyFoodAllergens, desc: 'Allergy alerts on food label scans' },
                      { label: 'Cosmetic Allergens', state: notifyCosmeticAllergens, setter: setNotifyCosmeticAllergens, desc: 'Warning matches on cosmetics' },
                      { label: 'Skin Irritants', state: notifySkinIrritants, setter: setNotifySkinIrritants, desc: 'Alerts matching skin type' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-outline-variant/30 bg-slate-50/40">
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
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API settings */}
                <div className="flex flex-col gap-4 mt-2">
                  <div className="pb-3 border-b border-outline-variant/20">
                    <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                      <Settings size={18} className="text-primary" /> Gemini AI Engine Settings
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Configure your Google Gemini API key to enable live label parsing.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">API Connection Mode</label>
                      <select 
                        value={apiMode} 
                        onChange={(e) => setApiMode(e.target.value)}
                        className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                      >
                        <option value="mock">Offline Simulation (No API Key Required)</option>
                        <option value="gemini">Google Gemini Live Connection</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Gemini Model selection</label>
                      <select 
                        value={apiModel} 
                        onChange={(e) => setApiModel(e.target.value)}
                        className="w-full p-3 border border-outline-variant/50 bg-white rounded-xl outline-none text-xs focus:border-primary transition-all"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Thorough)</option>
                      </select>
                    </div>

                    {apiMode === 'gemini' && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2 animate-fade-in">
                        <label className="text-[10px] font-extrabold uppercase text-on-surface-variant">Google AI Studio API Key</label>
                        <input 
                          type="password" 
                          value={apiKey} 
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full p-3 border border-outline-variant/50 rounded-xl outline-none text-xs focus:border-primary bg-white"
                          placeholder="AIzaSy..."
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Form Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-outline-variant/30 mt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl text-xs hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSaving && <RefreshCw size={14} className="animate-spin" />}
                {isSaving ? 'Saving Changes...' : 'Save Health Profile'}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3.5 border border-outline rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors bg-transparent text-on-surface cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
