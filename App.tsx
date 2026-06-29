
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { AIGameDev } from './components/AIGameDev';
import { LoveLab } from './components/LoveLab';
import { DevTerminal } from './components/DevTerminal';
import { AdminConsole } from './components/AdminConsole';
import { PremiumModal } from './components/PremiumModal';
import { DeployPortal } from './components/DeployPortal';
import { PermitShop } from './components/PermitShop';
import { StatsDashboard } from './components/StatsDashboard';
import { Game, Page, GlobalGameStats } from './types';
import { MOCK_GAMES, MOD_CONFIGS } from './constants';
import { audio } from './services/audioService';
import { downloadProjectZip } from './services/exportService';

/**
 * High-Security Authentication Gateway
 * Exclusively for Verified Developers
 */
const AuthLock: React.FC<{ onUnlock: (isDev: boolean, devId: string, bypass?: boolean) => void }> = ({ onUnlock }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login states
  const [devId, setDevId] = useState('');
  const [passKey, setPassKey] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  
  // Registration states
  const [regUsername, setRegUsername] = useState('');
  const [regPasskey, setRegPasskey] = useState('');

  const [error, setError] = useState(false);
  const [isBypassing, setIsBypassing] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Registration Live Checker Calculations
  const isUsernameLengthValid = regUsername.length >= 4 && regUsername.length <= 15;
  const isUsernameFormatValid = /^[a-zA-Z0-9_]+$/.test(regUsername);
  const isPasskeyLengthValid = regPasskey.length >= 6;
  const isPasskeyCaseValid = /[A-Z]/.test(regPasskey);
  const isPasskeyNumValid = /\d/.test(regPasskey);

  const isRegistrationValid = isUsernameLengthValid && isUsernameFormatValid && isPasskeyLengthValid && isPasskeyCaseValid && isPasskeyNumValid;

  useEffect(() => {
    const logs = [
      "INITIALIZING SECURE KERNEL...",
      "FETCHING HARDWARE SIGNATURE...",
      "MAPPING INTERNAL ASSETS...",
      "VERIFYING DEVELOPER ENVIRONMENT...",
      "READY FOR UPLINK SECURITY HANDSHAKE."
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

    // Load admin list to check if user has delegated root/admin permissions
    let currentAdmins: string[] = [];
    try {
      const stored = localStorage.getItem('phonk_granted_admins');
      if (stored) currentAdmins = JSON.parse(stored);
    } catch {}

    // Load registered custom accounts
    let registeredUsers: Record<string, string> = {};
    try {
      const storedUsers = localStorage.getItem('phonk_registered_users');
      if (storedUsers) registeredUsers = JSON.parse(storedUsers);
    } catch {}

    const isTargetAdmin = currentAdmins.map(u => u.toUpperCase()).includes(devId.toUpperCase());
    const matchedUserKey = Object.keys(registeredUsers).find(k => k.toUpperCase() === devId.toUpperCase());
    const registeredPass = matchedUserKey ? registeredUsers[matchedUserKey] : null;

    if (step === 1) {
      if (devId.toUpperCase() === VALID_DEV_ID || isTargetAdmin || matchedUserKey) {
        setStep(2);
        audio.playSuccess();
      } else {
        triggerError();
      }
    } else {
      const isValidDevPass = devId.toUpperCase() === VALID_DEV_ID && passKey.toUpperCase() === VALID_PASS;
      const isValidAdminPass = isTargetAdmin && (passKey.toUpperCase() === "ADMIN" || passKey.toUpperCase() === "GUEST" || passKey.toUpperCase() === "JAXYN" || passKey.length >= 2);
      const isValidRegisteredPass = registeredPass !== null && passKey === registeredPass;

      if (isValidDevPass || isValidAdminPass || isValidRegisteredPass) {
        audio.playSuccess();
        onUnlock(true, devId, false); // Grant Dev Access (not bypassed)
      } else {
        triggerError();
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistrationValid) {
      audio.playError();
      return;
    }

    // Load registered users matrix
    let currentRegistered: Record<string, string> = {};
    try {
      const stored = localStorage.getItem('phonk_registered_users');
      if (stored) currentRegistered = JSON.parse(stored);
    } catch {}

    // Check if username already exists in registry
    const userExists = Object.keys(currentRegistered).some(u => u.toUpperCase() === regUsername.toUpperCase());
    if (userExists || regUsername.toUpperCase() === "JAXYN120815") {
      setError(true);
      setBootLogs(prev => [...prev, `[REGISTRY_ALARM] > ERROR: DEV_ID '${regUsername.toUpperCase()}' IS ALREADY REGISTERED.`]);
      audio.playError();
      setTimeout(() => setError(false), 1200);
      return;
    }

    // Save developer settings
    currentRegistered[regUsername] = regPasskey;
    localStorage.setItem('phonk_registered_users', JSON.stringify(currentRegistered));

    setBootLogs(prev => [
      ...prev,
      `[REGISTRY] > SUCCESS: PROFILE CREATED FOR '${regUsername.toUpperCase()}'`,
      `[REGISTRY] > NOTE: PERMIT REQUIRED TO ACCESS SECURE ADMINISTRATIVE SHELLS.`
    ]);

    audio.playSuccess();
    setIsBypassing(true);

    // Dynamic logging progression
    setTimeout(() => {
      setIsBypassing(false);
      onUnlock(true, regUsername, false); // Auto log in (not bypassed)
    }, 1500);
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
        onUnlock(true, "JAXYN120815", true); // Grant Dev Access as JAXYN120815 via bypass (bypassed = true)
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
      
      <div className={`max-w-xl w-full glass p-10 border-2 relative transition-all duration-100 shadow-[0_0_80px_rgba(34,197,94,0.1)] ${
        error 
          ? 'border-red-600 animate-securityGlitch bg-red-950/20 shadow-[0_0_150px_rgba(220,38,38,0.4)] ring-2 ring-red-600/30' 
          : 'border-green-500/30 animate-fadeIn'
      }`}>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-12 h-12 bg-green-600 rounded-sm flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(22,163,74,0.4)]">
            <span className="text-white font-black text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">ixlv2.net security gate</h1>
            <p className="text-[9px] font-mono text-green-500 uppercase tracking-widest animate-pulse">encrypted central developer workstation</p>
          </div>
        </div>

        {/* Tab Selection */}
        {!isBypassing && (
          <div className="flex gap-2 border-b border-white/10 mb-6 pb-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(false); }}
              className={`flex-1 py-1 px-3 font-mono text-[10px] font-bold uppercase transition-all tracking-wider skew-x-[-10deg] ${
                mode === 'login' 
                  ? 'bg-green-600/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              [ CHANNELS_LOGIN ]
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(false); }}
              className={`flex-1 py-1 px-3 font-mono text-[10px] font-bold uppercase transition-all tracking-wider skew-x-[-10deg] ${
                mode === 'register' 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              [ REGISTER_NEW_DEV ]
            </button>
          </div>
        )}

        <div className="font-mono text-[9px] text-green-500 mb-6 h-20 overflow-y-auto opacity-50 custom-scrollbar leading-relaxed">
          {bootLogs.map((log, idx) => <div key={idx}>&gt; {log}</div>)}
        </div>

        {!isBypassing ? (
          mode === 'login' ? (
            <form onSubmit={handleAuth} className={`space-y-6 ${error ? 'animate-shake' : ''}`}>
              {step === 1 ? (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest">DEVELOPER_ID_STATION</label>
                  <input 
                    type="text"
                    value={devId}
                    onChange={(e) => setDevId(e.target.value)}
                    autoFocus
                    className="w-full bg-black border-2 border-green-500/20 p-4 text-lg font-black text-white outline-none focus:border-green-600 transition-all uppercase skew-x-[-10deg]"
                    placeholder="ENTER DEV_ID..."
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-black italic text-green-500 uppercase tracking-widest">ROOT_PASSKEY_REQUIRED</label>
                  <input 
                    type="password"
                    value={passKey}
                    onChange={(e) => setPassKey(e.target.value)}
                    autoFocus
                    className="w-full bg-black border-2 border-green-500/20 p-4 text-lg font-black text-green-400 outline-none focus:border-green-600 transition-all uppercase skew-x-[-10deg]"
                    placeholder="********"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <button className="w-full py-4 bg-green-600 hover:bg-white hover:text-green-600 text-white font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
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
            <form onSubmit={handleRegister} className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest">PROPOSED_DEV_ID (USERNAME)</label>
                <input 
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-black border-2 border-blue-500/20 p-3 text-base font-black text-white outline-none focus:border-blue-600 transition-all uppercase skew-x-[-10deg]"
                  placeholder="E.G. USER_99"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest">PROPOSED_SECURE_PASSKEY</label>
                <input 
                  type="password"
                  value={regPasskey}
                  onChange={(e) => setRegPasskey(e.target.value)}
                  className="w-full bg-black border-2 border-blue-500/20 p-3 text-base font-black text-blue-400 outline-none focus:border-blue-600 transition-all skew-x-[-10deg]"
                  placeholder="••••••••"
                />
              </div>

              {/* Requirement Indicators Container */}
              <div className="bg-slate-950/80 border border-white/10 p-4 rounded skew-y-[-1deg] font-mono text-[10px]">
                <div className="text-gray-400 font-bold mb-3 uppercase tracking-wider border-b border-white/10 pb-1">UPLINK SECURITY REQUIREMENTS:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isUsernameLengthValid ? 'text-green-500 font-bold' : 'text-red-500'}`}>
                      {isUsernameLengthValid ? '✓' : '✗'}
                    </span>
                    <span className={isUsernameLengthValid ? 'text-gray-300' : 'text-gray-500'}>DEV_ID: 4-15 CHARS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isUsernameFormatValid ? 'text-green-500 font-bold' : 'text-red-500'}`}>
                      {isUsernameFormatValid ? '✓' : '✗'}
                    </span>
                    <span className={isUsernameFormatValid ? 'text-gray-300' : 'text-gray-500'}>Letters, numbers, _ only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isPasskeyLengthValid ? 'text-green-500 font-bold' : 'text-red-500'}`}>
                      {isPasskeyLengthValid ? '✓' : '✗'}
                    </span>
                    <span className={isPasskeyLengthValid ? 'text-gray-300' : 'text-gray-500'}>Passkey: Min 6 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isPasskeyCaseValid ? 'text-green-500 font-bold' : 'text-red-500'}`}>
                      {isPasskeyCaseValid ? '✓' : '✗'}
                    </span>
                    <span className={isPasskeyCaseValid ? 'text-gray-300' : 'text-gray-500'}>1+ Uppercase letter [A-Z]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isPasskeyNumValid ? 'text-green-500 font-bold' : 'text-red-500'}`}>
                      {isPasskeyNumValid ? '✓' : '✗'}
                    </span>
                    <span className={isPasskeyNumValid ? 'text-gray-300' : 'text-gray-500'}>1+ Numeric digit [0-9]</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!isRegistrationValid}
                className={`w-full py-4 text-white font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.3)] ${
                  isRegistrationValid 
                    ? 'bg-blue-600 hover:bg-white hover:text-blue-600' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5 shadow-none'
                }`}
              >
                CREATE_AND_INJECT_KEY
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </form>
          )
        ) : (
          <div className="py-10 text-center space-y-4 animate-pulse">
            <h2 className="text-xl font-black italic text-green-500 uppercase tracking-tighter">HARDWARE_HANDSHAKE_IN_PROGRESS</h2>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-loadingLine"></div>
            </div>
            <p className="font-mono text-[9px] text-gray-400 mt-2">INJECTING CREDENTIALS PROTOCOL FOR TERMINAL REGISTRY...</p>
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

const AnimatedBackground: React.FC<{ themeIndex: number; onClick: () => void; disabled?: boolean }> = ({ themeIndex, onClick, disabled }) => {
  const themes = [
    'from-slate-950 via-green-950/20 to-slate-950',
    'from-slate-950 via-yellow-950/20 to-slate-950',
    'from-slate-950 via-blue-950/20 to-slate-950',
    'from-slate-950 via-purple-950/20 to-slate-950',
  ];
  return (
    <div 
      className={`fixed inset-0 z-0 bg-gradient-to-br ${disabled ? 'bg-[#020617]' : (themes[themeIndex] || themes[0])} ${disabled ? '' : 'transition-colors duration-1000'} cursor-crosshair`}
      onClick={onClick}
    />
  );
};

export const App: React.FC = () => {
  const [purchasedTier, setPurchasedTier] = useState<'none' | 'junior' | 'admin' | 'creator'>(() => {
    return (localStorage.getItem('phonk_purchased_tier') as 'none' | 'junior' | 'admin' | 'creator') || 'none';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const tier = localStorage.getItem('phonk_purchased_tier');
    return tier ? (tier !== 'none') : false;
  });

  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    const tier = localStorage.getItem('phonk_purchased_tier');
    return tier === 'creator';
  });

  const [activeDevId, setActiveDevId] = useState<string>(() => {
    const tier = localStorage.getItem('phonk_purchased_tier');
    if (tier === 'junior') return 'JUNIOR_OPERATOR';
    if (tier === 'admin') return 'SYSTEM_ADMIN';
    if (tier === 'creator') return 'ULTIMATE_CREATOR';
    return '';
  });

  const [isBypassed, setIsBypassed] = useState<boolean>(false);

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    const tier = localStorage.getItem('phonk_purchased_tier');
    return tier ? (tier !== 'none') : false;
  });

  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [bgThemeIndex, setBgThemeIndex] = useState(0);
  
  const [settings, setSettings] = useState(() => {
    try {
      const storedGlitch = localStorage.getItem('phonk_glitch_effects');
      const storedTurbo = localStorage.getItem('phonk_turbo_mode');
      return { 
        neonIntensity: 0.6, 
        alwaysScores: false, 
        invincible: false, 
        infiniteJumps: false,
        infiniteMoney: false,
        speedHack: 1.0,
        moneyMultiplier: 1.0,
        turboMode: storedTurbo === 'true',
        glitchEffects: storedGlitch !== 'false'
      };
    } catch {
      return { 
        neonIntensity: 0.6, 
        alwaysScores: false, 
        invincible: false, 
        infiniteJumps: false,
        infiniteMoney: false,
        speedHack: 1.0,
        moneyMultiplier: 1.0,
        turboMode: false,
        glitchEffects: true
      };
    }
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [gameStats, setGameStats] = useState<GlobalGameStats>(() => {
    try {
      const stored = localStorage.getItem('phonk_game_stats_telemetry');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const sessionScoreRef = useRef<number>(0);

  const updateGameStats = (updater: (prev: GlobalGameStats) => GlobalGameStats) => {
    setGameStats(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('phonk_game_stats_telemetry', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetGameStats = () => {
    setGameStats({});
    try {
      localStorage.removeItem('phonk_game_stats_telemetry');
    } catch {}
  };

  // Real-time play time and session count tracking
  useEffect(() => {
    if (!activeGame || currentPage !== Page.Play) return;

    // Reset session points tracking
    sessionScoreRef.current = 0;

    // Record session start (increment playCount)
    updateGameStats(prev => {
      const gameStat = prev[activeGame.id] || {
        playCount: 0,
        playTimeSeconds: 0,
        successCount: 0,
        failureCount: 0,
        highScore: 0
      };
      return {
        ...prev,
        [activeGame.id]: {
          ...gameStat,
          playCount: gameStat.playCount + 1
        }
      };
    });

    // Tick play time every second
    const interval = setInterval(() => {
      updateGameStats(prev => {
        const gameStat = prev[activeGame.id] || {
          playCount: 1,
          playTimeSeconds: 0,
          successCount: 0,
          failureCount: 0,
          highScore: 0
        };
        return {
          ...prev,
          [activeGame.id]: {
            ...gameStat,
            playTimeSeconds: gameStat.playTimeSeconds + 1
          }
        };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeGame, currentPage]);

  // Intercept events from the game iframe to compute success rates and high scores
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !activeGame) return;

      if (data.type === 'SFX_TRIGGER') {
        if (data.sound === 'success') {
          updateGameStats(prev => {
            const gameStat = prev[activeGame.id] || {
              playCount: 1,
              playTimeSeconds: 0,
              successCount: 0,
              failureCount: 0,
              highScore: 0
            };
            return {
              ...prev,
              [activeGame.id]: {
                ...gameStat,
                successCount: gameStat.successCount + 1
              }
            };
          });
        } else if (data.sound === 'score') {
          sessionScoreRef.current += 1;
          const currentScore = sessionScoreRef.current;
          updateGameStats(prev => {
            const gameStat = prev[activeGame.id] || {
              playCount: 1,
              playTimeSeconds: 0,
              successCount: 0,
              failureCount: 0,
              highScore: 0
            };
            return {
              ...prev,
              [activeGame.id]: {
                ...gameStat,
                successCount: gameStat.successCount + 1,
                highScore: Math.max(gameStat.highScore, currentScore)
              }
            };
          });
        } else if (data.sound === 'error') {
          updateGameStats(prev => {
            const gameStat = prev[activeGame.id] || {
              playCount: 1,
              playTimeSeconds: 0,
              successCount: 0,
              failureCount: 0,
              highScore: 0
            };
            return {
              ...prev,
              [activeGame.id]: {
                ...gameStat,
                failureCount: gameStat.failureCount + 1
              }
            };
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [activeGame]);

  useEffect(() => {
    try {
      if (settings.glitchEffects) {
        document.body.classList.remove('glitch-disabled');
      } else {
        document.body.classList.add('glitch-disabled');
      }
    } catch {}
  }, [settings.glitchEffects]);

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
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        if (key === 'glitchEffects') {
          localStorage.setItem('phonk_glitch_effects', String(value));
        }
        if (key === 'turboMode') {
          localStorage.setItem('phonk_turbo_mode', String(value));
        }
      } catch {}
      return updated;
    });
  };

  const handleUnlock = (isDev: boolean, id: string, bypass: boolean = false) => {
    setIsAuthenticated(true);
    setActiveDevId(id);
    setIsBypassed(bypass);

    if (bypass) {
      setPurchasedTier('none');
      localStorage.setItem('phonk_purchased_tier', 'none');
      setIsDevMode(false);
      setIsPremium(false);
    } else {
      // Load any saved tier specifically mapped to this user ID
      let userTier: 'none' | 'junior' | 'admin' | 'creator' = 'none';
      try {
        const storedTiers = localStorage.getItem('phonk_user_tiers');
        if (storedTiers) {
          const tiersMap = JSON.parse(storedTiers);
          if (tiersMap[id.toUpperCase()]) {
            userTier = tiersMap[id.toUpperCase()];
          }
        }
      } catch {}

      setPurchasedTier(userTier);
      localStorage.setItem('phonk_purchased_tier', userTier);
      setIsDevMode(userTier === 'creator' || id.toUpperCase() === 'JAXYN120815');
      setIsPremium(userTier !== 'none' || id.toUpperCase() === 'JAXYN120815');
    }
  };

  const handleGoPremium = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumSuccess = () => {
    setIsPremium(true);
    setShowPremiumModal(false);
    audio.playSuccess();
  };

  const handleUpgradeTier = (tier: 'junior' | 'admin' | 'creator') => {
    setPurchasedTier(tier);
    localStorage.setItem('phonk_purchased_tier', tier);
    setIsPremium(true);
    setIsDevMode(tier === 'creator');
    setIsAuthenticated(true);
    setIsBypassed(false);
    
    let newAdminName = activeDevId;
    if (!newAdminName) {
      newAdminName = tier === 'junior' ? 'JUNIOR_OPERATOR' : tier === 'admin' ? 'SYSTEM_ADMIN' : 'ULTIMATE_CREATOR';
      setActiveDevId(newAdminName);
    }

    try {
      const stored = localStorage.getItem('phonk_granted_admins');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.map(u => u.toUpperCase()).includes(newAdminName.toUpperCase())) {
        list.push(newAdminName);
        localStorage.setItem('phonk_granted_admins', JSON.stringify(list));
      }
    } catch {}

    // Persist tier specifically mapped to this user ID
    try {
      const storedTiers = localStorage.getItem('phonk_user_tiers');
      const tiersMap = storedTiers ? JSON.parse(storedTiers) : {};
      tiersMap[newAdminName.toUpperCase()] = tier;
      localStorage.setItem('phonk_user_tiers', JSON.stringify(tiersMap));
    } catch {}
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsDevMode(false);
    setActiveDevId('');
    setIsBypassed(false);
    setIsPremium(false);
    setPurchasedTier('none');
    localStorage.removeItem('phonk_purchased_tier');
    setActiveGame(null);
    setCurrentPage(Page.Home);
    audio.playWhoosh();
  };

  if (!isAuthenticated) return <AuthLock onUnlock={handleUnlock} />;

  const isAuthorizedAdmin = !isBypassed && (
    activeDevId.toUpperCase() === 'JAXYN120815' || 
    purchasedTier === 'junior' || 
    purchasedTier === 'admin' || 
    purchasedTier === 'creator'
  );

  return (
    <div className={`min-h-screen text-white transition-all duration-500 ${settings.turboMode ? 'contrast-125 saturate-150 brightness-110' : ''}`}>
      <AnimatedBackground themeIndex={bgThemeIndex} onClick={() => setBgThemeIndex((p) => (p + 1) % 4)} disabled={!settings.glitchEffects} />
      
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
        isAuthorizedAdmin={isAuthorizedAdmin}
        onSignOut={handleSignOut}
        onOpenSettings={() => setShowSettingsModal(true)}
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
          <div className="space-y-8 animate-fadeIn">
            {/* Game Statistics Dashboard */}
            <StatsDashboard games={MOCK_GAMES} stats={gameStats} onResetStats={resetGameStats} />

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_GAMES.map(game => (
                <GameCard key={game.id} game={game} onPlay={handlePlay} settings={settings} onSettingChange={updateSetting} isDevMode={isDevMode} isPremium={isPremium} />
              ))}
            </div>
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

        {currentPage === Page.AILab && <AIGameDev activeDevId={activeDevId} />}
        {currentPage === Page.LoveTest && <LoveLab />}
        {currentPage === Page.DevTerminal && isAuthorizedAdmin && purchasedTier === 'creator' && <DevTerminal devId={activeDevId} />}
        {currentPage === Page.AdminConsole && isAuthorizedAdmin && <AdminConsole devId={activeDevId} purchasedTier={purchasedTier} />}
        {currentPage === Page.Deploy && <DeployPortal />}
        {currentPage === Page.PermitShop && <PermitShop activeDevId={activeDevId} onUpgrade={handleUpgradeTier} purchasedTier={purchasedTier} isBypassed={isBypassed} />}

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

      {showSettingsModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass border-2 border-green-500 bg-slate-950 p-6 rounded-sm relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-scaleIn">
            
            {/* Top scanning bar decorative element */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/30 overflow-hidden">
              <div className="h-full bg-green-500 w-1/3 animate-loadingLine"></div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-green-500">SYSTEM_CONFIGURATION_UPLINK</h3>
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mt-0.5">Adjust client shaders, performance nodes, and hacks</span>
              </div>
              <button 
                onClick={() => { setShowSettingsModal(false); audio.playClick(); }}
                className="text-gray-400 hover:text-white text-xs font-mono border border-white/10 hover:border-white/30 px-2 py-1 rounded"
              >
                [ESC]
              </button>
            </div>

            <div className="space-y-6">
              {/* Glitch Effects & CRT Shader Toggle */}
              <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black italic text-gray-300 uppercase tracking-wider block">
                      GLITCH_EFFECTS_AND_CRT_SHADERS
                    </label>
                    <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide leading-relaxed block">
                      Enable CRT scanline sweeps, glitch visual noise, and continuous animated background gradient shaders. Disable this for better performance on lower-end devices.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      updateSetting('glitchEffects', !settings.glitchEffects);
                      audio.playSuccess();
                    }}
                    className={`px-3 py-1.5 text-[9px] font-black italic uppercase transition-all ${
                      settings.glitchEffects 
                        ? 'bg-green-600 text-white border-2 border-green-400' 
                        : 'bg-black text-gray-600 border-2 border-white/10'
                    }`}
                  >
                    {settings.glitchEffects ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                {/* Visual Status Indicator */}
                <div className="flex items-center gap-1.5 mt-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${settings.glitchEffects ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}></div>
                  <span className="text-[8px] font-black font-mono text-gray-600 uppercase">
                    {settings.glitchEffects ? 'SYSTEM_SHADERS_ENGAGED // ACTIVE_ANIMATION' : 'STATIC_BACKGROUND // LOW_COMPUTE_MODE'}
                  </span>
                </div>
              </div>

              {/* Turbo Mode Toggle */}
              <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black italic text-gray-300 uppercase tracking-wider block">
                      TURBO_PERFORMANCE_MODE
                    </label>
                    <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide leading-relaxed block">
                      Enhance global contrast, saturation, and display brightness. Active on premium servers.
                    </span>
                  </div>
                  <button
                    disabled={!isPremium}
                    onClick={() => {
                      updateSetting('turboMode', !settings.turboMode);
                      audio.playSuccess();
                    }}
                    className={`px-3 py-1.5 text-[9px] font-black italic uppercase transition-all ${
                      !isPremium 
                        ? 'bg-gray-950 text-gray-700 border-2 border-white/5 cursor-not-allowed' 
                        : settings.turboMode 
                          ? 'bg-yellow-500 text-black border-2 border-yellow-300' 
                          : 'bg-black text-gray-600 border-2 border-white/10'
                    }`}
                  >
                    {!isPremium ? 'LOCKED' : settings.turboMode ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                {/* Visual Status Indicator */}
                <div className="flex items-center gap-1.5 mt-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${!isPremium ? 'bg-red-500' : settings.turboMode ? 'bg-yellow-500 animate-ping' : 'bg-gray-800'}`}></div>
                  <span className="text-[8px] font-black font-mono text-gray-600 uppercase">
                    {!isPremium ? 'PLATINUM_MEMBERSHIP_REQUIRED' : settings.turboMode ? 'TURBO_MODE_ENGAGED // ENHANCED_GFX' : 'STANDARD_GFX_ENGINE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { setShowSettingsModal(false); audio.playClick(); }}
                className="flex-1 py-3 bg-green-600/10 hover:bg-green-600 hover:text-black border-2 border-green-500 text-green-500 font-black italic uppercase skew-x-[-12deg] transition-all text-[10px] tracking-widest"
              >
                SAVE_AND_APPLY_CONFIG
              </button>
            </div>

            {/* Decorative bottom line */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-600 font-black tracking-widest font-mono">
              <span>PROTOCOL: 0x55F3</span>
              <span>NODE: {activeDevId || 'GUEST_UPLINK'}</span>
            </div>

          </div>
        </div>
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
