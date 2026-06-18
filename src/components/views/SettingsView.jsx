import React, { useState, useEffect } from 'react';

export default function SettingsView({ apiSettings, saveSettings }) {
  const [mode, setMode] = useState('mock');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [verbose, setVerbose] = useState(true);
  const [haptic, setHaptic] = useState(true);

  useEffect(() => {
    if (apiSettings) {
      setMode(apiSettings.mode || 'mock');
      setApiKey(apiSettings.apiKey || '');
      setModel(apiSettings.model || 'gemini-2.5-flash');
      setVerbose(apiSettings.verbose !== false);
      setHaptic(apiSettings.haptic !== false);
    }
  }, [apiSettings]);

  const handleSave = () => {
    saveSettings({
      mode,
      apiKey: apiKey.trim(),
      model,
      verbose,
      haptic
    });
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Reset settings to default mock mode?")) {
      const defaults = {
        mode: 'mock',
        apiKey: '',
        model: 'gemini-2.5-flash',
        verbose: true,
        haptic: true
      };
      saveSettings(defaults);
      setMode('mock');
      setApiKey('');
      setModel('gemini-2.5-flash');
      setVerbose(true);
      setHaptic(true);
      alert("Settings reset to defaults.");
    }
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
          System Configurations
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface leading-tight">
          Application Settings
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Configure API keys, model variables, and developer preferences.
        </p>
      </div>

      <div className="settings-card bg-surface-container-lowest p-6 border border-outline-variant/30 rounded-2xl shadow-sm max-w-[700px] mt-6 flex flex-col gap-6">
        
        <div>
          <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-primary mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span>Google Gemini AI Connector</span>
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            Enter your Google AI Studio API key to perform actual image character recognition (OCR) and safety analysis using the Gemini API. If disabled, the app uses preloaded mock evaluations.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Analysis Mode</label>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all"
              >
                <option value="mock">Local Simulator Mode (Mock Data - No Key Needed)</option>
                <option value="gemini">Live Google Gemini API Mode</option>
              </select>
            </div>

            {mode === 'gemini' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Gemini API Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 rounded-lg outline-none text-xs focus:border-secondary transition-all"
                    placeholder="AIzaSy..."
                  />
                  <p className="text-[10px] text-on-surface-variant">
                    Your API key is stored locally in your browser's LocalStorage and is sent directly to Google's API endpoints.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Gemini Model selection</label>
                  <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast &amp; Accurate)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep reasoning)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-secondary mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">build</span>
            <span>Developer Diagnostics</span>
          </h3>
          
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={verbose} 
                onChange={(e) => setVerbose(e.target.checked)}
                className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
              />
              Show verbose API response console logs
            </label>
            <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={haptic} 
                onChange={(e) => setHaptic(e.target.checked)}
                className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary"
              />
              Simulate haptic vibrations during captures
            </label>
          </div>
        </div>

        <div className="pt-2 flex gap-4">
          <button 
            onClick={handleSave}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-xs hover:bg-primary-container shadow-md cursor-pointer transition-colors duration-150"
          >
            Save Configurations
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 border border-outline text-on-surface font-bold py-3 rounded-xl text-xs hover:bg-surface-container-low cursor-pointer transition-colors duration-150"
          >
            Reset Defaults
          </button>
        </div>

      </div>
    </div>
  );
}
