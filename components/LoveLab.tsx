
import React, { useState, useEffect } from 'react';

export const LoveLab: React.FC = () => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ score: number; label: string; color: string } | null>(null);

  const calculateCompatibility = (n1: string, n2: string) => {
    const name1Clean = n1.toLowerCase().trim();
    const name2Clean = n2.toLowerCase().trim();

    const isSpecialCouple = 
      ((name1Clean === 'jaxyn' && name2Clean === 'bella') || (name1Clean === 'bella' && name2Clean === 'jaxyn')) ||
      ((name1Clean === 'jaxyn' && name2Clean === 'amelia') || (name1Clean === 'amelia' && name2Clean === 'jaxyn')) ||
      ((name1Clean === 'eleanor' && name2Clean === 'quinton') || (name1Clean === 'quinton' && name2Clean === 'eleanor'));

    if (isSpecialCouple) {
      return { score: 100, label: 'NEON SOULMATES', color: 'text-pink-500' };
    }

    // Deterministic Hashing for "Accuracy"
    const combined = [name1Clean, name2Clean].sort().join('');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    
    // Convert hash to 0-100 score
    const score = Math.abs(hash % 101);
    
    let label = '';
    let color = '';
    
    if (score > 90) { 
      label = 'NEON SOULMATES'; 
      color = 'text-pink-500'; 
    } else if (score > 75) { 
      label = 'SYSTEM OVERDRIVE'; 
      color = 'text-green-400'; 
    } else if (score > 50) { 
      label = 'STABLE UPLINK'; 
      color = 'text-blue-400'; 
    } else if (score > 25) { 
      label = 'GLITCH ATTRACTION'; 
      color = 'text-yellow-400'; 
    } else { 
      label = 'TOTAL SYSTEM REJECTION'; 
      color = 'text-red-500'; 
    }

    return { score, label, color };
  };

  const handleScan = () => {
    if (!name1 || !name2) return;
    setIsScanning(true);
    setResult(null);
    
    // Mocking a "Deep Scan" process
    setTimeout(() => {
      const data = calculateCompatibility(name1, name2);
      setResult(data);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fadeIn">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-black italic mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 uppercase tracking-tighter phonk-text">
          LOVE LAB 2.0
        </h2>
        <p className="text-gray-500 text-xs font-black italic uppercase tracking-[0.3em]">
          QUANTUM COMPATIBILITY SCANNER // ACCURACY VERIFIED
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Input Interface */}
        <div className="glass p-10 border-2 border-pink-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black italic text-pink-500 uppercase tracking-widest mb-2">SUBJECT A [INITIATOR]</label>
              <input 
                type="text" 
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="ENTER NAME..." 
                className="w-full bg-black border-2 border-pink-500/10 p-4 text-white font-black italic uppercase outline-none focus:border-pink-500 transition-all"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 border-2 border-pink-500/20 rounded-full flex items-center justify-center text-pink-500 animate-pulse">
                +
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black italic text-pink-500 uppercase tracking-widest mb-2">SUBJECT B [TARGET]</label>
              <input 
                type="text" 
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="ENTER NAME..." 
                className="w-full bg-black border-2 border-pink-500/10 p-4 text-white font-black italic uppercase outline-none focus:border-pink-500 transition-all"
              />
            </div>

            <button 
              onClick={handleScan}
              disabled={isScanning || !name1 || !name2}
              className="w-full py-5 bg-pink-600 hover:bg-white hover:text-pink-600 text-white font-black italic uppercase skew-x-[-12deg] transition-all disabled:opacity-50 relative group overflow-hidden"
            >
              <span className="relative z-10">{isScanning ? 'SCANNING DATA...' : 'INITIALIZE HEART-SCAN'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </div>
        </div>

        {/* Result Visualization */}
        <div className="glass h-[450px] border-2 border-green-500/10 flex flex-col items-center justify-center relative overflow-hidden">
          {isScanning ? (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-pink-500 animate-pulse uppercase">PROCESSING QUANTUM FLUX...</p>
                <div className="w-48 h-1 bg-white/5 mx-auto">
                   <div className="h-full bg-pink-500 animate-[loading_2s_ease-in-out]"></div>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="text-center animate-scaleIn">
              <div className="mb-4">
                <span className={`text-8xl font-black italic phonk-text ${result.color}`}>
                  {result.score}%
                </span>
              </div>
              <h3 className={`text-2xl font-black italic uppercase tracking-tighter mb-8 ${result.color}`}>
                {result.label}
              </h3>
              <div className="bg-white/5 p-4 border border-white/10 skew-x-[-10deg]">
                <p className="text-[10px] font-bold text-gray-400 italic uppercase max-w-xs leading-relaxed">
                  ACCURACY VERIFIED VIA ENCRYPTED PHONK ALGORITHMS. COMPATIBILITY RATING IS FINAL.
                </p>
              </div>
              <button 
                onClick={() => { setName1(''); setName2(''); setResult(null); }}
                className="mt-8 text-[9px] font-black text-gray-500 hover:text-white uppercase transition-colors italic tracking-widest"
              >
                [ RESET SCANNER ]
              </button>
            </div>
          ) : (
            <div className="text-center p-12 opacity-20 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-6 text-pink-500 group-hover:scale-110 transition-transform">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              <h3 className="text-sm font-black italic text-white uppercase mb-2">SCANNER OFFLINE</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase">WAITING FOR BIOMETRIC INPUTS...</p>
            </div>
          )}
          
          {/* Decorative scanline for the result box */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
