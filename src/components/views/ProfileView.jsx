import React, { useState, useEffect } from 'react';

export default function ProfileView({ userProfile, saveProfile }) {
  // general
  const [name, setName] = useState('');
  
  // food
  const [gluten, setGluten] = useState(false);
  const [dairy, setDairy] = useState(false);
  const [nuts, setNuts] = useState(false);
  const [soy, setSoy] = useState(false);
  const [sugar, setSugar] = useState(false);
  const [organic, setOrganic] = useState(false);

  // skin
  const [skinType, setSkinType] = useState('sensitive');
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
      
      setGluten(!!userProfile.dietary_goals.gluten_free);
      setDairy(!!userProfile.dietary_goals.dairy_free);
      setNuts(!!userProfile.dietary_goals.nut_free);
      setSoy(!!userProfile.dietary_goals.soy_free);
      setSugar(!!userProfile.dietary_goals.low_sugar);
      setOrganic(!!userProfile.dietary_goals.organic_only);

      setSkinType(userProfile.skin_profile.skin_type || 'sensitive');
      setAvoidCosmetics((userProfile.skin_profile.avoid_ingredients || []).join(', '));

      setHypertension(!!userProfile.medical_profile.conditions.hypertension);
      setPregnancy(!!userProfile.medical_profile.conditions.pregnancy);
      setDiabetes(!!userProfile.medical_profile.conditions.diabetes);
      setKidney(!!userProfile.medical_profile.conditions.kidney_disease);
      setCurrentMeds((userProfile.medical_profile.current_medications || []).join(', '));

      setJsonText(JSON.stringify(userProfile, null, 2));
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updated = {
      name,
      dietary_goals: {
        gluten_free: gluten,
        dairy_free: dairy,
        nut_free: nuts,
        soy_free: soy,
        low_sugar: sugar,
        organic_only: organic
      },
      skin_profile: {
        skin_type: skinType,
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
        drug_allergies: userProfile.medical_profile.drug_allergies || []
      }
    };

    saveProfile(updated);
    alert("Profile saved successfully!");
  };

  const handleJsonAction = () => {
    if (jsonEditing) {
      // Save direct JSON
      try {
        const parsed = JSON.parse(jsonText);
        saveProfile(parsed);
        setJsonEditing(false);
        alert("JSON parsed and profile updated successfully!");
      } catch (err) {
        alert("Invalid JSON format: " + err.message);
      }
    } else {
      setJsonEditing(true);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
      alert("Profile JSON copied to clipboard!");
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
          Configure the allergen and goal rules that drive the AI safety evaluator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Profile Inputs Form */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-primary mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>General Details</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  placeholder="e.g. John Doe"
                  required
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
                <label className="text-xs font-semibold text-on-surface mb-1">Dietary Restrictions &amp; Allergies</label>
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
                </div>
              </div>
            </div>

            {/* Skincare Rules */}
            <div>
              <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-on-surface mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">face</span>
                <span>Skincare Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Skin Type</label>
                  <select 
                    value={skinType} 
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all"
                  >
                    <option value="sensitive">Sensitive Skin (easily irritated)</option>
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
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all"
                    placeholder="e.g. Parabens, Fragrance, Phthalates"
                  />
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
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all"
                    placeholder="e.g. Lisinopril, Aspirin, Warfarin"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-container shadow-md cursor-pointer transition-colors duration-150"
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
              This is the exact <code className="bg-surface-container-high px-1 rounded font-mono font-bold">{`{USER_PROFILE_JSON}`}</code> synced structure sent to Gemini:
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
                className="flex-1 border border-outline px-4 py-2.5 rounded-xl text-[11px] font-bold hover:bg-surface-container-low transition-colors text-center cursor-pointer"
              >
                Copy JSON
              </button>
              <button 
                onClick={handleJsonAction}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors ${
                  jsonEditing 
                    ? 'bg-secondary text-white hover:bg-secondary-container' 
                    : 'border border-outline hover:bg-surface-container-low'
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
