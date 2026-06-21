
import React, { useState, useEffect, useRef } from 'react';

interface LogLine {
  id: string;
  timestamp: string;
  type: 'CMD' | 'SYS' | 'ERR' | 'OK' | 'GLOBAL' | 'LEAK';
  text: string;
  color?: string;
}

export const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'overrides' | 'state'>('terminal');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [accentColor, setAccentColor] = useState('#a855f7'); 
  
  // Developer Overrides State
  const [overrides, setOverrides] = useState({
    crtIntensity: 0.1,
    glitchFrequency: 0.3,
    hueRotation: 0,
    experimentalBypass: true,
    infiniteJumps: false,
    gameSpeed: 1.0,
  });

  const [localData, setLocalData] = useState(JSON.stringify(localStorage, null, 2));
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: LogLine['type'] = 'SYS', color?: string) => {
    const newLine: LogLine = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      text,
      color
    };
    setLogs(prev => [...prev, newLine].slice(-150));
  };

  useEffect(() => {
    if (logs.length === 0) {
      addLog('ADMIN COMMAND CENTER INITIALIZED', 'OK');
      addLog('AUTHENTICATED AS ROOT_SUPERUSER', 'SYS');
      addLog('UPLINK STABLE // LATENCY: 14ms', 'OK');
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Sync visual overrides to body styles
  useEffect(() => {
    document.documentElement.style.setProperty('--crt-opacity', overrides.crtIntensity.toString());
    document.documentElement.style.setProperty('--hue-rotate', `${overrides.hueRotation}deg`);
    
    const scanline = document.querySelector('.scanline') as HTMLElement;
    if (scanline) scanline.style.opacity = (overrides.crtIntensity * 2).toString();
  }, [overrides]);

  const handleCommand = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    
    addLog(input, 'CMD', '#fff');
    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case '/help':
        addLog('--- ADMINISTRATION MODULE ---', 'SYS', accentColor);
        addLog('/ban [id] - Ban target from system', 'SYS');
        addLog('/shutdown - Terminate all local instances', 'ERR');
        addLog('/reboot - Restart system kernel', 'OK');
        addLog('/broadcast [msg] - Send system-wide alert', 'GLOBAL');
        addLog('/theme [color] - Set console accent color', 'SYS');
        addLog('/clear - Clear console buffer', 'SYS');
        addLog('/nuke - Global data wipe', 'ERR');
        addLog('--- ADVANCED CMDs ---', 'SYS', '#fbbf24');
        addLog('/matrix - Toggle digital rain protocol', 'OK');
        addLog('/uptime - Show session duration', 'OK');
        addLog('/users - List connected simulated nodes', 'SYS');
        addLog('/proxy - Check mirror latency report', 'SYS');
        addLog('/exploit [target] - Run vulnerability scan', 'ERR');
        addLog('/leak - Dump sensitive system metadata', 'LEAK');
        addLog('/sysinfo - Get hardware profile', 'SYS');
        addLog('/credits - Display project architects', 'OK');
        addLog('/echo [msg] - Repeat input back to terminal', 'SYS');
        addLog('/unlock - Access restricted archive content', 'GLOBAL');
        break;

      case '/clear': 
        setLogs([]); 
        break;

      case '/uptime':
        const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        addLog(`SESSION UPTIME: ${seconds}s // STATUS: NOMINAL`, 'OK');
        break;

      case '/matrix':
        setIsMatrixActive(!isMatrixActive);
        addLog(`DIGITAL RAIN PROTOCOL ${!isMatrixActive ? 'ACTIVATED' : 'DEACTIVATED'}`, 'OK', '#22c55e');
        break;

      case '/users':
        addLog('FETCHING ACTIVE NODES...', 'SYS');
        setTimeout(() => {
          addLog('NODE_102: BRAZIL_SÃO_PAULO (LATENCY 12ms)', 'SYS');
          addLog('NODE_404: USA_NORTH_VIRGINIA (LATENCY 88ms)', 'SYS');
          addLog('NODE_ROOT: LOCAL_HOST (LATENCY 0ms)', 'OK');
          addLog('TOTAL ACTIVE SESSIONS: 3', 'OK');
        }, 600);
        break;

      case '/proxy':
        addLog('SCANNING MIRROR LATENCY...', 'SYS');
        setTimeout(() => {
          addLog('TITAN TUNNEL: 14ms [STABLE]', 'OK');
          addLog('ULTRA BROWSER: 142ms [CONGESTED]', 'ERR');
          addLog('GHOST MIRROR: 45ms [STABLE]', 'OK');
          addLog('WIKI-GATE: 12ms [STEALTH_ACTIVE]', 'OK');
        }, 800);
        break;

      case '/exploit':
        const target = args[0] || 'LOCAL_GATEWAY';
        addLog(`INITIATING EXPLOIT SEQUENCE ON [${target}]...`, 'ERR');
        setTimeout(() => addLog('SEARCHING FOR BUFFER OVERFLOWS...', 'SYS'), 400);
        setTimeout(() => addLog('INJECTING PAYLOAD INTO STACK...', 'SYS'), 800);
        setTimeout(() => addLog('ESCALATING PRIVILEGES TO ROOT...', 'ERR'), 1200);
        setTimeout(() => addLog(`EXPLOIT SUCCESSFUL. [${target}] COMPROMISED.`, 'OK', '#22c55e'), 2000);
        break;

      case '/leak':
        addLog('--- SENSITIVE DATA LEAK ---', 'LEAK', '#ef4444');
        addLog(`OS: ${navigator.platform}`, 'LEAK');
        addLog(`BROWSER: ${navigator.userAgent.split(' ')[0]}`, 'LEAK');
        addLog(`SCREEN: ${window.screen.width}x${window.screen.height}`, 'LEAK');
        addLog(`LANGUAGE: ${navigator.language}`, 'LEAK');
        addLog('STORAGE_KEY: ' + (localStorage.getItem('phonk_system_key') || 'NULL'), 'LEAK');
        addLog('--- END OF LEAK ---', 'LEAK', '#ef4444');
        break;

      case '/sysinfo':
        addLog('--- HARDWARE PROFILE ---', 'SYS');
        addLog(`CORES: ${navigator.hardwareConcurrency || '8'}`, 'SYS');
        addLog(`MEM: ${((navigator as any).deviceMemory || '16')}GB RAM (EST)`, 'SYS');
        addLog(`RENDERER: WebGL 2.0 (ANGL-D3D11)`, 'SYS');
        addLog('STORAGE: 512GB NVMe (MOCKED)', 'OK');
        break;

      case '/credits':
        addLog('--- PROJECT ARCHITECTS ---', 'OK', '#fbbf24');
        addLog('LEAD_DEV: PHONK_MASTER_01', 'SYS');
        addLog('AI_CORE: GEMINI_ENGINE_FLASH', 'SYS');
        addLog('UI_UX: NEO_STEALTH_DESIGN', 'SYS');
        addLog('V5.4.12 BUILD: "SAO PAULO NIGHTS"', 'OK');
        break;

      case '/echo':
        addLog(args.join(' ') || '...ECHOING EMPTY VOID...', 'SYS');
        break;

      case '/unlock':
        addLog('OVERRIDING CONTENT LOCKS...', 'GLOBAL');
        setTimeout(() => {
          addLog('RESTRICTED ARCHIVES ACCESSIBLE.', 'OK', '#22c55e');
          addLog('GOD_MODE_GAMES: UNLOCKED', 'OK');
        }, 1000);
        break;

      case '/reboot':
        addLog('KERNEL REBOOT INITIATED...', 'OK');
        setTimeout(() => { setIsOffline(false); setLogs([]); addLog('SYSTEM RECOVERED.', 'OK'); }, 2000);
        break;

      case '/shutdown':
        addLog('SHUTTING DOWN SYSTEM...', 'ERR');
        setTimeout(() => setIsOffline(true), 1000);
        break;

      case '/theme':
        if (args[0]) {
          setAccentColor(args[0]);
          addLog(`CONSOLE ACCENT UPDATED TO: ${args[0]}`, 'OK');
        } else {
          addLog('ERR: SPECIFY VALID COLOR (HEX/CSS)', 'ERR');
        }
        break;

      case '/broadcast':
        addLog(`[GLOBAL_ALERT]: ${args.join(' ')}`, 'GLOBAL', '#f472b6');
        break;

      default:
        addLog(`ERR: UNKNOWN COMMAND [${cmd}]`, 'ERR');
    }
  };

  const saveStateEditor = () => {
    try {
      const parsed = JSON.parse(localData);
      Object.keys(parsed).forEach(key => localStorage.setItem(key, parsed[key]));
      addLog('LOCAL_STORAGE UPDATED MANUALLY', 'OK');
    } catch (e) {
      addLog('INVALID JSON FORMAT', 'ERR');
    }
  };

  if (isOffline) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-24 h-24 border-8 border-red-500 rounded-full flex items-center justify-center text-red-500 font-black text-4xl">!</div>
        <h1 className="text-6xl font-black italic text-red-600 phonk-text uppercase">SYSTEM OFFLINE</h1>
        <button onClick={() => {setIsOffline(false); addLog('REBOOT SUCCESSFUL', 'OK');}} className="px-10 py-5 bg-green-600 text-white font-black italic uppercase skew-x-[-12deg] border-2 border-green-500">FORCE RESTART</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fadeIn">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6">
        {['terminal', 'overrides', 'state'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-[10px] font-black italic uppercase skew-x-[-15deg] transition-all border-2 ${
              activeTab === tab 
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-black/40 border-white/5 text-gray-500 hover:text-white hover:border-purple-500/50'
            }`}
          >
            {tab === 'terminal' ? 'ROOT_CMD' : tab === 'overrides' ? 'SYSTEM_TWEAKS' : 'STORAGE_ENGINE'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'terminal' && (
            <div className="flex flex-col space-y-4">
              <div className={`glass h-[600px] border-2 border-purple-500/20 rounded-sm relative flex flex-col p-6 font-mono text-xs overflow-hidden transition-all duration-1000 ${isMatrixActive ? 'bg-black/90' : ''}`}>
                <div className={`absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(168,85,247,0.4)_50%)] bg-[size:100%_4px] ${isMatrixActive ? 'opacity-10' : ''}`}></div>
                {isMatrixActive && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden text-green-500 font-mono text-[10px] select-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="absolute whitespace-pre animate-[matrixRain_10s_linear_infinite]" style={{ left: `${i * 5}%`, animationDelay: `${Math.random() * 5}s` }}>
                        {Array.from({ length: 40 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_10px_#a855f7]" style={{ backgroundColor: accentColor }}></div>
                <div className="flex-1 overflow-y-auto pr-4 space-y-1 scrollbar-hide relative z-10">
                  {logs.map(log => (
                    <div key={log.id} className="flex gap-4">
                      <span className="text-gray-700 flex-shrink-0">[{log.timestamp}]</span>
                      <div className="flex flex-wrap gap-2">
                        <span className={`font-black uppercase flex-shrink-0 ${
                          log.type === 'OK' ? 'text-green-400' :
                          log.type === 'ERR' ? 'text-red-500' :
                          log.type === 'GLOBAL' ? 'text-pink-400 animate-pulse' :
                          log.type === 'LEAK' ? 'text-yellow-500 underline' :
                          log.type === 'CMD' ? 'text-white underline' : 'text-purple-400'
                        }`} style={log.color ? { color: log.color } : {}}>
                          {log.type}:
                        </span>
                        <span className={`${log.type === 'CMD' ? 'text-white' : 'text-gray-400'} italic break-all`}>
                          {log.text}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleCommand(inputValue); setInputValue(''); }} className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 font-black italic text-xl opacity-50" style={{ color: accentColor }}>#</div>
                <input 
                  type="text" 
                  placeholder="ROOT@PHONK:~# ENTER COMMAND"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-black border-2 border-purple-500/30 rounded-sm py-5 pl-14 pr-6 text-purple-400 font-mono text-sm outline-none focus:border-purple-500 transition-all shadow-2xl uppercase"
                  style={{ color: accentColor, borderColor: `${accentColor}44` }}
                />
              </form>
            </div>
          )}

          {activeTab === 'overrides' && (
            <div className="glass p-10 border-2 border-purple-500/20 animate-fadeIn h-[600px] overflow-y-auto custom-scroll">
              <h3 className="text-2xl font-black italic text-white uppercase mb-8 border-b border-white/5 pb-4 flex items-center gap-4">
                <div className="w-3 h-3 bg-purple-500 animate-pulse" style={{ backgroundColor: accentColor }}></div>
                VISUAL & LOGIC OVERRIDES
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CRT_SCANLINE_INTENSITY</label>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={overrides.crtIntensity}
                      onChange={(e) => setOverrides({...overrides, crtIntensity: parseFloat(e.target.value)})}
                      className="w-full accent-purple-500 h-1 bg-white/5 appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">GLITCH_FREQUENCY_DB</label>
                    <input 
                      type="range" min="0" max="1" step="0.1"
                      value={overrides.glitchFrequency}
                      onChange={(e) => setOverrides({...overrides, glitchFrequency: parseFloat(e.target.value)})}
                      className="w-full accent-pink-500 h-1 bg-white/5 appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">HUE_ROTATION_OFFSET [DEG]</label>
                    <input 
                      type="range" min="0" max="360" step="1"
                      value={overrides.hueRotation}
                      onChange={(e) => setOverrides({...overrides, hueRotation: parseInt(e.target.value)})}
                      className="w-full accent-blue-500 h-1 bg-white/5 appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-white italic uppercase">EXPERIMENTAL_BYPASS</span>
                      <button 
                        onClick={() => setOverrides({...overrides, experimentalBypass: !overrides.experimentalBypass})}
                        className={`w-12 h-6 rounded-full transition-all relative ${overrides.experimentalBypass ? 'bg-purple-600' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overrides.experimentalBypass ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-500 italic">ENABLES FORCE-INJECTION FOR NON-COOPERATIVE DOMAINS.</p>
                  </div>

                  <div className="p-6 border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-white italic uppercase">GLOBAL_GRAVITY_MOD</span>
                      <button 
                        onClick={() => setOverrides({...overrides, infiniteJumps: !overrides.infiniteJumps})}
                        className={`w-12 h-6 rounded-full transition-all relative ${overrides.infiniteJumps ? 'bg-green-600' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${overrides.infiniteJumps ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-500 italic">UNAFFECTED BY KINEMATIC CONSTRAINTS. (AI_GEN ONLY)</p>
                  </div>
                  
                  <button onClick={() => setOverrides({crtIntensity: 0.1, glitchFrequency: 0.3, hueRotation: 0, experimentalBypass: true, infiniteJumps: false, gameSpeed: 1.0})} className="w-full py-4 text-[10px] font-black italic text-gray-500 hover:text-white uppercase tracking-widest border border-dashed border-white/10 mt-4 transition-all">
                    [ RESTORE_DEFAULT_MANIFEST ]
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'state' && (
            <div className="glass p-10 border-2 border-purple-500/20 animate-fadeIn h-[600px] flex flex-col space-y-6">
               <h3 className="text-xl font-black italic text-white uppercase flex items-center justify-between">
                  STORAGE ENGINE [LOCAL]
                  <span className="text-[10px] text-purple-400 font-mono">ENCRYPTION_DISABLED</span>
               </h3>
               <textarea 
                  value={localData}
                  onChange={(e) => setLocalData(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 p-6 font-mono text-xs text-green-500 outline-none focus:border-green-500/50 resize-none custom-scroll"
                  spellCheck={false}
               />
               <div className="flex gap-4">
                  <button onClick={saveStateEditor} className="flex-1 py-4 bg-green-600 text-white font-black italic uppercase skew-x-[-12deg] hover:bg-white hover:text-green-600 transition-all">
                    COMMIT CHANGES
                  </button>
                  <button onClick={() => setLocalData(JSON.stringify(localStorage, null, 2))} className="px-8 py-4 glass border border-white/10 text-gray-400 font-black italic uppercase skew-x-[-12deg] hover:text-white">
                    REFRESH
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="glass p-8 border-2 border-purple-500/10">
            <h3 className="text-[10px] font-black italic uppercase mb-4 tracking-widest text-purple-500" style={{ color: accentColor }}>ADMIN_PANEL</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-2">
                <span className="text-gray-500">ACCENT:</span>
                <span style={{ color: accentColor }}>{accentColor}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-2">
                <span className="text-gray-500">ACTIVE_MODE:</span>
                <span className="text-green-500 uppercase">{activeTab}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-2">
                <span className="text-gray-500">ENGINE_BUILD:</span>
                <span className="text-blue-400">v5.4.12-PRO</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 border-2 border-red-500/20">
            <h3 className="text-[10px] font-black italic uppercase mb-6 tracking-widest text-red-500">CRITICAL ACTIONS</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleCommand('/status')} className="w-full py-3 bg-white/5 text-[9px] font-black italic uppercase hover:bg-white/10 transition-all">DIAGNOSTIC_RUN</button>
              <button onClick={() => handleCommand('/shutdown')} className="w-full py-3 bg-red-600/20 border border-red-600/40 text-red-500 text-[9px] font-black italic uppercase hover:bg-red-600 hover:text-white transition-all">KILL_PROCESS</button>
              <button onClick={() => handleCommand('/nuke')} className="w-full py-3 bg-black border-2 border-red-600/50 text-red-600 text-[9px] font-black italic uppercase hover:bg-red-600 hover:text-white transition-all">GLOBAL_NUKE</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); }
        :root {
          --hue-rotate: 0deg;
          --crt-opacity: 0.1;
        }
        body {
          filter: hue-rotate(var(--hue-rotate));
        }
        @keyframes matrixRain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
