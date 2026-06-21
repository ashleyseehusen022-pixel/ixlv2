
import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../services/audioService';

interface LogEntry {
  id: number;
  time: string;
  msg: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'cmd' | 'global' | 'subtle';
}

interface CustomCommand {
  trigger: string;
  type: 'text' | 'color' | 'cloak' | 'spoof';
  payload: string;
}

interface DevTerminalProps {
  devId?: string;
}

export const DevTerminal: React.FC<DevTerminalProps> = ({ devId = '' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isServerDown, setIsServerDown] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [terminalColor, setTerminalColor] = useState('#22c55e'); // Default green
  const [fakeLatency, setFakeLatency] = useState(12);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Persistent list of granted administrators
  const [adminList, setAdminList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('phonk_granted_admins');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('phonk_granted_admins', JSON.stringify(adminList));
  }, [adminList]);

  // Custom user commands state
  const [customCmds, setCustomCmds] = useState<CustomCommand[]>(() => {
    try {
      const stored = localStorage.getItem('phonk_custom_cmds_v2');
      return stored ? JSON.parse(stored) : [
        { trigger: '/ping', type: 'text', payload: 'PONG // ACTIVE PACKET RELAY OPERATIONAL' },
        { trigger: '/neon', type: 'color', payload: '#eab308' },
        { trigger: '/work', type: 'spoof', payload: 'Security Operations & Firewall' }
      ];
    } catch {
      return [];
    }
  });

  // Creator state
  const [newCmdTrigger, setNewCmdTrigger] = useState('');
  const [newCmdType, setNewCmdType] = useState<'text' | 'color' | 'cloak' | 'spoof'>('text');
  const [newCmdPayload, setNewCmdPayload] = useState('');

  useEffect(() => {
    localStorage.setItem('phonk_custom_cmds_v2', JSON.stringify(customCmds));
  }, [customCmds]);

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

    // 1. Check if it matches custom commands first
    const customMatch = customCmds.find(c => c.trigger === base);
    if (customMatch) {
      if (customMatch.type === 'text') {
        addLog(customMatch.payload, 'success');
      } else if (customMatch.type === 'color') {
        setTerminalColor(customMatch.payload);
        addLog(`TERMINAL THEME UPDATED TO: ${customMatch.payload}`, 'success');
      } else if (customMatch.type === 'cloak') {
        const dest = customMatch.payload.toLowerCase();
        addLog(`CLOAKING ENGAGED. LAUNCHING SECURE HOST: ${customMatch.payload}`, 'subtle');
        setTimeout(() => {
          if (dest === 'google') window.location.href = 'https://www.google.com';
          else if (dest === 'classroom') window.location.href = 'https://classroom.google.com';
          else if (dest === 'docs') window.location.href = 'https://docs.google.com';
          else window.location.href = customMatch.payload.startsWith('http') ? customMatch.payload : `https://${customMatch.payload}`;
        }, 1200);
      } else if (customMatch.type === 'spoof') {
        document.title = customMatch.payload;
        addLog(`TAB TITLE SPOOFED TO: ${customMatch.payload}`, 'success');
      }
      return;
    }

    // 2. Default hardcoded Command set
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
        addLog('/grantadmin [user] [devid] [passkey] - Delegate administrator privileges', 'success');
        addLog('/admins - View all authorized administrators', 'success');
        addLog('--- SYSTEM TWEAKS ---', 'info');
        addLog('/theme [color] - Change UI highlight color', 'info');
        addLog('/latency [ms] - Adjust simulated network delay', 'info');
        addLog('/broadcast [msg] - Send global admin notification', 'info');
        addLog('/whoami - Display developer credentials', 'info');
        addLog('/logins - List active simulated sessions', 'info');
        addLog('/cloak [target] - Quick redirect (google/classroom/docs)', 'info');
        addLog('/spoof [title] - Change active tab name', 'info');
        addLog('--- CUSTOM MACRO UTILITIES ---', 'info');
        addLog('/makecmd [trigger] [type] [payload] - Add custom macro (JAXYN ONLY)', 'info');
        addLog('/delcmd [trigger] - Destroy command macro (JAXYN ONLY)', 'info');
        
        addLog('--- REGISTERED CUSTOM MACROS ---', 'success');
        if (customCmds.length === 0) {
          addLog('No custom commands registered. Inject one!', 'warn');
        } else {
          customCmds.forEach(c => {
            addLog(`${c.trigger} (${c.type}) -> "${c.payload.substring(0, 35)}${c.payload.length > 35 ? '...' : ''}"`, 'subtle');
          });
        }
        break;

      case '/grantadmin':
      case '/giveadmin': {
        if (args.length === 0) {
          addLog('USAGE: /grantadmin <username> [jaxyn_dev_id] [jaxyn_passkey]', 'error');
          audio.playError();
          break;
        }

        const targetUser = args[0];
        const isJaxynActive = devId.toUpperCase() === 'JAXYN120815';
        const providedDevId = args[1]?.toUpperCase();
        const providedPasskey = args[2]?.toUpperCase();
        const hasPassedCreds = providedDevId === 'JAXYN120815' && providedPasskey === 'JAXYN';

        if (isJaxynActive || hasPassedCreds) {
          if (!adminList.includes(targetUser)) {
            setAdminList(prev => [...prev, targetUser]);
          }
          addLog(`[ADMIN AUTHORITY] SUCCESS: PRIVILEGES INJECTED FOR USER '${targetUser}'`, 'success');
          audio.playSuccess();
        } else {
          addLog('ACCESS REFUSED: SECURE KERNEL ENCRYPTED.', 'error');
          addLog("ONLY ROOT USER 'JAXYN120815' MIGHT DELEGATE ADMINISTRATIVE CAPABILITIES.", 'error');
          addLog('SPECIFY MY CREDENTIALS: /grantadmin <user> <my_dev_id> <my_passkey>', 'info');
          audio.playError();
        }
        break;
      }

      case '/admins': {
        addLog('--- GRANTED SYSTEM ADMINISTRATORS ---', 'success');
        addLog(`OWNER_ROOT: JAXYN120815 [LEVEL_10_GLOBAL_ADMIN]`, 'success');
        if (adminList.length === 0) {
          addLog('No external admins delegated.', 'info');
        } else {
          adminList.forEach(user => {
            addLog(`DELEGATED_ADMIN: ${user.toUpperCase()} [LEVEL_5_EXTERNAL]`, 'info');
          });
        }
        break;
      }

      case '/makecmd': {
        const isAuthorized = devId.toUpperCase() === 'JAXYN120815';
        if (!isAuthorized) {
          addLog('SECURE OVERRIDE ERROR: CORE PIPELINE LOCKED.', 'error');
          addLog('ONLY VERIFIED ROOT USER [JAXYN120815] HAS PERMISSION TO REGISTER COMMANDS.', 'error');
          audio.playError();
          break;
        }

        if (args.length < 3) {
          addLog('SYNTAX ERROR. Usage: /makecmd <trigger> <type> <payload...>', 'warn');
          addLog('Supported types: text | color | cloak | spoof', 'info');
          break;
        }

        const newTrigger = args[0];
        const newType = args[1].toLowerCase() as any;
        const newPayload = args.slice(2).join(' ');

        if (!newTrigger.startsWith('/')) {
          addLog('ERROR: COMMAND TRIGGER MUST COMMENCE WITH A SLASH (/)', 'error');
          break;
        }

        const supportedTypes = ['text', 'color', 'cloak', 'spoof'];
        if (!supportedTypes.includes(newType)) {
          addLog(`ERROR: '${newType}' IS NOT A VALID MACRO TYPE. SELECT: text | color | cloak | spoof`, 'error');
          break;
        }

        // Register action
        const cmdExists = customCmds.some(c => c.trigger === newTrigger);
        if (cmdExists) {
          setCustomCmds(prev => prev.map(c => c.trigger === newTrigger ? { trigger: newTrigger, type: newType, payload: newPayload } : c));
          addLog(`DYNAMIC COMMAND RE-ASSEMBLED: Directing '${newTrigger}' to ${newType}.`, 'success');
        } else {
          setCustomCmds(prev => [...prev, { trigger: newTrigger, type: newType, payload: newPayload }]);
          addLog(`DYNAMIC COMMAND REGISTERED: Trigger '${newTrigger}' executes ${newType}.`, 'success');
        }
        audio.playSuccess();
        break;
      }

      case '/delcmd': {
        const isAuthorized = devId.toUpperCase() === 'JAXYN120815';
        if (!isAuthorized) {
          addLog('SECURITY ACCORD OVERRIDE EXCEPTION: COMMAND PIPELINE READ-ONLY.', 'error');
          audio.playError();
          break;
        }

        const targetTrigger = args[0];
        if (!targetTrigger) {
          addLog('SYNTAX ERROR. Usage: /delcmd <trigger>', 'warn');
          break;
        }

        if (!customCmds.some(c => c.trigger === targetTrigger)) {
          addLog(`ERROR: NO REGISTERED DYNAMIC MACRO UNDER '${targetTrigger}'`, 'error');
          break;
        }

        setCustomCmds(prev => prev.filter(c => c.trigger !== targetTrigger));
        addLog(`DYNAMIC COMMAND DE-INJECTED: Trigger '${targetTrigger}' successfully deleted.`, 'success');
        audio.playWhoosh();
        break;
      }

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
        addLog(`ID: ${devId.toUpperCase() || 'ROOT_DEVELOPER_01'}`, 'info');
        addLog(`PRIVILEGES: ${devId.toUpperCase() === 'JAXYN120815' ? 'UNLIMITED_ROOT_OWNER' : 'LEVEL_3_READONLY'}`, 'success');
        addLog('UPLINK: ENCRYPTED_TUNNEL_04', 'info');
        break;

      case '/logins':
        addLog('ACTIVE SESSIONS:', 'info');
        addLog('User_992 (192.168.1.4) - ARCADE', 'info');
        addLog('User_441 (172.10.0.12) - VPN', 'info');
        addLog(`${devId || 'Dev_01'} (LOCAL) - ROOT`, 'success');
        break;

      case '/cloak':
        const target = args[0]?.toLowerCase();
        if (target === 'google') window.location.href = 'https://www.google.com';
        else if (target === 'classroom') window.location.href = 'https://classroom.google.com';
        else if (target === 'docs') window.location.href = 'https://docs.google.com';
        else if (target === 'clever') window.location.href = 'https://clever.com/login';
        else addLog('ERROR: UNKNOWN CLOAK TARGET. USE (google|classroom|docs|clever)', 'error');
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

  const handleCreateCustomCmd = () => {
    if (devId.toUpperCase() !== 'JAXYN120815') {
      audio.playError();
      return;
    }
    if (!newCmdTrigger.trim() || !newCmdPayload.trim()) {
      audio.playError();
      return;
    }

    const trigger = newCmdTrigger.trim().startsWith('/') ? newCmdTrigger.trim() : `/${newCmdTrigger.trim()}`;
    const cmdExists = customCmds.some(c => c.trigger === trigger);

    if (cmdExists) {
      setCustomCmds(prev => prev.map(c => c.trigger === trigger ? { trigger, type: newCmdType, payload: newCmdPayload } : c));
      addLog(`DYNAMIC COMMAND RE-ASSEMBLED: Directing '${trigger}' to execute ${newCmdType}.`, 'success');
    } else {
      setCustomCmds(prev => [...prev, { trigger, type: newCmdType, payload: newCmdPayload }]);
      addLog(`DYNAMIC COMMAND REGISTERED: Trigger '${trigger}' executes ${newCmdType}.`, 'success');
    }

    setNewCmdTrigger('');
    setNewCmdPayload('');
    audio.playSuccess();
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
    <div className="max-w-7xl mx-auto py-10 px-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b-2 border-red-500/20 pb-6">
        <div className="w-12 h-12 bg-red-600/20 rounded-sm flex items-center justify-center border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
        </div>
        <div>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter phonk-text">COMMAND_CONSOLE</h2>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse">
            {devId.toUpperCase() === 'JAXYN120815' ? 'ROOT_USER // FULL ACCESS PIPELINE ACTIVE' : 'DEV_OVERRIDE // LEVEL_3_READONLY_TUNNEL'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CLI Interface */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div 
            className="glass h-[580px] border-2 rounded-sm p-6 overflow-hidden relative flex flex-col font-mono text-[11px] leading-relaxed transition-colors duration-500"
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
                      log.type === 'subtle' ? 'text-green-600/80' : 
                      log.type === 'global' ? 'text-purple-400 font-black animate-pulse' : 'text-blue-400'
                    }`}>
                      {log.type === 'cmd' ? 'EXEC' : log.type.toUpperCase()}:
                    </span>
                    <span className={`italic ${log.type === 'cmd' ? 'text-white font-bold' : log.type === 'global' ? 'text-purple-200' : log.type === 'subtle' ? 'text-gray-400 font-bold' : 'text-gray-300'}`}>
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

        {/* Custom Workshop & Stats Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* JAXYN'S EXCLUSIVE COMMAND CONSTRUCTOR */}
          <div 
            className="glass p-6 border-2 relative overflow-hidden transition-all duration-300 rounded-sm"
            style={{ 
              borderColor: devId.toUpperCase() === 'JAXYN120815' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.2)' 
            }}
          >
            {devId.toUpperCase() === 'JAXYN120815' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                  <h3 className="text-[10px] font-black italic text-green-400 uppercase tracking-widest">
                    JAXYN_PIPELINE_CREATOR
                  </h3>
                </div>
                
                <p className="text-[9px] text-gray-500 italic leading-relaxed">
                  Construct custom command macros in real-time. Instruct the kernel on what specific proxy redirect, theme modification, or message print action to take.
                </p>

                <div className="space-y-3 pt-2 text-[10px] font-mono">
                  <div>
                    <label className="text-gray-400 block mb-1">COMMAND TRIGGER (e.g. /mycmd):</label>
                    <input 
                      type="text" 
                      placeholder="/hello"
                      value={newCmdTrigger}
                      onChange={(e) => setNewCmdTrigger(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 p-2 text-white placeholder-gray-700 outline-none focus:border-green-500 transition-colors rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">ACTION TYPE / INSTRUCTION:</label>
                    <select 
                      value={newCmdType}
                      onChange={(e) => setNewCmdType(e.target.value as any)}
                      className="w-full bg-black/60 border border-white/10 p-2 text-white outline-none focus:border-green-500 transition-all rounded-sm font-bold"
                    >
                      <option value="text">Print message in stdout (text)</option>
                      <option value="color">Update terminal theme color (color)</option>
                      <option value="cloak">Bypass secure iframe redirect (cloak)</option>
                      <option value="spoof">Change browser document tab title (spoof)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">BEHAVIOR PAYLOAD (Output/Target):</label>
                    <input 
                      type="text" 
                      placeholder="Welcome commander Jaxyn!"
                      value={newCmdPayload}
                      onChange={(e) => setNewCmdPayload(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 p-2 text-white placeholder-gray-700 outline-none focus:border-green-500 transition-colors rounded-sm"
                    />
                  </div>

                  <button 
                    onClick={handleCreateCustomCmd}
                    className="w-full py-3 mt-2 bg-green-600 hover:bg-white hover:text-green-600 text-white font-black italic uppercase text-[9px] transition-all skew-x-[-12deg] tracking-wider rounded-sm"
                  >
                    INJECT MACRO PIPELINE
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <h3 className="text-[10px] font-black italic uppercase tracking-widest text-red-600">
                    CONSTRUCTOR_SHIELDED
                  </h3>
                </div>
                <p className="text-[10px] text-red-500/80 font-mono italic leading-relaxed">
                  [SECURITY PROTOCOL] MACRO CONSTRUCTOR MODULE ENCRYPTED. ONLY USER 'JAXYN120815' IS GRANTED PERMISSION LEVEL TO WRITE NEW INJECTIONS.
                </p>
                <div className="p-3 bg-red-950/20 border border-red-500/10 text-[8px] font-mono text-gray-500 flex flex-col gap-1 rounded-sm">
                  <div>USERID: {devId || 'GUEST_OVERRIDE'}</div>
                  <div>PRIVILEGES: READONLY_GUEST_CHANNEL</div>
                  <div>AUTH LEVEL: REJECT_API_ACCESS</div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE PIPELINE LIST */}
          <div className="glass p-6 border-2 border-green-500/10 rounded-sm">
            <h3 className="text-[10px] font-black text-green-500 italic uppercase mb-4 tracking-widest border-b border-white/5 pb-2">ACTIVE TERMINAL MACROS</h3>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-2 text-[9px] font-mono scrollbar-hide">
              {customCmds.length > 0 ? customCmds.map(c => (
                <div key={c.trigger} className="p-2 border border-white/5 bg-black/30 flex flex-col gap-1 group relative rounded-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{c.trigger}</span>
                    <span className="text-[7px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded font-bold uppercase">{c.type}</span>
                  </div>
                  <div className="text-gray-500 truncate italic pr-6">“{c.payload}”</div>
                  {devId.toUpperCase() === 'JAXYN120815' && (
                    <button 
                      onClick={() => {
                        setCustomCmds(prev => prev.filter(x => x.trigger !== c.trigger));
                        addLog(`TERMINAL PIPELINE DE-REGISTERED: Command '${c.trigger}' removed.`, 'subtle');
                        audio.playWhoosh();
                      }}
                      className="absolute right-2 bottom-2 text-red-500 hover:text-white transition-opacity md:opacity-0 group-hover:opacity-100"
                      title="De-register macro"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              )) : (
                <div className="text-gray-700 italic text-center py-2">NO CUSTOM MACROS DISCOVERED</div>
              )}
            </div>
          </div>

          {/* Core Stats Panel */}
          <div className="glass p-6 border-2 border-white/5 rounded-sm">
            <h3 className="text-[10px] font-black text-gray-500 italic uppercase mb-4 tracking-widest">LIVE DATA FEED</h3>
            <div className="space-y-4 text-[10px] font-mono font-bold italic uppercase">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">BANS ACTIVE:</span>
                <span className="text-red-500">{bannedUsers.length}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">PING_LATENCY:</span>
                <span style={{ color: terminalColor }}>{fakeLatency}ms</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">CPU LOAD:</span>
                <span className="text-green-500">{(Math.random() * 20 + 5).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
