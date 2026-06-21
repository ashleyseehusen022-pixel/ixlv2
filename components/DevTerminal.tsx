
import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: number;
  time: string;
  msg: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'cmd' | 'global';
}

export const DevTerminal: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isServerDown, setIsServerDown] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [terminalColor, setTerminalColor] = useState('#22c55e'); // Default green
  const [fakeLatency, setFakeLatency] = useState(12);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      msg,
      type
    }].slice(-100));
  };

  useEffect(() => {
    addLog('ROOT ACCESS GRANTED', 'success');
    addLog('TYPE /help FOR ADVANCED DEVELOPER COMMANDS', 'info');
    
    const interval = setInterval(() => {
      if (!isServerDown) {
        const backgroundMsgs = [
          'Scanning for unauthorized uplinks...',
          'Bypassing regional firewalls...',
          'Encrypting user session data...',
          'Relay nodes operational: 14/14',
          'Traffic packets: ' + (Math.random() * 1000).toFixed(0) + ' p/s',
        ];
        addLog(backgroundMsgs[Math.floor(Math.random() * backgroundMsgs.length)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isServerDown]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    addLog(`> ${cmd}`, 'cmd');

    switch (base) {
      case '/help':
        addLog('--- CORE COMMANDS ---', 'info');
        addLog('/ban [user] - Restrict user access', 'info');
        addLog('/unban [user] - Restore user access', 'info');
        addLog('/shutdown - Terminate local server instances', 'warn');
        addLog('/reboot - Restart system services', 'success');
        addLog('/clear - Wipe terminal logs', 'info');
        addLog('/status - View system integrity', 'info');
        addLog('/nuke - Wipe all local storage', 'error');
        addLog('--- SYSTEM TWEAKS ---', 'info');
        addLog('/theme [color] - Change UI highlight color', 'info');
        addLog('/latency [ms] - Adjust simulated network delay', 'info');
        addLog('/broadcast [msg] - Send global admin notification', 'info');
        addLog('/whoami - Display developer credentials', 'info');
        addLog('/logins - List active simulated sessions', 'info');
        addLog('/cloak [target] - Quick redirect (google/classroom/docs)', 'info');
        addLog('/spoof [title] - Change active tab name', 'info');
        break;

      case '/ban':
        if (args.length === 0) {
          addLog('ERROR: SPECIFY USER TO BAN', 'error');
        } else {
          const user = args.join(' ');
          setBannedUsers(prev => [...prev, user]);
          addLog(`USER [${user}] ADDED TO BLACKLIST. SESSION TERMINATED.`, 'success');
        }
        break;

      case '/unban':
        if (args.length === 0) {
          addLog('ERROR: SPECIFY USER TO UNBAN', 'error');
        } else {
          const user = args.join(' ');
          setBannedUsers(prev => prev.filter(u => u !== user));
          addLog(`USER [${user}] REMOVED FROM BLACKLIST.`, 'success');
        }
        break;

      case '/shutdown':
        addLog('INITIATING GLOBAL SHUTDOWN SEQUENCE...', 'warn');
        setTimeout(() => {
          setIsServerDown(true);
          addLog('SERVERS OFFLINE. ALL CONNECTIONS DROPPED.', 'error');
        }, 1500);
        break;

      case '/reboot':
        addLog('REBOOTING SYSTEM...', 'success');
        setTimeout(() => {
          setIsServerDown(false);
          setLogs([]);
          addLog('SYSTEM REBOOT COMPLETE. UPLINK RESTORED.', 'success');
        }, 2000);
        break;

      case '/clear':
        setLogs([]);
        break;

      case '/status':
        addLog('--- SYSTEM INTEGRITY REPORT ---', 'info');
        addLog(`SERVER STATUS: ${isServerDown ? 'OFFLINE' : 'OPERATIONAL'}`, isServerDown ? 'error' : 'success');
        addLog(`BANNED ENTITIES: ${bannedUsers.length}`, 'warn');
        addLog(`TERMINAL THEME: ${terminalColor}`, 'info');
        addLog(`FAKE LATENCY: ${fakeLatency}ms`, 'info');
        addLog('UPTIME: 99.99%', 'success');
        break;

      case '/nuke':
        if (confirm('CRITICAL: WIPE ALL LOCAL DATA?')) {
          localStorage.clear();
          addLog('DATABASE WIPED. GOODBYE.', 'error');
          setTimeout(() => window.location.reload(), 2000);
        }
        break;

      case '/theme':
        if (args[0]) {
          setTerminalColor(args[0]);
          addLog(`TERMINAL THEME UPDATED TO: ${args[0]}`, 'success');
        } else {
          addLog('ERROR: SPECIFY HEX OR COLOR NAME', 'error');
        }
        break;

      case '/latency':
        const ms = parseInt(args[0]);
        if (!isNaN(ms)) {
          setFakeLatency(ms);
          addLog(`SIMULATED LATENCY SET TO ${ms}ms`, 'success');
        } else {
          addLog('ERROR: INVALID LATENCY VALUE', 'error');
        }
        break;

      case '/broadcast':
        const msg = args.join(' ');
        if (msg) {
          addLog(`[GLOBAL BROADCAST]: ${msg}`, 'global');
        } else {
          addLog('ERROR: CANNOT BROADCAST EMPTY MESSAGE', 'error');
        }
        break;

      case '/whoami':
        addLog('ID: ROOT_DEVELOPER_01', 'info');
        addLog('PRIVILEGES: UNLIMITED', 'success');
        addLog('UPLINK: ENCRYPTED_TUNNEL_04', 'info');
        break;

      case '/logins':
        addLog('ACTIVE SESSIONS:', 'info');
        addLog('User_992 (192.168.1.4) - ARCADE', 'info');
        addLog('User_441 (172.10.0.12) - VPN', 'info');
        addLog('Dev_01 (LOCAL) - ROOT', 'success');
        break;

      case '/cloak':
        const target = args[0]?.toLowerCase();
        if (target === 'google') window.location.href = 'https://www.google.com';
        else if (target === 'classroom') window.location.href = 'https://classroom.google.com';
        else if (target === 'docs') window.location.href = 'https://docs.google.com';
        else addLog('ERROR: UNKNOWN CLOAK TARGET. USE (google|classroom|docs)', 'error');
        break;

      case '/spoof':
        const title = args.join(' ');
        if (title) {
          document.title = title;
          addLog(`TAB TITLE SPOOFED TO: ${title}`, 'success');
        } else {
          addLog('ERROR: SPECIFY TITLE STRING', 'error');
        }
        break;

      default:
        addLog(`UNKNOWN COMMAND: ${base}. TYPE /help`, 'error');
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    executeCommand(commandInput);
    setCommandInput('');
  };

  if (isServerDown) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center animate-pulse">
        <h1 className="text-6xl font-black italic text-red-600 mb-6 phonk-text uppercase">SERVERS OFFLINE</h1>
        <p className="text-gray-500 font-mono text-sm mb-12">LOCAL HOST TERMINATED BY ROOT ADMIN</p>
        <button 
          onClick={() => executeCommand('/reboot')}
          className="px-10 py-5 bg-green-600 text-white font-black italic uppercase skew-x-[-12deg] hover:bg-white hover:text-green-600 transition-all"
        >
          REBOOT SYSTEM
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b-2 border-red-500/20 pb-6">
        <div className="w-12 h-12 bg-red-600/20 rounded-sm flex items-center justify-center border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
        </div>
        <div>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter phonk-text">COMMAND_CONSOLE</h2>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse">DEV_OVERRIDE: ENABLED</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CLI Interface */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div 
            className="glass h-[550px] border-2 rounded-sm p-6 overflow-hidden relative flex flex-col font-mono text-[11px] leading-relaxed transition-colors duration-500"
            style={{ borderColor: `${terminalColor}33` }}
          >
            {/* Scanline FX */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,255,255,0.4)_50%)] bg-[size:100%_4px]"></div>
            <div 
              className="absolute top-0 left-0 w-full h-1 shadow-[0_0_10px_currentColor] transition-colors duration-500"
              style={{ backgroundColor: terminalColor, color: terminalColor }}
            ></div>
            
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-1">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-gray-600 flex-shrink-0">[{log.time}]</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={`font-black uppercase flex-shrink-0 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-500 font-bold' :
                      log.type === 'warn' ? 'text-yellow-400' : 
                      log.type === 'cmd' ? 'text-white underline' : 
                      log.type === 'global' ? 'text-purple-400 font-black animate-pulse' : 'text-blue-400'
                    }`}>
                      {log.type === 'cmd' ? 'EXEC' : log.type.toUpperCase()}:
                    </span>
                    <span className={`italic ${log.type === 'cmd' ? 'text-white font-bold' : log.type === 'global' ? 'text-purple-200' : 'text-gray-300'}`}>
                      {log.msg}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          <form onSubmit={handleCommandSubmit} className="relative group">
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 font-black italic text-lg opacity-50 transition-colors"
              style={{ color: terminalColor }}
            >$</div>
            <input 
              type="text" 
              placeholder="ENTER COMMAND... (/help)"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="w-full bg-black border-2 rounded-sm py-5 pl-12 pr-6 font-mono text-sm outline-none transition-all shadow-2xl"
              style={{ borderColor: `${terminalColor}33`, color: terminalColor }}
              autoFocus
            />
          </form>
        </div>

        {/* Quick Stats Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div 
            className="glass p-6 border-2 transition-colors"
            style={{ borderColor: `${terminalColor}22` }}
          >
            <h3 className="text-[10px] font-black italic uppercase mb-4 tracking-widest" style={{ color: terminalColor }}>LIVE DATA</h3>
            <div className="space-y-4 text-[10px] font-bold italic uppercase">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">BANS:</span>
                <span className="text-red-500">{bannedUsers.length}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">LATENCY:</span>
                <span style={{ color: terminalColor }}>{fakeLatency}ms</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">CPU:</span>
                <span className="text-green-500">{(Math.random() * 20 + 5).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 border-2 border-yellow-500/20">
            <h3 className="text-[10px] font-black text-yellow-500 italic uppercase mb-4 tracking-widest">USER BLACKLIST</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {bannedUsers.length > 0 ? bannedUsers.map(u => (
                <div key={u} className="flex justify-between items-center bg-black/40 p-2 border border-white/5">
                  <span className="text-[9px] text-gray-400 truncate max-w-[80px]">{u}</span>
                  <button onClick={() => executeCommand(`/unban ${u}`)} className="text-red-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              )) : <div className="text-[9px] text-gray-700 italic">EMPTY LIST</div>}
            </div>
          </div>

          <button 
            onClick={() => executeCommand('/shutdown')}
            className="w-full py-4 bg-red-600/10 border-2 border-red-600 text-red-500 font-black italic uppercase hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg] text-[10px]"
          >
            FORCE SHUTDOWN
          </button>
        </div>
      </div>
    </div>
  );
};
