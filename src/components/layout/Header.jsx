import { useState, useRef, useEffect } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Header({ switchView, currentUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut(auth);
    switchView('home');
  };

  return (
    <header className="sticky top-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-6">
        <div className="md:hidden text-lg font-bold text-primary">Guardian AI</div>
      </div>
      
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-outline-variant/50 cursor-pointer active:scale-95 transition-transform duration-150 hover:border-primary"
              title="Account menu"
            >
              {currentUser.photoURL ? (
                <img 
                  className="w-full h-full object-cover"
                  src={currentUser.photoURL} 
                  alt="Profile Avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg py-2 animate-[fadeIn_0.15s_ease] z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="text-sm font-bold text-on-surface truncate">{currentUser.displayName || 'User'}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{currentUser.email}</p>
                </div>


                <div className="border-t border-outline-variant/20 mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-error hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => switchView('login')}
            className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-full text-xs hover:bg-primary-container shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
