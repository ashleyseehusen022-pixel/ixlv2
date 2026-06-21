
import React, { useState } from 'react';
import { Game } from '../types';
import { MOD_CONFIGS } from '../constants';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  isDevMode?: boolean;
  isPremium?: boolean;
  settings: {
    neonIntensity: number;
    [key: string]: any;
  };
  onSettingChange: (key: string, value: any) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, isDevMode, isPremium, settings, onSettingChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const gameMods = (MOD_CONFIGS[game.id] || []).filter(mod => !mod.devOnly || isDevMode);

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPremium && !isDevMode) {
      alert("UPGRADE REQUIRED: Settings & Hacks are exclusive to PLATINUM members.");
      return;
    }
    setShowSettings(!showSettings);
  };

  return (
    <div 
      className="group relative glass rounded-sm overflow-hidden transition-all hover:translate-y-[-4px] border-2 border-green-500/10 min-h-[380px] flex flex-col"
    >
      {/* Thumbnail Area */}
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700 grayscale-[0.5] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-yellow-400 text-black text-[9px] font-black italic px-3 py-1 uppercase tracking-widest skew-x-[-15deg] w-fit">
            {game.category}
          </span>
          <span className="bg-blue-600 text-white text-[7px] font-black italic px-2 py-0.5 uppercase tracking-widest skew-x-[-15deg] w-fit">
            STABLE_UPLINK
          </span>
        </div>

        {/* Settings Toggle Icon */}
        <button 
          onClick={toggleSettings}
          className={`absolute top-4 right-4 p-2 rounded-sm border-2 transition-all z-20 ${showSettings ? 'bg-red-600 border-red-400 text-white' : 'bg-black/60 border-white/20 text-gray-400 hover:border-green-500 hover:text-green-500'} ${!isPremium && !isDevMode ? 'opacity-50 grayscale' : ''}`}
        >
          {isPremium || isDevMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          )}
        </button>

        {/* Mod Panel Overlay */}
        <div className={`absolute inset-0 bg-black/95 p-6 transition-all duration-300 flex flex-col justify-center gap-2 z-10 ${showSettings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <h4 className="text-[10px] font-black text-red-500 italic uppercase tracking-[0.2em] mb-2">QUICK_TUNING</h4>
          
          <div className="space-y-4 overflow-y-auto pr-1 max-h-[80%] custom-scroll">
            {/* Standard Visual Hack */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[8px] font-black text-gray-500 uppercase italic">NEON_DRIFT</label>
                <span className="text-[8px] font-black text-green-500">{(settings.neonIntensity * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1"
                value={settings.neonIntensity}
                onChange={(e) => onSettingChange('neonIntensity', parseFloat(e.target.value))}
                className="w-full accent-green-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Dynamic Game Hacks */}
            {gameMods.map(mod => (
              <div key={mod.key}>
                {mod.type === 'range' ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-black text-gray-500 uppercase italic">{mod.label}</label>
                      <span className="text-[8px] font-black text-yellow-500">{settings[mod.key] ?? mod.min}</span>
                    </div>
                    <input 
                      type="range" 
                      min={mod.min} max={mod.max} step={mod.step}
                      value={settings[mod.key] ?? mod.min}
                      onChange={(e) => onSettingChange(mod.key, parseFloat(e.target.value))}
                      className="w-full accent-yellow-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                ) : mod.type === 'toggle' ? (
                  <button 
                    onClick={() => onSettingChange(mod.key, !settings[mod.key])}
                    className={`w-full py-2 px-3 border-2 transition-all flex justify-between items-center skew-x-[-10deg] ${settings[mod.key] ? 'border-red-500 bg-red-950/20 text-red-400' : 'border-white/10 bg-black text-gray-600'}`}
                  >
                    <span className="text-[9px] font-black italic uppercase">{mod.label}</span>
                    <div className={`w-2 h-2 rounded-full ${settings[mod.key] ? 'bg-red-500 animate-pulse' : 'bg-gray-800'}`}></div>
                  </button>
                ) : mod.type === 'select' ? (
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase italic">{mod.label}</label>
                    <div className="flex gap-1">
                      {mod.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => onSettingChange(mod.key, opt)}
                          className={`flex-1 py-1 text-[8px] font-black border uppercase italic transition-all ${settings[mod.key] === opt ? 'bg-green-600 border-green-400 text-white' : 'bg-black border-white/10 text-gray-600 hover:border-white/30'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            {/* Developer Only Setting */}
            {isDevMode && (
              <button 
                onClick={() => onSettingChange('infiniteJumps', !settings.infiniteJumps)}
                className={`w-full py-2 px-3 border-2 transition-all flex justify-between items-center skew-x-[-10deg] ${settings.infiniteJumps ? 'border-blue-500 bg-blue-950/20 text-blue-400' : 'border-white/10 bg-black text-gray-600'}`}
              >
                <span className="text-[9px] font-black italic uppercase">CORE_OVERRIDE</span>
                <div className={`w-2 h-2 rounded-full ${settings.infiniteJumps ? 'bg-blue-500 animate-ping' : 'bg-gray-800'}`}></div>
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowSettings(false)}
            className="mt-2 text-[8px] font-black text-gray-500 hover:text-white uppercase italic tracking-widest text-center"
          >
            [ CLOSE_CONFIG ]
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-black italic text-gray-100 mb-2 group-hover:text-green-400 transition-colors uppercase tracking-tighter">
          {game.title}
        </h3>
        <p className="text-[11px] font-bold italic text-gray-500 line-clamp-2 leading-tight mb-4 uppercase flex-1">
          {game.description}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
          {game.tags.map(tag => (
            <span key={tag} className="text-[9px] font-black italic text-green-500/60 uppercase tracking-widest">
              #{tag}
            </span>
          ))}
        </div>

        <button 
          onClick={() => onPlay(game)}
          className="w-full py-3 bg-green-600 hover:bg-yellow-400 text-white hover:text-black font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-2 group/btn"
        >
          <span>ENTER ARCADE</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover/btn:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/40 transition-colors pointer-events-none"></div>
    </div>
  );
};
