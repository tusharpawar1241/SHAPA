import React from 'react';

export default function Sidebar({ currentView, switchView, userProfile }) {
  const getInitials = (name) => {
    if (!name) return 'JD';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'scan', label: 'Analyze & Scan', icon: 'analytics' },
    { id: 'profile', label: 'Health Profile', icon: 'person' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col p-6 z-50 hidden md:flex">
      <div className="flex items-center gap-4 mb-8 px-2 py-1">
        <div className="w-[42px] height-[42px] aspect-square rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_watch
          </span>
        </div>
        <div>
          <h1 className="brand-title text-xl font-bold text-primary leading-tight">Guardian AI</h1>
          <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Health Monitor</p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => switchView(item.id)}
              className={`flex items-center gap-4 p-4 rounded-lg text-sm transition-all duration-200 text-left font-medium ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:translate-x-1'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[13px]">
            {getInitials(userProfile.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold truncate text-on-surface">{userProfile.name}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
