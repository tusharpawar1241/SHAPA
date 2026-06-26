import React, { useState, useEffect } from 'react';

export default function ProfileView({ userProfile, saveProfile, showToast }) {
  // general
  const [name, setName] = useState('');
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState('male');
  const [allergies, setAllergies] = useState('');
  
  // food
  const [gluten, setGluten] = useState(false);
  const [dairy, setDairy] = useState(false);
  const [nuts, setNuts] = useState(false);
  const [soy, setSoy] = useState(false);
  const [sugar, setSugar] = useState(false);
  const [organic, setOrganic] = useState(false);
  const [weightLoss, setWeightLoss] = useState(false);

  // skin
  const [skinType, setSkinType] = useState('sensitive');
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [avoidCosmetics, setAvoidCosmetics] = useState('');

  // meds
  const [hypertension, setHypertension] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [kidney, setKidney] = useState(false);
  const [currentMeds, setCurrentMeds] = useState('');

  // JSON view
  const [jsonText, setJsonText] = useState('');
  const [jsonEditing, setJsonEditing] = useState(false);

  // Sync inputs with userProfile prop on mount/change
  useEffect(() => {
    if (userProfile) {
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
      setAvoidCosmetics((userProfile.skin_profile?.avoid_ingredients || []).join(', '));

      setHypertension(!!userProfile.medical_profile?.conditions?.hypertension);
      setPregnancy(!!userProfile.medical_profile?.conditions?.pregnancy);
      setDiabetes(!!userProfile.medical_profile?.conditions?.diabetes);
      setKidney(!!userProfile.medical_profile?.conditions?.kidney_disease);
      setCurrentMeds((userProfile.medical_profile?.current_medications || []).join(', '));

      setJsonText(JSON.stringify(userProfile, null, 2));
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();

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
        avoid_ingredients: avoidCosmetics.split(',').map(s => s.trim().toLowerCase()).filter(s => s)
      },
      medical_profile: {
        conditions: {
          hypertension,
          pregnancy,
          diabetes,
          kidney_disease: kidney
        },
        current_medications: currentMeds.split(',').map(s => s.trim().toLowerCase()).filter(s => s),
        drug_allergies: userProfile.medical_profile?.drug_allergies || []
      }
    };

    saveProfile(updated);
    if (showToast) showToast("Profile saved successfully!", "success");
  };

  const handleJsonAction = () => {
    if (jsonEditing) {
      try {
        const parsed = JSON.parse(jsonText);
        saveProfile(parsed);
        setJsonEditing(false);
        if (showToast) showToast("JSON parsed and profile updated successfully!", "success");
      } catch (err) {
        if (showToast) showToast("Invalid JSON format: " + err.message, "error");
      }
    } else {
      setJsonEditing(true);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
      if (showToast) showToast("Profile JSON copied to clipboard!", "success");
    });
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
          User Configuration
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface leading-tight">
          Health Profile
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Configure the health metrics, allergies, and concerns that drive the AI safety analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Profile Inputs Form */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* General Info */}
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-primary mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>General Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary focus:ring-1 focus:ring-secondary transition-all bg-white"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary focus:ring-1 focus:ring-secondary transition-all bg-white"
                    placeholder="e.g. 35"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">General Allergies (e.g. peanuts, dairy, gluten)</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary focus:ring-1 focus:ring-secondary transition-all bg-white"
                  placeholder="e.g. peanuts, milk, sulfur"
                />
              </div>
            </div>

            {/* Food Rules */}
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-secondary mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">restaurant</span>
                <span>Food Safety Settings</span>
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface mb-1">Dietary Restrictions &amp; Goals</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={gluten} 
                      onChange={(e) => setGluten(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Gluten-Free
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={dairy} 
                      onChange={(e) => setDairy(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Dairy-Free / Lactose-Free
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={nuts} 
                      onChange={(e) => setNuts(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Nut-Free
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={soy} 
                      onChange={(e) => setSoy(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Soy-Free
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={sugar} 
                      onChange={(e) => setSugar(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Low Processed Sugar Goal
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={organic} 
                      onChange={(e) => setOrganic(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Organic Only
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none col-span-1 sm:col-span-2">
                    <input 
                      type="checkbox" 
                      checked={weightLoss} 
                      onChange={(e) => setWeightLoss(e.target.checked)}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Weight Loss Goals (Flags High Sugar &amp; Fats)
                  </label>
                </div>
              </div>
            </div>

            {/* Skincare Rules */}
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-on-surface mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">face</span>
                <span>Skincare Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Skin Type</label>
                  <select 
                    value={skinType} 
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all"
                  >
                    <option value="sensitive">Sensitive Skin</option>
                    <option value="dry">Dry Skin</option>
                    <option value="oily">Oily Skin</option>
                    <option value="combination">Combination Skin</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Avoid Ingredients</label>
                  <input 
                    type="text" 
                    value={avoidCosmetics} 
                    onChange={(e) => setAvoidCosmetics(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                    placeholder="e.g. Parabens, Fragrance, Phthalates"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface mb-1 bg-transparent">Skin Concerns</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={skinConcerns.includes("acne")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSkinConcerns([...skinConcerns, "acne"]);
                        } else {
                          setSkinConcerns(skinConcerns.filter(c => c !== "acne"));
                        }
                      }}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Acne-Prone
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={skinConcerns.includes("pigmentation")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSkinConcerns([...skinConcerns, "pigmentation"]);
                        } else {
                          setSkinConcerns(skinConcerns.filter(c => c !== "pigmentation"));
                        }
                      }}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Pigmentation / Dark Spots
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={skinConcerns.includes("dryness")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSkinConcerns([...skinConcerns, "dryness"]);
                        } else {
                          setSkinConcerns(skinConcerns.filter(c => c !== "dryness"));
                        }
                      }}
                      className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                    />
                    Dryness / Flakiness
                  </label>
                </div>
              </div>
            </div>

            {/* Medicine Rules */}
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-tertiary mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">medical_services</span>
                <span>Medical Conditions &amp; Drugs</span>
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-on-surface mb-1">Health Conditions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={hypertension} 
                        onChange={(e) => setHypertension(e.target.checked)}
                        className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                      />
                      Hypertension (High Blood Pressure)
                    </label>
                    <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={pregnancy} 
                        onChange={(e) => setPregnancy(e.target.checked)}
                        className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                      />
                      Pregnancy / Nursing
                    </label>
                    <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={diabetes} 
                        onChange={(e) => setDiabetes(e.target.checked)}
                        className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                      />
                      Diabetes
                    </label>
                    <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={kidney} 
                        onChange={(e) => setKidney(e.target.checked)}
                        className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
                      />
                      Kidney Disease
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Current Medications (For drug-to-drug checks)</label>
                  <input 
                    type="text" 
                    value={currentMeds} 
                    onChange={(e) => setCurrentMeds(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all bg-white"
                    placeholder="e.g. Lisinopril, Aspirin, Warfarin"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-container shadow-md cursor-pointer transition-colors duration-150 border-none outline-none"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right column: JSON Display */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Raw JSON Profile</h3>
              <span className="material-symbols-outlined text-sm text-outline">code</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-[-8px]">
              This is the exact JSON structure sent to Gemini:
            </p>
            <textarea 
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              readOnly={!jsonEditing}
              className={`font-mono text-[10px] w-full h-[360px] p-3 border border-outline-variant rounded-xl outline-none resize-none transition-colors duration-200 ${
                jsonEditing ? 'bg-white border-secondary ring-1 ring-secondary' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            ></textarea>
            <div className="flex gap-3">
              <button 
                onClick={copyJson}
                className="flex-1 border border-outline px-4 py-2.5 rounded-xl text-[11px] font-bold hover:bg-surface-container-low transition-colors text-center cursor-pointer bg-transparent text-on-surface"
              >
                Copy JSON
              </button>
              <button 
                onClick={handleJsonAction}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors ${
                  jsonEditing 
                    ? 'bg-secondary text-white hover:bg-secondary-container' 
                    : 'border border-outline hover:bg-surface-container-low bg-transparent text-on-surface'
                }`}
              >
                {jsonEditing ? 'Save Raw JSON' : 'Edit Raw JSON'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
