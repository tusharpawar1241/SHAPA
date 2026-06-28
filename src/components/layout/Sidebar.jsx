export default function Sidebar({ currentView, switchView, apiSettings }) {

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'profile', label: 'Health Profile', icon: 'person' }
  ];
  
  const isApiMissing = !apiSettings?.apiKey || apiSettings?.mode === 'mock';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col p-6 z-50 hidden md:flex">
      <div className="flex items-center gap-4 mb-8 px-2 py-1">
        <div className="w-[42px] h-[42px] aspect-square rounded-xl bg-primary flex items-center justify-center text-on-primary">
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
              className={`flex items-center justify-between p-4 rounded-lg text-sm transition-all duration-200 text-left font-medium ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.id === 'profile' && isApiMissing && (
                <div className="w-2.5 h-2.5 rounded-full bg-error" title="API connection missing"></div>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
