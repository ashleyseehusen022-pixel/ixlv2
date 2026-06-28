import React, { useState, useRef, useEffect } from 'react';
import { generateGameCode } from '../services/geminiService';
import { AIGenResult } from '../types';
import { audio } from '../services/audioService';

interface AIGameDevProps {
  activeDevId?: string;
}

export const AIGameDev: React.FC<AIGameDevProps> = ({ activeDevId = 'GUEST' }) => {
  const [activeTab, setActiveTab] = useState<'workshop' | 'user-page'>('workshop');
  const [deploymentTarget, setDeploymentTarget] = useState<'sandbox' | 'user-page'>('sandbox');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIGenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const userIframeRef = useRef<HTMLIFrameElement>(null);

  // Retrieve custom user page from local storage or set default template
  const [userPageCode, setUserPageCode] = useState<string>(() => {
    const saved = localStorage.getItem(`phonk_user_page_${activeDevId}`);
    if (saved) return saved;
    return getDefaultUserPageCode(activeDevId);
  });

  useEffect(() => {
    // Sync state if user ID changes
    const saved = localStorage.getItem(`phonk_user_page_${activeDevId}`);
    setUserPageCode(saved || getDefaultUserPageCode(activeDevId));
  }, [activeDevId]);

  // Default initial User Page code
  function getDefaultUserPageCode(userId: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userId}'s Node</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: #030712;
      color: #f3f4f6;
      font-family: 'Space Grotesk', sans-serif;
      overflow-x: hidden;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* Scanlines effect */
    body::before {
      content: " ";
      display: block;
      position: fixed;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      z-index: 9999;
      background-size: 100% 4px, 6px 100%;
      pointer-events: none;
    }

    .container {
      width: 100%;
      max-width: 600px;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid #22c55e;
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.15);
      border-radius: 4px;
      padding: 30px;
      text-align: center;
      position: relative;
    }

    .header {
      border-bottom: 2px solid rgba(34, 197, 94, 0.2);
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .logo-badge {
      display: inline-block;
      background: #16a34a;
      color: #facc15;
      font-size: 11px;
      font-weight: 900;
      padding: 4px 12px;
      transform: skewX(-12deg);
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 32px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
      background: linear-gradient(to right, #4ade80, #facc15, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }

    .user-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .bio {
      color: #9ca3af;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 25px;
      font-style: italic;
    }

    /* Mini clicker game */
    .game-box {
      border: 1px solid rgba(250, 204, 21, 0.3);
      background: rgba(250, 204, 21, 0.03);
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 25px;
    }

    .score {
      font-size: 24px;
      font-weight: 900;
      color: #facc15;
      text-shadow: 0 0 10px rgba(250, 204, 21, 0.3);
      margin-bottom: 10px;
    }

    .click-btn {
      background: #eab308;
      color: #000;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 900;
      font-size: 14px;
      border: none;
      padding: 12px 24px;
      border-radius: 2px;
      cursor: pointer;
      text-transform: uppercase;
      transform: skewX(-10deg);
      transition: all 0.1s ease;
      box-shadow: 0 4px 0 #a16207;
    }

    .click-btn:hover {
      background: #facc15;
    }

    .click-btn:active {
      transform: skewX(-10deg) translateY(4px);
      box-shadow: none;
    }

    .footer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">PORTAL HUB</div>
      <h1>${userId}</h1>
      <div class="user-badge">NODE_ID: ${userId}</div>
    </div>
    
    <p class="bio">
      "THIS IS YOUR PERSONALIZED SYSTEM PORTAL. USE THE AI CREATION LAB TO DESIGN DYNAMIC Retro GAMES, UTILITIES, OR SOUNDBOARDS AND DEPLOY THEM TO THIS EXACT PORTAL!"
    </p>

    <div class="game-box">
      <div class="score">TAP SCORE: <span id="scoreVal">0</span></div>
      <button class="click-btn" onclick="increaseScore()">TAP TO DRIFT</button>
    </div>

    <div class="footer">
      ixlv2.net // SECURE SYSTEM LINK ACTIVE
    </div>
  </div>

  <script>
    let score = 0;
    function increaseScore() {
      score++;
      document.getElementById('scoreVal').innerText = score;
      
      // Gentle web audio api synthesizer beep
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150 + (score * 10) % 400, ctx.currentTime);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch(e) {}
    }
  </script>
</body>
</html>`;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    audio.playWhoosh();
    
    try {
      if (deploymentTarget === 'user-page') {
        // Custom request tailored to user's page modification / deployment
        const userPrompt = `Create a fully customized personal user page specifically designed for the User ID "${activeDevId}".
        The user wants this page to display and do: "${prompt}".
        Requirements:
        - Must be a single self-contained HTML document (with all CSS and JavaScript inside).
        - Prominently feature a glowing neon theme representing User ID: "${activeDevId}".
        - Implement fully playable custom retro games, soundboards, trackers, widgets, or bio customizers based on what they want.
        - Ensure a high-contrast Brazilian Phonk styling with deep black, glowing neon green, yellow, and blue colors.
        - Must include beautiful modern fonts ("Space Grotesk" or similar) and custom styling.
        - Must have beautiful sound effects or background hums using the Web Audio API when buttons are tapped or games are played.
        - Return a JSON object with the fields "code" (the complete HTML code string) and "explanation" (summary of the layout and custom elements added).`;

        const gameData = await generateGameCode(userPrompt);
        
        // Save user page persistently
        localStorage.setItem(`phonk_user_page_${activeDevId}`, gameData.code);
        setUserPageCode(gameData.code);
        setResult(gameData);
        setActiveTab('user-page'); // Auto switch to their personal page to see the deployment!
        audio.playSuccess();
      } else {
        // Standard standalone game sandbox generation
        const gameData = await generateGameCode(prompt + " - ensure the game has a Brazilian Phonk neon aesthetic (green, yellow, blue accents, dark mode).");
        setResult(gameData);
        setActiveTab('workshop');
        audio.playSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'PRODUCTION ERROR. PLEASE TRY AGAIN.');
      audio.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefault = () => {
    const defaultCode = getDefaultUserPageCode(activeDevId);
    localStorage.setItem(`phonk_user_page_${activeDevId}`, defaultCode);
    setUserPageCode(defaultCode);
    audio.playWhoosh();
  };

  const templates = [
    "NEON FLAPPY DRIFT CAR",
    "CUSTOM SOUNDBOARD WITH PHONK BEAT GENERATOR",
    "RETRO TETRIS WITH A BIO SECTION AND TECH STATS CARD",
    "YELLOW MATRIX COMBAT ARENA",
    "RGB SOUND VISUALIZER CLOCK"
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Visual Header */}
      <div className="mb-10 text-center">
        <h2 className="text-5xl md:text-6xl font-black italic mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-yellow-400 to-blue-500 uppercase tracking-tighter phonk-text">
          CREATOR LABORATORIES
        </h2>
        <p className="text-gray-400 text-sm font-black italic uppercase max-w-2xl mx-auto tracking-wider">
          Node Operator Uplink // Active Credentials ID: <span className="text-yellow-400 text-base">{activeDevId}</span>
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => { setActiveTab('workshop'); audio.playWhoosh(); }}
          className={`px-6 py-3.5 font-black italic uppercase skew-x-[-10deg] border-2 transition-all flex items-center gap-2 ${
            activeTab === 'workshop' 
              ? 'bg-green-600 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
              : 'bg-black/40 border-green-500/20 text-gray-400 hover:text-white'
          }`}
        >
          ⚙ CREATION WORKSHOP
        </button>
        <button
          onClick={() => { setActiveTab('user-page'); audio.playWhoosh(); }}
          className={`px-6 py-3.5 font-black italic uppercase skew-x-[-10deg] border-2 transition-all flex items-center gap-2 ${
            activeTab === 'user-page' 
              ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
              : 'bg-black/40 border-yellow-500/20 text-gray-400 hover:text-white'
          }`}
        >
          🛸 MY USER PAGE ({activeDevId})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT FORM PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass p-8 rounded-sm border-2 border-green-500/20">
            <h3 className="text-xs font-black italic text-green-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span>●</span> COGNITIVE NEURAL ENGINE
            </h3>
            
            <label className="block text-[10px] font-black italic text-yellow-500 uppercase tracking-widest mb-3">
              DEPLOYMENT TARGET ENVIRONMENT
            </label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => { setDeploymentTarget('sandbox'); audio.playWhoosh(); }}
                className={`p-3 border-2 font-black italic text-[10px] uppercase skew-x-[-8deg] transition-all text-center leading-none ${
                  deploymentTarget === 'sandbox' 
                    ? 'bg-green-950/60 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                    : 'bg-black/30 border-white/5 text-gray-500 hover:border-white/10'
                }`}
              >
                STANDALONE PLAYGROUND
              </button>
              <button
                type="button"
                onClick={() => { setDeploymentTarget('user-page'); audio.playWhoosh(); }}
                className={`p-3 border-2 font-black italic text-[10px] uppercase skew-x-[-8deg] transition-all text-center leading-none ${
                  deploymentTarget === 'user-page' 
                    ? 'bg-yellow-950/60 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                    : 'bg-black/30 border-white/5 text-gray-500 hover:border-white/10'
                }`}
              >
                MY USER PAGE ({activeDevId})
              </button>
            </div>

            <label className="block text-[10px] font-black italic text-yellow-500 uppercase tracking-widest mb-3">
              {deploymentTarget === 'user-page' 
                ? `WHAT SHOULD WE PUT ON ${activeDevId}'S PAGE?` 
                : 'DESCRIBE THE NEON SANDBOX GAME'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={deploymentTarget === 'user-page' 
                ? "Enter your ideas for custom games, bio features, widgets, or tools to deploy on your page..." 
                : "Enter your custom game concept to test in the playground..."}
              className="w-full h-44 bg-black border-2 border-green-500/10 rounded-sm p-4 text-white font-bold italic focus:outline-none focus:border-green-500 transition-all resize-none mb-6 placeholder:text-gray-800 text-sm"
            />
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-5 bg-green-600 hover:bg-yellow-400 hover:text-black text-white font-black italic rounded-sm transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 skew-x-[-12deg]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  COMPILING SYSTEM PORTAL...
                </>
              ) : deploymentTarget === 'user-page' ? `DEPLOY TO USER PAGE [${activeDevId}]` : 'GENERATE STANDALONE GAME'}
            </button>

            {error && <p className="mt-6 text-red-500 text-xs font-black italic uppercase tracking-widest border border-red-500/30 bg-red-950/20 p-4">{error}</p>}
          </div>

          <div className="glass p-8 rounded-sm border-2 border-green-500/10">
            <h4 className="text-[10px] font-black text-gray-500 mb-5 flex items-center gap-2 uppercase tracking-widest italic">
              PORTAL TEMPLATES
            </h4>
            <div className="flex flex-col gap-2.5">
              {templates.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setPrompt(ex); audio.playWhoosh(); }}
                  className="text-left text-[10px] bg-white/5 hover:bg-green-950/30 text-gray-400 hover:text-green-400 px-4 py-3 rounded-sm border-2 border-white/5 hover:border-green-500/20 transition-all font-black italic uppercase leading-normal"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OUTPUT LIVE VIEW PANEL */}
        <div className="lg:col-span-7">
          {activeTab === 'workshop' ? (
            /* Standalone Workshop Sandbox */
            <div className="glass h-[680px] rounded-sm overflow-hidden border-2 border-green-500/20 relative flex flex-col">
              <div className="bg-green-950/40 px-8 py-4 border-b-2 border-green-500/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-green-400 italic uppercase tracking-[0.2em]">SANDBOX PREVIEW // PHONK STAGE</span>
                {result && (
                  <button 
                    onClick={() => { setResult(null); audio.playWhoosh(); }}
                    className="text-[10px] font-black italic text-gray-500 hover:text-yellow-400 transition-colors uppercase"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              
              <div className="flex-1 bg-black flex items-center justify-center relative">
                <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay z-10" 
                      style={{backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)', backgroundSize: '100% 4px'}}></div>
                {result ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={result.code}
                    className="w-full h-full border-none"
                    title="AI Generated Phonk Game"
                  />
                ) : (
                  <div className="text-center p-12">
                    <div className="w-24 h-24 bg-green-950/20 rounded-sm flex items-center justify-center mx-auto mb-8 border-2 border-green-500/20 skew-x-[-15deg]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                    </div>
                    <h3 className="text-green-500 font-black italic text-xl mb-4 uppercase tracking-tighter">WAITING FOR INSTRUCTIONS...</h3>
                    <p className="text-gray-600 text-xs font-bold italic uppercase max-w-xs mx-auto leading-tight">
                      Enter a custom idea to build and play your game directly on our neon canvas stage.
                    </p>
                  </div>
                )}
              </div>
              {result && (
                <div className="p-6 bg-black border-t-2 border-green-500/10">
                  <h4 className="text-[10px] font-black text-yellow-400 mb-2 italic uppercase tracking-widest">HOW TO PLAY Sandbox GAME</h4>
                  <p className="text-gray-400 text-xs font-bold italic uppercase">{result.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            /* Persistent User Page Tab */
            <div className="glass h-[680px] rounded-sm overflow-hidden border-2 border-yellow-500/20 relative flex flex-col animate-fadeIn">
              <div className="bg-yellow-950/40 px-8 py-4 border-b-2 border-yellow-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
                  <span className="text-[10px] font-black text-yellow-400 italic uppercase tracking-[0.2em]">LIVE USER PAGE : {activeDevId}</span>
                </div>
                <button 
                  onClick={handleResetDefault}
                  className="text-[10px] font-black italic text-red-500 hover:text-red-400 transition-colors uppercase border border-red-500/20 hover:border-red-500/50 px-3 py-1 bg-red-950/20"
                >
                  RESET PORTAL
                </button>
              </div>
              
              <div className="flex-1 bg-black flex items-center justify-center relative">
                <iframe
                  ref={userIframeRef}
                  srcDoc={userPageCode}
                  className="w-full h-full border-none"
                  title="User Profile Page Link"
                />
              </div>

              <div className="p-6 bg-black border-t-2 border-yellow-500/10 text-left">
                <h4 className="text-[10px] font-black text-yellow-400 mb-1 italic uppercase tracking-widest">USER PAGE DEPLOYMENT METRICS</h4>
                <p className="text-gray-500 text-[10px] font-bold italic uppercase leading-tight">
                  This custom dashboard is mapped to ID: <span className="text-white">{activeDevId}</span>. Switch to another Operator Node from credentials lock-screen to access other profile portals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
