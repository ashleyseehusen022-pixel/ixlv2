
import React, { useState } from 'react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onDeploy?: () => void;
  onDownload?: () => void;
  onNewTab?: () => void;
  isDevMode?: boolean;
  isPremium?: boolean;
  onGoPremium?: () => void;
  isAuthorizedAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onPageChange, 
  onDeploy, 
  onDownload, 
  onNewTab,
  isDevMode = false,
  isPremium = false,
  onGoPremium,
  isAuthorizedAdmin = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePanic = () => {
    if (!isDevMode) return;
    window.location.href = 'https://docs.google.com/document/u/0/';
  };

  const navItems = [
    { id: Page.Home, label: 'DASHBOARD' },
    { id: Page.Library, label: 'ARCADE' },
    { id: Page.Search, label: 'DISCOVER' },
    { id: Page.LoveTest, label: 'LOVE LAB' },
    { id: Page.AILab, label: 'LABS' },
    { id: Page.VPN, label: 'PHONK-VPN' },
    { id: Page.Deploy, label: 'GITHUB_HUB' },
  ];

  if (isDevMode && isAuthorizedAdmin) {
    navItems.push({ id: Page.DevTerminal, label: 'ROOT_TERM' });
    navItems.push({ id: Page.AdminConsole, label: 'ADMIN_CMD' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[150] glass border-b border-green-500/20 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onPageChange(Page.Home)}
        >
          <div className="w-10 h-8 md:w-12 md:h-10 bg-green-600 rounded-sm flex items-center justify-center group-hover:skew-x-[-12deg] transition-transform shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <span className="text-yellow-400 text-xs md:text-base font-black italic tracking-tighter">IXL</span>
          </div>
          <span className="hidden sm:inline text-base md:text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-yellow-400 to-blue-500 uppercase phonk-text">
            ixlv2.net
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`text-[9px] font-black italic transition-all hover:text-green-400 tracking-[0.2em] px-2 ${
                currentPage === item.id ? 'text-green-400 border-b-2 border-green-500 pb-1' : 'text-gray-400'
              } ${item.id === Page.AdminConsole ? 'text-purple-500 border-purple-500 hover:text-purple-400' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Premium Button */}
          {!isPremium && (
            <button 
              onClick={onGoPremium}
              className="px-4 py-2 bg-yellow-500 hover:bg-white text-black text-[9px] font-black italic uppercase skew-x-[-15deg] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></div>
              PLATINUM_ACCESS
            </button>
          )}

          {isPremium && !isDevMode && (
            <div className="hidden sm:flex px-4 py-2 bg-black/40 border border-yellow-500/30 text-yellow-500 text-[8px] font-black italic uppercase skew-x-[-15deg]">
              PLATINUM_UPLINK_ACTIVE
            </div>
          )}

          <button 
            onClick={onDownload}
            className="hidden sm:flex px-3 py-2 bg-white/10 hover:bg-white hover:text-black text-gray-400 text-[9px] font-black italic uppercase transition-all items-center gap-2"
            title="Download ZIP"
          >
            ZIP
          </button>
          
          {/* PANIC Button: Restricted to Devs */}
          {isDevMode && (
            <button 
              onClick={handlePanic}
              className="px-3 py-2 bg-red-600 hover:bg-white hover:text-red-600 text-white text-[9px] font-black italic uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] group flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              PANIC
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-green-400 border-2 border-green-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-green-500/20 p-6 flex flex-col gap-4 animate-slideInDown">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); setIsMenuOpen(false); }}
              className={`text-sm font-black italic text-left tracking-[0.2em] ${
                currentPage === item.id ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
          {!isPremium && (
            <button 
              onClick={() => { onGoPremium?.(); setIsMenuOpen(false); }}
              className="py-4 bg-yellow-500 text-black text-xs font-black italic uppercase text-center"
            >
              UPGRADE TO PLATINUM
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
