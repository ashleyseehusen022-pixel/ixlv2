
import React, { useState } from 'react';

interface PremiumModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 border-2 border-yellow-500/40 relative animate-fadeIn shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-sm flex items-center justify-center mx-auto mb-6 skew-x-[-12deg] shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            <span className="text-black font-black text-2xl">P</span>
          </div>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter phonk-text">PLATINUM_UPLINK</h2>
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">Unlock Unlimited Power</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 skew-x-[-10deg]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-black italic text-gray-300 uppercase">TURBO PERFORMANCE MODE</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 skew-x-[-10deg]">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs font-black italic text-gray-300 uppercase">UNLOCKED SETTINGS & HACKS</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 skew-x-[-10deg]">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-black italic text-gray-300 uppercase">EXCLUSIVE_PLATINUM_BADGE</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border-2 border-dashed border-yellow-500/30 p-6 text-center">
              <span className="text-sm font-black text-gray-500 uppercase italic">ONE-TIME ACCESS FEE</span>
              <div className="text-4xl font-black text-yellow-500 italic">$10.00</div>
              <p className="text-[8px] font-bold text-gray-600 uppercase mt-2">SECURE TRANSACTIONS // PHONK ENCRYPTED</p>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            >
              INITIALIZE_PURCHASE
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase italic">PAYMENT_SOURCE [MOCKED]</label>
              <div className="p-4 bg-black border-2 border-white/10 text-white font-mono text-xs italic tracking-widest flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                **** **** **** 2024
              </div>
            </div>

            <div className="p-4 border border-red-500/20 bg-red-500/5 text-center">
              <p className="text-[9px] font-black text-red-500 uppercase italic">Proceeding will transfer 10.00 Credits to PHONK_SYSTEMS_DEV_TEAM</p>
            </div>

            {isProcessing ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
                <span className="text-[10px] font-black italic text-yellow-500 uppercase animate-pulse">CRYPTOGRAPHIC_HANDSHAKE_IN_PROGRESS...</span>
              </div>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-white/10 text-gray-500 font-black italic uppercase skew-x-[-12deg] hover:border-white hover:text-white"
                >
                  ABORT
                </button>
                <button 
                  onClick={handlePayment}
                  className="flex-[2] py-4 bg-green-600 text-white font-black italic uppercase skew-x-[-12deg] hover:bg-yellow-400 hover:text-black transition-all"
                >
                  CONFIRM_UPLINK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
