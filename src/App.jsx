import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import HomeView from './components/views/HomeView';
import ScanView from './components/views/ScanView';
import ResultsView from './components/views/ResultsView';
import ProfileView from './components/views/ProfileView';
import LoadingOverlay from './components/common/LoadingOverlay';

import { mockDatabase } from './utils/mockData';
import { runRulesEngine } from './utils/rulesEngine';
import { analyzeProductWithLangchain } from './utils/langchainService';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoginView from './components/views/LoginView';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('food');
  const [resultsData, setResultsData] = useState(null);
  
  // Loading state — single object to avoid 3 separate re-renders
  const [loading, setLoading] = useState({ active: false, title: '', status: '' });
  const startLoading = useCallback((title, status) => setLoading({ active: true, title, status }), []);
  const updateLoadingStatus = useCallback((status) => setLoading(prev => ({ ...prev, status })), []);
  const stopLoading = useCallback(() => setLoading({ active: false, title: '', status: '' }), []);

  // Toast Notification State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [devPreviewMode, setDevPreviewMode] = useState(false);

  // Default User Profile state
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    age: 35,
    gender: "male",
    allergies: "peanuts, milk",
    dietary_goals: {
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      soy_free: false,
      low_sugar: true,
      organic_only: false,
      weight_loss: false
    },
    skin_profile: {
      skin_type: "sensitive",
      skin_concerns: ["acne", "dryness"],
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

  const rawEnvApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const envApiKey = (rawEnvApiKey.trim() === '' || rawEnvApiKey.includes('YOUR_GEMINI_API_KEY_HERE')) ? '' : rawEnvApiKey;

  // Default API Settings state
  const [apiSettings, setApiSettings] = useState(() => {
    const cachedSettings = localStorage.getItem('guardian_api_settings');
    if (cachedSettings) {
      const parsed = JSON.parse(cachedSettings);
      // Clean up placeholder key in cached settings
      if (parsed.apiKey && (parsed.apiKey.includes('YOUR_GEMINI_API_KEY_HERE') || parsed.apiKey.trim() === '')) {
        parsed.apiKey = '';
        parsed.mode = 'mock';
      }
      if (envApiKey) {
        parsed.apiKey = envApiKey;
        parsed.mode = 'gemini';
      }
      if (parsed.model === 'gemini-1.5-flash') {
        parsed.model = 'gemini-2.5-flash';
      }
      return parsed;
    }
    return {
      mode: envApiKey ? 'gemini' : 'mock',
      apiKey: envApiKey,
      model: 'gemini-2.5-flash',
      verbose: true,
      haptic: true
    };
  });

  // History state
  const [scanHistory, setScanHistory] = useState(() => {
    const cachedHistory = localStorage.getItem('guardian_scan_history');
    if (cachedHistory) {
      return JSON.parse(cachedHistory);
    }
    const defaultHistory = [
      {
        product_name: "SuperSweet Cereal",
        brand_name: "MegaGrain Corp",
        safety_score: 3.5,
        category: "food",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString()
      }
    ];
    localStorage.setItem('guardian_scan_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  // Firebase Auth Listener
  // BUG FIX: removed `userProfile` from dependency array — it caused an infinite loop
  // (onAuthStateChanged fires → setUserProfile → dependency changes → re-subscribes → fires again)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const firestoreProfile = docSnap.data();
            // Keep the profile name in sync with the Google account name
            if (user.displayName && firestoreProfile.name !== user.displayName) {
              firestoreProfile.name = user.displayName;
              await setDoc(docRef, firestoreProfile);
            }
            setUserProfile(firestoreProfile);
          } else {
            // Create default profile in Firestore — use Google account name if available
            const defaultProfile = {
              name: user.displayName || "New User", age: 25, gender: "", allergies: "",
              dietary_goals: { gluten_free: false, dairy_free: false, nut_free: false, soy_free: false, low_sugar: false, organic_only: false, weight_loss: false },
              skin_profile: { skin_type: "normal", skin_concerns: [], avoid_ingredients: [] },
              medical_profile: { conditions: { hypertension: false, pregnancy: false, diabetes: false, kidney_disease: false }, current_medications: [], drug_allergies: [] }
            };
            await setDoc(docRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          console.error("Error fetching profile from Firestore:", error);
          const cachedProfile = localStorage.getItem('guardian_user_profile');
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
          }
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchView = useCallback((viewName) => setCurrentView(viewName), []);
  const selectCategory = useCallback((category) => setActiveCategory(category), []);

  const saveProfile = useCallback(async (updatedProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('guardian_user_profile', JSON.stringify(updatedProfile));
    
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        await setDoc(docRef, updatedProfile);
      } catch (error) {
        console.error("Error saving profile to Firestore:", error);
      }
    }
  }, [currentUser]);

  const saveSettings = useCallback((updatedSettings) => {
    setApiSettings(updatedSettings);
    localStorage.setItem('guardian_api_settings', JSON.stringify(updatedSettings));
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
    localStorage.setItem('guardian_scan_history', JSON.stringify([]));
  }, []);

  const hapticFeedback = useCallback(() => {
    if (apiSettings.haptic && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [apiSettings.haptic]);

  const addToHistory = useCallback((productName, brandName, safetyScore, category) => {
    const newItem = {
      product_name: productName || "Unknown Product",
      brand_name: brandName || "Unknown Brand",
      safety_score: safetyScore || 0,
      category,
      timestamp: new Date().toLocaleString()
    };
    setScanHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 15);
      localStorage.setItem('guardian_scan_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Shared helper to normalize alternatives from Gemini response — avoids code duplication
  const normalizeAlternatives = useCallback((parsed, category) => {
    if (!parsed.better_alternatives) return parsed;
    const imageMap = { food: '/cereal_label.png', cosmetics: '/cosmetic_label.png', medicine: '/medicine_label.png' };
    parsed.better_alternatives = parsed.better_alternatives.map((alt, idx) => ({
      name: alt.name || alt.product_name || `Alternative ${idx + 1}`,
      desc: alt.desc || alt.description || 'A compatible natural replacement.',
      score: alt.safety_score ? String(alt.safety_score) : '9.0',
      price: alt.price || '$9.99',
      image: alt.image || imageMap[category] || '/cereal_label.png',
      tags: alt.tags || ['SAFE', 'COMPATIBLE']
    }));
    return parsed;
  }, []);

  // Mock scan simulator trigger
  const triggerMockScan = useCallback((sampleId) => {
    startLoading('Simulating Label Analysis', 'Extracting OCR text from sample image...');

    setTimeout(() => updateLoadingStatus('Evaluating chemicals against user profile...'), 1000);

    setTimeout(() => {
      const samples = mockDatabase[activeCategory] || [];
      const item = samples.find(s => s.id === sampleId);
      if (item) {
        const evaluated = runRulesEngine(item, activeCategory, userProfile);
        setResultsData(evaluated);
        addToHistory(evaluated.product_name, evaluated.brand_name, evaluated.safety_score, activeCategory);
        stopLoading();
        switchView('results');
      } else {
        stopLoading();
        alert('Sample item not found.');
      }
    }, 2000);
  }, [activeCategory, userProfile, addToHistory, startLoading, updateLoadingStatus, stopLoading, switchView]);

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
  const analyzeBase64Image = useCallback(async (base64Image, mimeType) => {
    startLoading('Analyzing Label via Gemini', 'Connecting to Google AI Studio...');

    try {
      updateLoadingStatus('Sending payload to Gemini model...');
      const parsed = await analyzeProductWithLangchain(activeCategory, userProfile, apiSettings, null, base64Image, mimeType);
      
      if (parsed.error_message) {
        stopLoading();
        showToast(`API connection problem: ${parsed.error_message}`, 'error');
        return;
      }

      // Auto-correct category if AI detected a different product type
      const realCategory = parsed.detected_category || activeCategory;
      if (realCategory !== activeCategory) {
        setActiveCategory(realCategory);
      }
      normalizeAlternatives(parsed, realCategory);
      setResultsData(parsed);
      addToHistory(parsed.product_name, parsed.brand_name, parsed.safety_score, realCategory);
      stopLoading();
      switchView('results');
    } catch (err) {
      console.error(err);
      stopLoading();
      showToast('API connection problem: ' + (err.message || 'Unknown error'), 'error');
    }
  }, [activeCategory, userProfile, apiSettings, addToHistory, normalizeAlternatives, startLoading, updateLoadingStatus, stopLoading, switchView, showToast]);

  // Gemini API text search caller
  const analyzeTextQuery = useCallback(async (queryText, compareText, activeCategoryOverride) => {
    const category = activeCategoryOverride || activeCategory;
    startLoading('AI Product Identification', 'Connecting to Google AI Studio...');

    try {
      const parsed = await analyzeProductWithLangchain(category, userProfile, apiSettings, queryText, null, null, compareText);
      
      if (parsed.error_message) {
        stopLoading();
        showToast(`API connection problem: ${parsed.error_message}`, 'error');
        return;
      }

      // Auto-correct category if AI detected a different product type
      const realCategory = parsed.detected_category || category;
      if (realCategory !== activeCategory) {
        setActiveCategory(realCategory);
      }
      normalizeAlternatives(parsed, realCategory);
      setResultsData(parsed);
      addToHistory(parsed.product_name, parsed.brand_name, parsed.safety_score, realCategory);
      stopLoading();
      switchView('results');
    } catch (err) {
      console.error(err);
      stopLoading();
      showToast('API connection problem: ' + (err.message || 'Unknown error'), 'error');
    }
  }, [activeCategory, userProfile, apiSettings, addToHistory, normalizeAlternatives, startLoading, updateLoadingStatus, stopLoading, switchView, showToast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-on-surface">
      {/* Shutter flash screen component */}
      <div id="flash-screen" className="fixed inset-0 bg-white z-[1000] opacity-0 pointer-events-none"></div>

      {/* 1. Sidebar Nav (Desktop only) */}
      <Sidebar 
        currentView={currentView} 
        switchView={switchView}
        apiSettings={apiSettings} 
      />

      {/* Main content view column */}
      <div className="flex-grow md:ml-[260px] flex flex-col min-h-screen pb-[72px] md:pb-0">
        
        {/* Header */}
        <Header switchView={switchView} currentUser={currentUser} />

        {/* View content panel */}
        <main className="flex-grow p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6">
          {currentView === 'home' && (
            <HomeView 
              switchView={switchView} 
              selectCategory={selectCategory} 
              userProfile={userProfile} 
              scanHistory={scanHistory}
              viewHistoryItem={viewHistoryItem}
              clearHistory={clearHistory}
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
              analyzeTextQuery={analyzeTextQuery}
              viewHistoryItem={viewHistoryItem}
              hapticFeedback={hapticFeedback}
              apiSettings={apiSettings}
            />
          )}

          {currentView === 'results' && (
            <ResultsView 
              resultsData={resultsData} 
              activeCategory={activeCategory} 
              switchView={switchView}
              userProfile={userProfile}
              apiSettings={apiSettings}
            />
          )}

          {currentView === 'profile' && (
            (currentUser || devPreviewMode) ? (
              <ProfileView 
                userProfile={userProfile} 
                saveProfile={saveProfile} 
                showToast={showToast}
                apiSettings={apiSettings}
                saveSettings={saveSettings}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 animate-[fadeIn_0.4s_ease]">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">lock</span>
                <p className="text-on-surface-variant text-sm">Sign in to access your Health Profile</p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button onClick={() => switchView('login')} className="bg-primary text-white font-bold py-3 px-8 rounded-xl text-sm hover:bg-primary-container shadow-md transition-colors cursor-pointer w-full">
                    Log In
                  </button>
                  <button onClick={() => setDevPreviewMode(true)} className="bg-white border border-outline-variant text-on-surface font-bold py-3 px-8 rounded-xl text-sm hover:bg-surface-container-low transition-colors cursor-pointer w-full">
                    Dev Preview Mode (No Auth)
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'login' && (
            <LoginView onSuccess={() => switchView('home')} />
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
      <BottomNav currentView={currentView} switchView={switchView} apiSettings={apiSettings} />

      {/* 3. Loading Overlay */}
      <LoadingOverlay 
        active={loading.active} 
        title={loading.title} 
        status={loading.status} 
      />

      {/* 4. Toast Notification */}
      <div 
        className={`fixed bottom-24 md:bottom-6 right-6 max-w-sm w-max bg-surface-container-highest text-on-surface p-4 rounded-xl shadow-xl border border-outline-variant/30 flex items-center gap-3 transition-all duration-300 z-[100] ${
          toast.visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <span className={`material-symbols-outlined ${
          toast.type === 'error' ? 'text-error' : toast.type === 'success' ? 'text-green-500' : 'text-primary'
        }`}>
          {toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info'}
        </span>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
