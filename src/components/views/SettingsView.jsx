import React, { useState, useEffect } from 'react';

export default function SettingsView({ apiSettings, saveSettings }) {
  const [mode, setMode] = useState('mock');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [verbose, setVerbose] = useState(true);
  const [haptic, setHaptic] = useState(true);

  useEffect(() => {
    if (apiSettings) {
      setMode(apiSettings.mode || 'mock');
      setApiKey(apiSettings.apiKey || '');
      setModel((apiSettings.model === 'gemini-2.5-flash' || apiSettings.model === 'gemini-2.5-pro') ? 'gemini-1.5-flash' : (apiSettings.model || 'gemini-1.5-flash'));
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
        model: 'gemini-1.5-flash',
        verbose: true,
        haptic: true
      };
      saveSettings(defaults);
      setMode('mock');
      setApiKey('');
      setModel('gemini-1.5-flash');
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
          Manage your account, preferences, and developer options.
        </p>
      </div>

      <div className="settings-card bg-surface-container-lowest p-6 border border-outline-variant/30 rounded-2xl shadow-sm max-w-[700px] mt-6 flex flex-col gap-8">

        {/* Account Management */}
        <div>
          <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-on-surface mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">person</span>
            <span>Account Management</span>
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-on-surface">Email Address</p>
                <p className="text-[11px] text-on-surface-variant">user@example.com</p>
              </div>
              <button className="text-[11px] font-bold text-primary hover:underline bg-transparent border-none outline-none cursor-pointer">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-on-surface">Password</p>
                <p className="text-[11px] text-on-surface-variant">********</p>
              </div>
              <button className="text-[11px] font-bold text-primary hover:underline bg-transparent border-none outline-none cursor-pointer">Update</button>
            </div>
            <button className="w-fit mt-2 border border-error/50 text-error font-bold py-2 px-4 rounded-lg text-[11px] hover:bg-error hover:text-white cursor-pointer transition-colors duration-150">
              Sign Out
            </button>
          </div>
        </div>

        {/* Appearance & Display */}
        <div>
          <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-on-surface mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">palette</span>
            <span>Appearance &amp; Display</span>
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">App Theme</label>
              <select className="w-full p-3 border border-outline-variant/50 bg-white rounded-lg outline-none text-xs focus:border-secondary transition-all cursor-pointer">
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant cursor-pointer select-none mt-2">
              <input type="checkbox" defaultChecked className="w-[18px] h-[18px] border border-outline-variant rounded cursor-pointer accent-primary" />
              Enable animations and smooth transitions
            </label>
          </div>
        </div>

        {/* Privacy & Data */}
        <div>
          <h3 className="text-sm font-bold border-b border-outline-variant/30 pb-1.5 text-on-surface mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span>Privacy &amp; Data</span>
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-on-surface-variant">Clear Scan History</p>
              <button className="text-[11px] font-bold text-error hover:underline bg-transparent border-none outline-none cursor-pointer">Clear Data</button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-on-surface-variant">Export User Data</p>
              <button className="text-[11px] font-bold text-primary hover:underline bg-transparent border-none outline-none cursor-pointer">Export CSV</button>
            </div>
          </div>
        </div>

        {/* Developer Diagnostics */}
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

        <div className="pt-4 flex gap-4 border-t border-outline-variant/30">
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
