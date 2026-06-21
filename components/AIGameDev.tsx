
import React, { useState, useRef } from 'react';
import { generateGameCode } from '../services/geminiService';
import { AIGenResult } from '../types';

export const AIGameDev: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIGenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const gameData = await generateGameCode(prompt + " - ensure the game has a Brazilian Phonk neon aesthetic (green, yellow, blue accents, dark mode).");
      setResult(gameData);
    } catch (err: any) {
      setError(err.message || 'PRODUCTION ERROR. PLEASE TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    "NEON BRAZIL SNAKE",
    "PING PONG PHONK DRIFT",
    "YELLOW/GREEN BLOCK BREAKER",
    "SAO PAULO STREET RACER 2D",
    "TOXIC COLOR PUZZLE"
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black italic mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-yellow-400 to-blue-500 uppercase tracking-tighter phonk-text">
          AI CREATION WORKSHOP
        </h2>
        <p className="text-gray-400 text-lg font-bold italic uppercase max-w-2xl mx-auto leading-tight">
          DESCRIBE THE GAME. OUR AI WILL CODE AND RUN IT INSTANTLY IN PHONK STYLE.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Panel */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="glass p-8 rounded-sm border-2 border-green-500/20">
            <label className="block text-[10px] font-black italic text-yellow-500 uppercase tracking-widest mb-4">WHAT ARE WE BUILDING TODAY?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: A space shooter where I'm a drift car and enemies are neon cones..."
              className="w-full h-40 bg-black border-2 border-green-500/10 rounded-sm p-5 text-white font-bold italic focus:outline-none focus:border-green-500 transition-all resize-none mb-6 placeholder:text-gray-800"
            />
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-5 bg-green-600 hover:bg-yellow-400 hover:text-black text-white font-black italic rounded-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 skew-x-[-12deg]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  PROCESSING...
                </>
              ) : 'GENERATE BR CODE'}
            </button>

            {error && <p className="mt-6 text-red-500 text-xs font-black italic uppercase tracking-widest">{error}</p>}
          </div>

          <div className="glass p-8 rounded-sm border-2 border-green-500/10">
            <h4 className="text-[10px] font-black text-gray-500 mb-6 flex items-center gap-2 uppercase tracking-widest italic">
              QUICK TEMPLATES
            </h4>
            <div className="flex flex-wrap gap-3">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-[10px] bg-white/5 hover:bg-green-600 text-gray-500 hover:text-white px-4 py-2 rounded-sm border-2 border-white/5 transition-all font-black italic uppercase"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <div className="glass h-[650px] rounded-sm overflow-hidden border-2 border-green-500/20 relative flex flex-col">
            <div className="bg-green-950/40 px-8 py-4 border-b-2 border-green-500/10 flex items-center justify-between">
              <span className="text-[10px] font-black text-green-400 italic uppercase tracking-[0.2em]">LIVE PREVIEW - PHONK ENGINE</span>
              {result && (
                <button 
                  onClick={() => setResult(null)}
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
                  <h3 className="text-green-500 font-black italic text-xl mb-4 uppercase tracking-tighter">WAITING FOR COMMAND...</h3>
                  <p className="text-gray-600 text-xs font-bold italic uppercase max-w-xs mx-auto leading-tight">
                    YOUR GAME CODE WILL BE RENDERIZED HERE WITH NATIVE PHONK STYLE.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {result && (
            <div className="mt-6 glass p-6 rounded-sm border-2 border-yellow-500/20">
              <h4 className="text-[10px] font-black text-yellow-400 mb-2 italic uppercase tracking-widest">HOW TO PLAY</h4>
              <p className="text-gray-400 text-sm font-bold italic uppercase">{result.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
