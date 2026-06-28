
export default function BottomNav({ currentView, switchView, apiSettings }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'profile', label: 'Profile', icon: 'person' }
  ];

  const isApiMissing = !apiSettings?.apiKey || apiSettings?.mode === 'mock';

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[72px] bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] flex justify-around items-center z-50 pb-3 md:hidden">
      {navItems.map(item => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => switchView(item.id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold py-1 px-4 rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-24px ${isActive ? 'filled-icon' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.id === 'profile' && isApiMissing && (
              <div className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-error" title="API connection missing"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
