import React from 'react';

export default function Header({ switchView }) {
  return (
    <header className="sticky top-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-6">
        <div className="md:hidden text-lg font-bold text-primary">Guardian AI</div>
        <div className="relative items-center hidden md:flex">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-20px pointer-events-none">
            search
          </span>
          <input
            type="text"
            className="bg-surface-container-low border-none outline-none rounded-full pl-11 pr-4 py-2 text-xs w-[260px] focus:w-[320px] focus:ring-2 focus:ring-primary transition-all duration-300"
            placeholder="Search safety database..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low relative transition-colors duration-200"
          title="Notifications"
          onClick={() => alert("No new notifications")}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-[10px] right-[10px] w-1.5 h-1.5 bg-error rounded-full"></span>
        </button>
        
        <div 
          onClick={() => switchView('profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 cursor-pointer active:scale-95 transition-transform duration-150"
          title="Edit Profile"
        >
          <img 
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnUlIzmuuxsao3fPNFpGL66Vo0n7lWRaelDaMTnuCC5VK9ih8BTwANFz9165PQiw4AX2ZNMeYCWQB-2nS4G7ZBkSd3iRmxvFopwkq3klwIcQdx5E6OTfly1vRBuVhP1np-Xzi3plS8AIiGWAe4F-QcJC_dINMiELSYuLG86ayEEPtjRrUvI81P36laKDuAv87FwylUXLXMFjRJJrxVauxn-rXAwmvs5JnCZfEHfmWOW0s_BZ5rqRPbuuPuze-OFijP1viEhJEw9Y0" 
            alt="Profile Avatar"
          />
        </div>
      </div>
    </header>
  );
}
