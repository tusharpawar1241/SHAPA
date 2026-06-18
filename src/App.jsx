import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import HomeView from './components/views/HomeView';
import ScanView from './components/views/ScanView';
import ResultsView from './components/views/ResultsView';
import ProfileView from './components/views/ProfileView';
import SettingsView from './components/views/SettingsView';
import LoadingOverlay from './components/common/LoadingOverlay';

import { mockDatabase } from './utils/mockData';
import { runRulesEngine } from './utils/rulesEngine';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('food');
  const [resultsData, setResultsData] = useState(null);
  
  // Loading state
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('');

  // Default User Profile state
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    dietary_goals: {
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      soy_free: false,
      low_sugar: true,
      organic_only: false
    },
    skin_profile: {
      skin_type: "sensitive",
      avoid_ingredients: ["parabens", "sulfates", "phthalates"]
    },
    medical_profile: {
      conditions: {
        hypertension: true,
        pregnancy: false,
        diabetes: false,
        kidney_disease: false
      },
      current_medications: ["lisinopril"],
      drug_allergies: []
    }
  });

  // Default API Settings state
  const [apiSettings, setApiSettings] = useState({
    mode: 'mock',
    apiKey: '',
    model: 'gemini-2.5-flash',
    verbose: true,
    haptic: true
  });

  // History state
  const [scanHistory, setScanHistory] = useState([]);

  // Load state from local storage on mount
  useEffect(() => {
    const cachedProfile = localStorage.getItem('guardian_user_profile');
    if (cachedProfile) {
      setUserProfile(JSON.parse(cachedProfile));
    }

    const cachedSettings = localStorage.getItem('guardian_api_settings');
    if (cachedSettings) {
      setApiSettings(JSON.parse(cachedSettings));
    }

    const cachedHistory = localStorage.getItem('guardian_scan_history');
    if (cachedHistory) {
      setScanHistory(JSON.parse(cachedHistory));
    } else {
      const defaultHistory = [
        {
          product_name: "SuperSweet Cereal",
          brand_name: "MegaGrain Corp",
          safety_score: 3.5,
          category: "food",
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString()
        }
      ];
      setScanHistory(defaultHistory);
      localStorage.setItem('guardian_scan_history', JSON.stringify(defaultHistory));
    }
  }, []);

  const switchView = (viewName) => {
    setCurrentView(viewName);
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
  };

  const saveProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('guardian_user_profile', JSON.stringify(updatedProfile));
  };

  const saveSettings = (updatedSettings) => {
    setApiSettings(updatedSettings);
    localStorage.setItem('guardian_api_settings', JSON.stringify(updatedSettings));
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.setItem('guardian_scan_history', JSON.stringify([]));
  };

  const hapticFeedback = () => {
    if (apiSettings.haptic && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const addToHistory = (productName, brandName, safetyScore, category) => {
    const newItem = {
      product_name: productName || "Unknown Product",
      brand_name: brandName || "Unknown Brand",
      safety_score: safetyScore || 0,
      category: category,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newItem, ...scanHistory].slice(0, 15);
    setScanHistory(updated);
    localStorage.setItem('guardian_scan_history', JSON.stringify(updated));
  };

  // Mock scan simulator trigger
  const triggerMockScan = (sampleId) => {
    setLoadingActive(true);
    setLoadingTitle("Simulating Label Analysis");
    setLoadingStatus("Extracting OCR text from sample image...");

    setTimeout(() => {
      setLoadingStatus("Evaluating chemicals against user profile...");
    }, 1000);

    setTimeout(() => {
      const samples = mockDatabase[activeCategory] || [];
      const item = samples.find(s => s.id === sampleId);
      if (item) {
        const evaluated = runRulesEngine(item, activeCategory, userProfile);
        setResultsData(evaluated);
        addToHistory(evaluated.product_name, evaluated.brand_name, evaluated.safety_score, activeCategory);
        setLoadingActive(false);
        switchView('results');
      } else {
        setLoadingActive(false);
        alert("Sample item not found.");
      }
    }, 2000);
  };

  // View archived item
  const viewHistoryItem = (index) => {
    const logItem = scanHistory[index];
    if (logItem) {
      const samples = mockDatabase[logItem.category] || [];
      let dbItem = samples.find(s => s.product_name === logItem.product_name);
      
      if (!dbItem) {
        dbItem = {
          product_name: logItem.product_name,
          brand_name: logItem.brand_name,
          extracted_ingredients: logItem.category === 'food' ? ["Sugar", "Wheat", "Salt"] : logItem.category === 'cosmetics' ? ["Water", "Parabens"] : ["Aspirin"],
          safety_score: logItem.safety_score,
          better_alternatives: [],
          disclaimer: "Archived historical analysis report."
        };
      }
      
      setActiveCategory(logItem.category);
      const evaluated = runRulesEngine(dbItem, logItem.category, userProfile);
      setResultsData(evaluated);
      switchView('results');
    }
  };

  // Gemini API analysis caller
  const analyzeBase64Image = async (base64Image, mimeType) => {
    setLoadingActive(true);
    setLoadingTitle("Analyzing Label via Gemini");
    setLoadingStatus("Connecting to Google AI Studio...");

    if (apiSettings.mode === 'mock' || !apiSettings.apiKey) {
      // Simulator fallback
      setTimeout(() => { setLoadingStatus("OCR character extraction complete..."); }, 1000);
      setTimeout(() => {
        const samples = mockDatabase[activeCategory] || [];
        const item = samples[Math.floor(Math.random() * samples.length)];
        const evaluated = runRulesEngine(item, activeCategory, userProfile);
        
        setResultsData(evaluated);
        addToHistory(evaluated.product_name, evaluated.brand_name, evaluated.safety_score, activeCategory);
        
        setLoadingActive(false);
        switchView('results');
      }, 2000);
    } else {
      // Live Gemini connection
      try {
        setLoadingStatus("Sending payload to Gemini model...");
        
        const profileString = JSON.stringify(userProfile);
        const prompt = `You are an expert AI Product Safety Assistant tasked with analyzing the provided image of a ${activeCategory.toUpperCase()} product and cross-referencing its contents against this user profile: ${profileString}. Scan the image to accurately extract the product name, brand, and ingredients or nutritional/medical facts, correcting any inherent OCR errors. Based on the extracted data and the specific category rules—if Food, evaluate sugar, fat, sodium, and health-goal friendliness; if Cosmetics, check suitability for the user's skin type and flag allergens; if Medicine, identify uses, side effects, and strictly flag warnings related to the user's health conditions or drug interactions—evaluate the product's safety. Finally, you must return the results strictly as a raw JSON object without any markdown formatting or extra conversational text, using exactly these keys: "product_name", "brand_name", "extracted_ingredients" (as a list), "safety_score" (from 0 to 10), "analysis_summary" (a 2-sentence summary), "compatibility_flags" (a list of objects containing "flag_type" and "message"), "better_alternatives" (a list of alternative products), and "disclaimer" (stating this is for educational purposes only).`;

        if (apiSettings.verbose) {
          console.log("GEMINI PROMPT:", prompt);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiSettings.model}:generateContent?key=${apiSettings.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Image
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP Error status: ${response.status}. Please check your API key.`);
        }

        const json = await response.json();
        const rawText = json.candidates[0].content.parts[0].text;
        
        if (apiSettings.verbose) {
          console.log("GEMINI RESPONSE:", rawText);
        }

        const parsed = JSON.parse(rawText);
        
        // Ensure alternatives are present
        if (parsed.better_alternatives) {
          parsed.better_alternatives = parsed.better_alternatives.map((alt, idx) => {
            return {
              name: alt.name || alt.product_name || `Alternative ${idx + 1}`,
              desc: alt.desc || alt.description || "A compatible natural replacement.",
              score: alt.safety_score ? alt.safety_score.toString() : "9.0",
              price: alt.price || "$9.99",
              image: alt.image || (activeCategory === 'food' ? "/cereal_label.png" : activeCategory === 'cosmetics' ? "/cosmetic_label.png" : "/medicine_label.png"),
              tags: alt.tags || ["SAFE", "COMPATIBLE"]
            };
          });
        }

        setResultsData(parsed);
        addToHistory(parsed.product_name, parsed.brand_name, parsed.safety_score, activeCategory);
        
        setLoadingActive(false);
        switchView('results');

      } catch (err) {
        console.error(err);
        setLoadingActive(false);
        alert("AI Analysis Failed: " + err.message + "\n\nReverting to Local Simulator.");
        // Save mode toggle back to mock
        const newSettings = { ...apiSettings, mode: 'mock' };
        setApiSettings(newSettings);
        localStorage.setItem('guardian_api_settings', JSON.stringify(newSettings));
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-on-surface">
      {/* Shutter flash screen component */}
      <div id="flash-screen" className="fixed inset-0 bg-white z-[1000] opacity-0 pointer-events-none"></div>

      {/* 1. Sidebar Nav (Desktop only) */}
      <Sidebar 
        currentView={currentView} 
        switchView={switchView} 
        userProfile={userProfile}
      />

      {/* Main content view column */}
      <div className="flex-grow md:ml-[260px] flex flex-col min-h-screen pb-[72px] md:pb-0">
        
        {/* Header */}
        <Header switchView={switchView} />

        {/* View content panel */}
        <main className="flex-grow p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6">
          {currentView === 'home' && (
            <HomeView 
              switchView={switchView} 
              selectCategory={selectCategory} 
              userProfile={userProfile} 
            />
          )}

          {currentView === 'scan' && (
            <ScanView 
              activeCategory={activeCategory}
              selectCategory={selectCategory}
              mockDatabase={mockDatabase}
              scanHistory={scanHistory}
              clearHistory={clearHistory}
              triggerMockScan={triggerMockScan}
              analyzeBase64Image={analyzeBase64Image}
              viewHistoryItem={viewHistoryItem}
              hapticFeedback={hapticFeedback}
            />
          )}

          {currentView === 'results' && (
            <ResultsView 
              resultsData={resultsData} 
              activeCategory={activeCategory} 
              switchView={switchView} 
            />
          )}

          {currentView === 'profile' && (
            <ProfileView 
              userProfile={userProfile} 
              saveProfile={saveProfile} 
            />
          )}

          {currentView === 'settings' && (
            <SettingsView 
              apiSettings={apiSettings} 
              saveSettings={saveSettings} 
            />
          )}
        </main>

        {/* Desktop Footer */}
        <footer className="mt-auto p-6 border-t border-outline-variant/30 bg-surface-container-lowest text-center text-[11px] text-on-surface-variant">
          <p>&copy; 2026 Guardian AI Health Assistant. For educational and demonstrative purposes only.</p>
        </footer>

      </div>

      {/* Floating Action Button (Mobile only scan clicker) */}
      <button 
        onClick={() => switchView('scan')}
        className="fixed bottom-20 right-6 w-[58px] h-[58px] rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 md:hidden cursor-pointer"
        title="Quick Scan Label"
      >
        <span className="material-symbols-outlined text-[28px]">photo_camera</span>
      </button>

      {/* 2. Bottom Nav (Mobile only) */}
      <BottomNav currentView={currentView} switchView={switchView} />

      {/* 3. Loading Overlay */}
      <LoadingOverlay 
        active={loadingActive} 
        title={loadingTitle} 
        status={loadingStatus} 
      />
    </div>
  );
}
