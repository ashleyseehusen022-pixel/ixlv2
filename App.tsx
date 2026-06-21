
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { AIGameDev } from './components/AIGameDev';
import { LoveLab } from './components/LoveLab';
import { DevTerminal } from './components/DevTerminal';
import { AdminConsole } from './components/AdminConsole';
import { PremiumModal } from './components/PremiumModal';
import { DeployPortal } from './components/DeployPortal';
import { Game, Page } from './types';
import { MOCK_GAMES, MOD_CONFIGS } from './constants';
import { audio } from './services/audioService';
import { downloadProjectZip } from './services/exportService';

/**
 * High-Security Authentication Gateway
 * Exclusively for Verified Developers
 */
const AuthLock: React.FC<{ onUnlock: (isDev: boolean, devId: string) => void }> = ({ onUnlock }) => {
  const [devId, setDevId] = useState('');
  const [passKey, setPassKey] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState(false);
  const [isBypassing, setIsBypassing] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      "INITIALIZING SECURE KERNEL...",
      "FETCHING HARDWARE SIGNATURE...",
      "MAPPING INTERNAL ASSETS...",
      "VERIFYING DEVELOPER ENVIRONMENT...",
      "WAITING FOR CREDENTIALS..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLogs(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const VALID_DEV_ID = "JAXYN120815";
    const VALID_PASS = "JAXYN";

    if (step === 1) {
      if (devId.toUpperCase() === VALID_DEV_ID) {
        setStep(2);
        audio.playSuccess();
      } else {
        triggerError();
      }
    } else {
      if (passKey.toUpperCase() === VALID_PASS) {
        audio.playSuccess();
        onUnlock(true, devId); // Grant Dev Access
      } else {
        triggerError();
      }
    }
  };

  const handleDeveloperBypass = () => {
    setIsBypassing(true);
    audio.playWhoosh();
    
    const bypassLogs = [
      "SYNCING HARDWARE UUID...",
      "BYPASSING KERNEL LOCK...",
      "VERIFYING MAC SIGNATURE...",
      "ROOT ACCESS GRANTED VIA STATION_B"
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < bypassLogs.length) {
        setBootLogs(prev => [...prev, `[AUTH_BYPASS] > ${bypassLogs[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        audio.playSuccess();
        onUnlock(true, "JAXYN120815"); // Grant Dev Access as JAXYN120815 via bypass
      }
    }, 400);
  };

  const triggerError = () => {
    setError(true);
    audio.playError();
    setTimeout(() => {
      setError(false);
      setDevId('');
      setPassKey('');
      setStep(1);
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 overflow-hidden transition-all duration-300 ${error ? 'bg-red-950/30' : ''}`}>
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(0,255,0,0.06),rgba(255,255,0,0.02),rgba(0,255,0,0.06))] bg-[size:100%_4px,3px_100%]"></div>
      
      <div className={`max-w-xl w-full glass p-12 border-2 relative transition-all duration-100 shadow-[0_0_80px_rgba(239,68,68,0.1)] ${
        error 
          ? 'border-red-600 animate-securityGlitch bg-red-950/20 shadow-[0_0_150px_rgba(220,38,38,0.4)] ring-2 ring-red-600/30' 
          : 'border-red-500/30 animate-fadeIn'
      }`}>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="w-12 h-12 bg-red-600 rounded-sm flex items-center justify-center animate-pulse">
            <span className="text-white font-black text-2xl">!</span>
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">RESTRICTED_DEV_ASSET</h1>
            <p className="text-[9px] font-mono text-red-500 uppercase tracking-widest animate-pulse">Unauthorized access is strictly prohibited</p>
          </div>
        </div>

        <div className="font-mono text-[10px] text-green-500 mb-8 h-24 overflow-y-auto opacity-50 custom-scrollbar">
          {bootLogs.map((log, idx) => <div key={idx}>&gt; {log}</div>)}
        </div>

        {!isBypassing ? (
          <form onSubmit={handleAuth} className={`space-y-6 ${error ? 'animate-shake' : ''}`}>
            {step === 1 ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest">DEVELOPER_ID_STATION</label>
                <input 
                  type="text"
                  value={devId}
                  onChange={(e) => setDevId(e.target.value)}
                  autoFocus
                  className="w-full bg-black border-2 border-red-500/20 p-5 text-xl font-black text-white outline-none focus:border-red-600 transition-all uppercase skew-x-[-15deg]"
                  placeholder="ENTER DEV_ID..."
                />
              </div>
            ) : (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[10px] font-black italic text-red-500 uppercase tracking-widest">ROOT_PASSKEY_REQUIRED</label>
                <input 
                  type="password"
                  value={passKey}
                  onChange={(e) => setPassKey(e.target.value)}
                  autoFocus
                  className="w-full bg-black border-2 border-green-500/20 p-5 text-xl font-black text-green-400 outline-none focus:border-green-600 transition-all uppercase skew-x-[-15deg]"
                  placeholder="********"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <button className="w-full py-5 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-3">
                {step === 1 ? 'PROCEED_TO_PASSKEY' : 'INITIALIZE_INTERNAL_ARCADE'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
              </button>

              {step === 1 && (
                <button 
                  type="button"
                  onClick={handleDeveloperBypass}
                  className="w-full py-3 bg-black border-2 border-green-500/30 hover:border-green-500 text-green-500 text-[10px] font-black italic uppercase tracking-widest skew-x-[-12deg] transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:animate-pulse">[ MOUNT_BYPASS_STATION_B ]</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="py-10 text-center space-y-4 animate-pulse">
            <h2 className="text-xl font-black italic text-green-500 uppercase tracking-tighter">HARDWARE_HANDSHAKE_IN_PROGRESS</h2>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-loadingLine"></div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest leading-relaxed">
             This system is monitored. Verified developers must adhere to Phonk Systems protocol 5.4.
           </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes loadingLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes securityGlitch {
          0% {
            transform: translate(0, 0) skewX(0deg);
            filter: hue-rotate(0deg) contrast(1) brightness(1);
          }
          10% {
            transform: translate(-3px, 2px) skewX(-3deg);
            filter: hue-rotate(80deg) contrast(1.2);
          }
          20% {
            transform: translate(2px, -3px) skewX(4deg);
            filter: hue-rotate(160deg) brightness(1.3);
          }
          30% {
            transform: translate(-4px, -1px) skewX(-2deg);
            filter: contrast(1.6);
          }
          40% {
            transform: translate(3px, 3px) skewX(3deg);
            filter: hue-rotate(240deg) saturate(1.8);
          }
          50% {
            transform: translate(-2px, -2px) skewX(-4deg);
            filter: brightness(0.8) contrast(1.4);
          }
          60% {
            transform: translate(4px, -3px) skewX(5deg);
            filter: hue-rotate(40deg) brightness(1.1);
          }
          70% {
            transform: translate(-3px, 3px) skewX(-1deg);
            filter: saturate(0.6) contrast(1.6);
          }
          80% {
            transform: translate(1px, -2px) skewX(-6deg);
            filter: hue-rotate(120deg) brightness(1.4);
          }
          90% {
            transform: translate(-2px, 1px) skewX(2deg);
            filter: contrast(2.2) saturate(1.5);
          }
          100% {
            transform: translate(0, 0) skewX(0deg);
            filter: hue-rotate(0deg) contrast(1) brightness(1);
          }
        }
        .animate-shake { animation: shake 0.1s ease-in-out 4; }
        .animate-loadingLine { animation: loadingLine 1.5s linear infinite; }
        .animate-securityGlitch { animation: securityGlitch 0.15s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #166534; }
      `}</style>
    </div>
  );
};

const AnimatedBackground: React.FC<{ themeIndex: number; onClick: () => void }> = ({ themeIndex, onClick }) => {
  const themes = [
    'from-slate-950 via-green-950/20 to-slate-950',
    'from-slate-950 via-yellow-950/20 to-slate-950',
    'from-slate-950 via-blue-950/20 to-slate-950',
    'from-slate-950 via-purple-950/20 to-slate-950',
  ];
  return (
    <div 
      className={`fixed inset-0 z-0 bg-gradient-to-br ${themes[themeIndex] || themes[0]} transition-colors duration-1000 cursor-crosshair`}
      onClick={onClick}
    />
  );
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [activeDevId, setActiveDevId] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [bgThemeIndex, setBgThemeIndex] = useState(0);
  
  const [settings, setSettings] = useState({ 
    neonIntensity: 0.6, 
    alwaysScores: false, 
    invincible: false, 
    infiniteJumps: false,
    infiniteMoney: false,
    speedHack: 1.0,
    moneyMultiplier: 1.0,
    turboMode: false
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      Object.entries(settings).forEach(([key, value]) => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'SETTING_CHANGE', key, value }, '*');
      });
    }
  }, [settings, activeGame]);

  const handlePlay = (game: Game) => {
    if (game.isInternal && game.internalCode) {
      setActiveGame(game);
      setCurrentPage(Page.Play);
    } else if (game.url) {
      window.open(game.url, '_blank');
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleUnlock = (isDev: boolean, id: string) => {
    setIsAuthenticated(true);
    setIsDevMode(isDev);
    setActiveDevId(id);
    if (isDev) setIsPremium(true); // Developers are automatically premium
  };

  const handleGoPremium = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumSuccess = () => {
    setIsPremium(true);
    setShowPremiumModal(false);
    audio.playSuccess();
  };

  if (!isAuthenticated) return <AuthLock onUnlock={handleUnlock} />;

  return (
    <div className={`min-h-screen text-white transition-all duration-500 ${settings.turboMode ? 'contrast-125 saturate-150 brightness-110' : ''}`}>
      <AnimatedBackground themeIndex={bgThemeIndex} onClick={() => setBgThemeIndex((p) => (p + 1) % 4)} />
      
      {/* Dev Status Overlay */}
      {isDevMode && (
        <div className="fixed top-4 right-4 z-[200] pointer-events-none">
          <div className="bg-red-600 text-white text-[8px] font-black italic px-4 py-1 skew-x-[-15deg] uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            DEV_INTERNAL_BUILD_v5.4
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {isPremium && !isDevMode && (
        <div className="fixed top-4 right-4 z-[200] pointer-events-none">
          <div className="bg-yellow-500 text-black text-[8px] font-black italic px-4 py-1 skew-x-[-15deg] uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)] border-2 border-black">
            PHONK_PLATINUM_MEMBER
          </div>
        </div>
      )}

      <Navbar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        isDevMode={isDevMode} 
        isPremium={isPremium}
        onGoPremium={handleGoPremium}
        onDownload={() => downloadProjectZip({ 'README.md': 'Phonk Systems Internal' })} 
      />
      
      <main className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {currentPage === Page.Home && (
          <div className="space-y-12 animate-fadeIn">
            <div className="text-center">
              <h1 className="text-7xl md:text-9xl font-black italic uppercase phonk-text leading-none">
                PHONK<br/><span className="text-green-500">ARCADE</span>
              </h1>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPremium ? 'bg-yellow-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-black italic text-gray-500 uppercase tracking-widest">
                  {isDevMode ? 'Uplink Stable // Internal Node Detected' : isPremium ? 'Premium High-Perf Tunnel // Encrypted' : 'Guest Uplink // Read-Only Terminal'}
                </span>
              </div>
            </div>

            {isPremium && (
              <div className="flex justify-center">
                <button 
                  onClick={() => updateSetting('turboMode', !settings.turboMode)}
                  className={`px-8 py-4 border-2 font-black italic uppercase skew-x-[-15deg] transition-all flex items-center gap-3 ${settings.turboMode ? 'bg-yellow-500 text-black border-white shadow-[0_0_20px_white]' : 'bg-black/40 border-yellow-500/30 text-yellow-500'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${settings.turboMode ? 'bg-black animate-ping' : 'bg-yellow-500'}`}></div>
                  {settings.turboMode ? 'TURBO_PERFORMANCE_ACTIVE' : 'ACTIVATE_TURBO_UPLINK'}
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_GAMES.slice(0, 3).map(game => (
                <GameCard key={game.id} game={game} onPlay={handlePlay} settings={settings} onSettingChange={updateSetting} isDevMode={isDevMode} isPremium={isPremium} />
              ))}
            </div>
          </div>
        )}

        {currentPage === Page.Library && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {MOCK_GAMES.map(game => (
              <GameCard key={game.id} game={game} onPlay={handlePlay} settings={settings} onSettingChange={updateSetting} isDevMode={isDevMode} isPremium={isPremium} />
            ))}
          </div>
        )}

        {currentPage === Page.Play && activeGame && (
          <div className="animate-scaleIn h-[70vh] flex flex-col gap-4">
            <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5 rounded-sm">
              <div>
                <h2 className="text-2xl font-black italic text-green-400 uppercase leading-none">{activeGame.title}</h2>
                <span className="text-[8px] font-bold text-gray-500 uppercase">INTERNAL_SOURCE_VERIFIED</span>
              </div>
              <button 
                onClick={() => {
                  setActiveGame(null);
                  setCurrentPage(Page.Library);
                }} 
                className="px-6 py-3 bg-red-600/10 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-black italic uppercase skew-x-[-12deg] transition-all"
              >
                TERMINATE_INSTANCE
              </button>
            </div>
            <div className="flex-1 relative glass border-2 border-green-500/20 rounded-sm overflow-hidden">
               <iframe 
                ref={iframeRef} 
                srcDoc={activeGame.internalCode} 
                className="w-full h-full border-none"
                title={activeGame.title}
              />
              <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20"></div>
              {isDevMode && settings.infiniteMoney && activeGame.id === 'tiny-fishing' && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-yellow-500 text-black text-[10px] font-black italic uppercase skew-x-[-15deg] shadow-xl animate-pulse z-50">
                  DEVELOPER_INFINITE_CASH_ACTIVE
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === Page.AILab && <AIGameDev />}
        {currentPage === Page.LoveTest && <LoveLab />}
        {currentPage === Page.DevTerminal && <DevTerminal devId={activeDevId} />}
        {currentPage === Page.AdminConsole && <AdminConsole devId={activeDevId} />}
        {currentPage === Page.Deploy && <DeployPortal />}

        {currentPage === Page.VPN && (
          <div className="max-w-4xl mx-auto py-20 animate-fadeIn text-center">
             <div className="inline-block p-10 glass border-2 border-blue-500/20 rounded-sm mb-12">
              <h2 className="text-6xl font-black italic text-blue-500 mb-4 uppercase">PHONK-VPN</h2>
              <p className="text-gray-500 text-xs font-bold italic uppercase mb-8">Encrypted Mirror Protocol Active // Bypassing Local Filters</p>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[loading_4s_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)} 
          onSuccess={handlePremiumSuccess} 
        />
      )}

      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-black/40 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
             <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">PHONK_SYSTEMS © 2024</span>
             <span className="text-[8px] text-red-500/40 font-black uppercase tracking-widest italic">DEVELOPER_ONLY_ENVIRONMENT</span>
          </div>
          <div className="flex gap-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-green-500 transition-colors">SECURITY_PROTOCOLS</a>
            <a href="#" className="hover:text-green-500 transition-colors">ROOT_UPLINK</a>
            <a href="#" className="hover:text-green-500 transition-colors">SOURCE_NODES</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
