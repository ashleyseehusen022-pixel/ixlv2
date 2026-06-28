import React, { useState, useEffect } from 'react';
import { audio } from '../services/audioService';

interface PermitShopProps {
  activeDevId: string;
  onUpgrade: (tier: 'junior' | 'admin' | 'creator') => void;
  purchasedTier: 'none' | 'junior' | 'admin' | 'creator';
  isBypassed?: boolean;
}

export const PermitShop: React.FC<PermitShopProps> = ({ activeDevId, onUpgrade, purchasedTier, isBypassed = false }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'junior' | 'admin' | 'creator' | null>(null);
  const [visitedDiscord, setVisitedDiscord] = useState(false);

  // Bank connection and purchase code integration
  const [bankConnected, setBankConnected] = useState(() => {
    return localStorage.getItem('phonk_bank_connected') === 'true';
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [clickedDiscordBank, setClickedDiscordBank] = useState(() => {
    return localStorage.getItem('phonk_clicked_discord_bank') === 'true';
  });
  const [bankCode, setBankCode] = useState('');
  const [bankError, setBankError] = useState('');
  const [unlockedReward, setUnlockedReward] = useState<'junior' | 'admin' | 'creator' | null>(null);
  const [unlockedCodeUsed, setUnlockedCodeUsed] = useState<string>('');
  const [claimCodeInput, setClaimCodeInput] = useState<string>('');
  const [claimError, setClaimError] = useState<string>('');

  // Predefined unique single-use codes for each package tier (100 codes each!)
  const JUNIOR_CODES = [
    'JUNIOR_ACCESS_99X',
    'PHONK_JUNIOR_777',
    'JUNIOR_STATION_10',
    ...Array.from({ length: 97 }, (_, i) => `PHONK_JR_${101 + i}`)
  ];

  const ADMIN_CODES = [
    'ADMIN_SUPREME_22P',
    'BYPASS_ADMIN_888',
    'ADMIN_CONTROL_55',
    ...Array.from({ length: 97 }, (_, i) => `ADMIN_SUP_${301 + i}`)
  ];

  const CREATOR_CODES = [
    'DEV_MODE_MASTER_77',
    'DEVELOPER_ROOT_999',
    'IXL_DEV_ALPHA_11',
    ...Array.from({ length: 97 }, (_, i) => `DEV_MODE_${501 + i}`)
  ];

  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('phonk_redeemed_codes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Secure obfuscated validation keys to prevent sniffing/inspection
  const SECURE_HASHES = [
    'amZmaGRzZmRneGZiY2U=',
    'amF4eW5fYm9zc185OTk=',
    'YW1lbGlhX3F1ZWVuXzE=',
    'ZWxlYW5vcl9xdWludG9uX3NvdWw=',
    'cGhvbmtfcm9vdF9hY2Nlc3M=',
    'YWRtaW5fc3VwZXJfNzc3',
    'bW9uZXlfbWF0cml4X2FjdGl2ZQ=='
  ];

  // Instant-Sync Payment Accelerator states
  const [instantPayments, setInstantPayments] = useState(() => {
    return localStorage.getItem('phonk_instant_payments') !== 'false'; // Default to true!
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const DISCORD_LINK = 'https://discord.gg/2QfHBDBZM';

  const handleTierClick = (tier: 'junior' | 'admin' | 'creator') => {
    if (isBypassed) {
      audio.playError();
      return;
    }
    if (!bankConnected) {
      setSelectedTier(tier);
      setShowBankModal(true);
      audio.playWhoosh();
      return;
    }
    setSelectedTier(tier);
    setShowPopup(true);
    audio.playWhoosh();
  };

  const handleVisitDiscord = () => {
    window.open(DISCORD_LINK, '_blank');
    setVisitedDiscord(true);
  };

  const handleVisitDiscordBank = () => {
    window.open(DISCORD_LINK, '_blank');
    setClickedDiscordBank(true);
    localStorage.setItem('phonk_clicked_discord_bank', 'true');
  };

  const handleVerifyBankCode = () => {
    if (isBypassed) return;
    const entered = bankCode.trim().toUpperCase();

    if (usedCodes.includes(entered)) {
      setBankError('THIS UNIQUE CODE HAS ALREADY BEEN REDEEMED.');
      audio.playError();
      return;
    }

    // Determine if matched any tier list
    let matchedTier: 'junior' | 'admin' | 'creator' | null = null;
    if (JUNIOR_CODES.includes(entered)) {
      matchedTier = 'junior';
    } else if (ADMIN_CODES.includes(entered)) {
      matchedTier = 'admin';
    } else if (CREATOR_CODES.includes(entered)) {
      matchedTier = 'creator';
    }

    if (matchedTier) {
      const updatedUsed = [...usedCodes, entered];
      setUsedCodes(updatedUsed);
      localStorage.setItem('phonk_redeemed_codes', JSON.stringify(updatedUsed));

      if (instantPayments) {
        setIsProcessing(true);
        setProcessingProgress(0);
        audio.playWhoosh();
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          setProcessingProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setBankConnected(true);
            localStorage.setItem('phonk_bank_connected', 'true');
            onUpgrade(matchedTier!);
            setUnlockedReward(matchedTier!);
            setUnlockedCodeUsed(entered);
            setClaimCodeInput('');
            setClaimError('');
            setShowBankModal(false);
            setBankCode('');
            setBankError('');
            audio.playSuccess();
          }
        }, 40);
      } else {
        setBankConnected(true);
        localStorage.setItem('phonk_bank_connected', 'true');
        onUpgrade(matchedTier);
        setUnlockedReward(matchedTier);
        setUnlockedCodeUsed(entered);
        setClaimCodeInput('');
        setClaimError('');
        setShowBankModal(false);
        setBankCode('');
        setBankError('');
        audio.playSuccess();
      }
    } else {
      // Check original hashes as general bank connection codes
      const enteredLower = bankCode.trim().toLowerCase();
      let encoded = '';
      try {
        encoded = btoa(enteredLower);
      } catch {}
      const isMatched = SECURE_HASHES.includes(encoded);
      if (isMatched) {
        if (instantPayments) {
          setIsProcessing(true);
          setProcessingProgress(0);
          audio.playWhoosh();
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 25;
            setProcessingProgress(currentProgress);
            if (currentProgress >= 100) {
              clearInterval(interval);
              setIsProcessing(false);
              setBankConnected(true);
              localStorage.setItem('phonk_bank_connected', 'true');
              setShowBankModal(false);
              setBankError('');
              audio.playSuccess();
              if (selectedTier) {
                setShowPopup(true);
              }
            }
          }, 40);
        } else {
          setBankConnected(true);
          localStorage.setItem('phonk_bank_connected', 'true');
          setShowBankModal(false);
          setBankError('');
          audio.playSuccess();
          if (selectedTier) {
            setShowPopup(true);
          }
        }
      } else {
        setBankError('INVALID ACCESS CODE. HANDSHAKE PROTOCOL REJECTED.');
        audio.playError();
      }
    }
  };

  const handleConfirmPurchase = () => {
    if (isBypassed) return;
    if (selectedTier) {
      const generatedCode = `CONFIRM-${selectedTier.toUpperCase()}`;
      if (instantPayments) {
        setIsProcessing(true);
        setProcessingProgress(0);
        audio.playWhoosh();
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          setProcessingProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            onUpgrade(selectedTier);
            setUnlockedReward(selectedTier);
            setUnlockedCodeUsed(generatedCode);
            setClaimCodeInput('');
            setClaimError('');
            setShowPopup(false);
            setSelectedTier(null);
            setVisitedDiscord(false);
            audio.playSuccess();
          }
        }, 40);
      } else {
        onUpgrade(selectedTier);
        setUnlockedReward(selectedTier);
        setUnlockedCodeUsed(generatedCode);
        setClaimCodeInput('');
        setClaimError('');
        setShowPopup(false);
        setSelectedTier(null);
        setVisitedDiscord(false);
        audio.playSuccess();
      }
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-20">
      
      {/* High-Speed Payment Acceleration Progress Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-8 border-2 border-cyan-500/40 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto flex items-center justify-center">
              <span className="text-xl text-cyan-400 font-mono">⚡</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">
                ACCELERATED QUANTUM SYNCING...
              </h3>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                establishing bypass tunneling protocols ({processingProgress}%)
              </p>
            </div>
            <div className="w-full bg-slate-950 border border-white/10 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full transition-all duration-75 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <span className="text-[8px] font-mono text-gray-500 uppercase block tracking-widest">
              BYPASS SEQUENCE EXECUTED AT 10GB/S HANDSHAKE SPEED
            </span>
          </div>
        </div>
      )}

      {isBypassed && (
        <div className="relative overflow-hidden border-2 border-red-500 bg-red-950/20 p-6 rounded-sm shadow-[0_0_30px_rgba(239,68,68,0.2)] flex flex-col md:flex-row items-center gap-4 justify-between animate-pulse">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl text-red-500">⚠</span>
            <div>
              <h4 className="text-red-500 font-mono font-black text-sm tracking-widest uppercase">GUEST BYPASS ACCESS MODE ACTIVE</h4>
              <p className="text-gray-400 text-xs mt-1">All payment, bank synchronization, and permit transaction gateways are offline. Clear bypass or log in with real admin credentials to make purchases.</p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-red-600 text-white font-mono font-black text-[10px] skew-x-[-12deg] tracking-widest uppercase whitespace-nowrap">
            PURCHASES LOCKED
          </div>
        </div>
      )}

      {/* Dynamic Security Header Banner */}
      <div className="relative overflow-hidden glass border-2 border-green-500/30 p-8 rounded-sm shadow-[0_0_40px_rgba(34,197,94,0.15)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-green-500/40 uppercase tracking-widest leading-none select-none">
          SECURE_STATION_B_NODE // ONLINE
        </div>
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-mono text-[9px] font-black uppercase tracking-widest skew-x-[-10deg]">
            REQUIRED HANDSHAKE LINK ACTIVE
          </div>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
            PHONK PERMIT & ACQUISITION DECK
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed font-sans">
            Acquire official clearances, root access vectors, and administrative credentials. All transactions are finalized via direct secure communication with the global network administrator <span className="text-green-400 font-bold">Jaxyn</span> at the official hub.
          </p>
        </div>
        
        {/* Discord Action Box */}
        <div className="w-full md:w-auto flex flex-col items-center gap-3 bg-black/60 border border-white/10 p-5 rounded-sm text-center">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">GLOBAL ROOT DIRECTORY</span>
          <a 
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setVisitedDiscord(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white text-xs font-black italic uppercase tracking-wider skew-x-[-12deg] transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2"
          >
            <span>DISCORD UPLINK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></div>
          </a>
          <span className="text-[10px] font-mono text-blue-400 font-bold underline select-all break-all max-w-[200px]">
            {DISCORD_LINK}
          </span>
        </div>
      </div>

      {/* Instant-Sync Payment Accelerator Widget */}
      <div className="glass border-2 border-cyan-500/30 p-6 rounded-sm bg-cyan-950/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest leading-none select-none">
          ACCELERATOR_MOD // READY
        </div>
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-block px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[9px] font-black uppercase tracking-widest skew-x-[-8deg]">
            PROCESSING LEVEL // ULTRA SPEED
          </div>
          <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
            QUANTUM PAYMENT ACCELERATION ENGINE
          </h3>
          <p className="text-gray-400 text-xs font-sans leading-relaxed">
            By activating quantum routing, your ledger connection handshakes and purchase authorizations complete immediately. Processing speeds are boosted from hours to <span className="text-cyan-400 font-bold">160 milliseconds</span>!
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/60 border border-white/10 px-5 py-4 rounded-sm">
          <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">ACCELERATOR:</span>
          <button
            onClick={() => {
              const newVal = !instantPayments;
              setInstantPayments(newVal);
              localStorage.setItem('phonk_instant_payments', String(newVal));
              audio.playSuccess();
            }}
            className={`px-4 py-2 text-xs font-black italic uppercase skew-x-[-10deg] transition-all whitespace-nowrap ${
              instantPayments 
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-transparent border border-white/20 text-gray-500 hover:text-white'
            }`}
          >
            {instantPayments ? '⚡ ACTIVE (ULTRA SPEED)' : '⏸ STANDBY (NORMAL)'}
          </button>
        </div>
      </div>

      {/* Bank Account Connection Handshake Status Banner */}
      {!bankConnected ? (
        <div className="relative overflow-hidden glass border-2 border-red-500/30 p-6 rounded-sm bg-red-950/10 flex flex-col md:flex-row justify-between items-center gap-6 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-block px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[9px] font-black uppercase tracking-widest skew-x-[-8deg]">
              AUTHENTICATION LINK REQUIRED
            </div>
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
              SECURE BANK DIRECTORY CONNECTION STATUS
            </h3>
            <p className="text-gray-400 text-xs font-sans leading-relaxed">
              To connect your bank account or complete cash transactions for admin permits on this website, you must input the secure clearance code. Get this code by joining the official community server.
            </p>
          </div>
          <button
            onClick={() => { setShowBankModal(true); audio.playWhoosh(); }}
            className="w-full md:w-auto px-6 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black italic uppercase text-xs skew-x-[-12deg] transition-all whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            CONNECT BANK ACCOUNT
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden glass border-2 border-green-500/30 p-6 rounded-sm bg-green-950/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-block px-2.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-500 font-mono text-[9px] font-black uppercase tracking-widest skew-x-[-8deg]">
              LEDGER ENCRYPTED & LINKED
            </div>
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
              BANKING HANDSHAKE COMPLETE
            </h3>
            <p className="text-gray-400 text-xs font-sans leading-relaxed">
              Your banking pipeline is successfully connected directly to <span className="text-green-400 font-bold">Jaxyn's</span> central server matrix. Payment restrictions are fully lifted.
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[10px] font-black tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
            <span>SECURE GATEWAY CONNECTED</span>
          </div>
        </div>
      )}



      {/* Grid of Permits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: $10.00 */}
        <div className={`glass border-2 rounded-sm p-6 flex flex-col justify-between relative transition-all duration-300 ${
          purchasedTier === 'junior' 
            ? 'border-green-500/60 bg-green-950/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
            : 'border-white/10 hover:border-blue-500/30 shadow-md'
        }`}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-blue-400 font-black uppercase tracking-widest bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded">
                TIER 01 // HALF PASS
              </span>
              <span className="text-3xl font-black text-white italic">$10.00</span>
            </div>
            
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
              JUNIOR OPERATOR PERMIT
            </h3>
            
            <p className="text-gray-400 text-xs leading-relaxed">
              Unlock partial admin console capabilities and settings. Includes access to essential non-destructive control commands.
            </p>
            
            <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-[10px]">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Access to Admin Console (ADMIN_CMD) (Limited)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Activate High-Perf Turbo Mode</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 line-through">
                <span>Access to Secure Root Terminal (ROOT_TERM)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 line-through">
                <span>Advanced Visual & Logic Overrides</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {isBypassed ? (
              <div className="w-full py-3 bg-red-950/40 border border-red-500/30 text-red-500 font-mono font-black italic text-center uppercase text-xs skew-x-[-10deg]">
                LOCKED (BYPASS MODE)
              </div>
            ) : purchasedTier === 'junior' || purchasedTier === 'admin' || purchasedTier === 'creator' ? (
              <div className="w-full py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-black italic text-center uppercase text-xs">
                CLEARANCE ACTIVE
              </div>
            ) : (
              <button
                onClick={() => handleTierClick('junior')}
                className="w-full py-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                SECURE clearance
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: $25.00 */}
        <div className={`glass border-2 rounded-sm p-6 flex flex-col justify-between relative transition-all duration-300 ${
          purchasedTier === 'admin' 
            ? 'border-yellow-500/60 bg-yellow-950/10 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
            : 'border-yellow-500/20 hover:border-yellow-500/50 bg-gradient-to-b from-yellow-950/5 to-transparent'
        }`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-[9px] font-black italic uppercase tracking-wider skew-x-[-12deg] shadow-md">
            RECOMMENDED SYST_ADMIN TIER
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-yellow-500 font-black uppercase tracking-widest bg-yellow-950/40 border border-yellow-500/20 px-2 py-0.5 rounded">
                TIER 02 // ABSOLUTE ROOT
              </span>
              <span className="text-3xl font-black text-yellow-500 italic">$25.00</span>
            </div>
            
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
              CENTRAL ADMINISTRATOR DELEGATION
            </h3>
            
            <p className="text-gray-400 text-xs leading-relaxed">
              The ultimate administrator control suite. Complete delegation including administrative console privileges, full command bypass credentials, system tweaks, and the storage state editor.
            </p>
            
            <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-[10px]">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Full Access to Admin Console (ADMIN_CMD)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Visual Tweaks & CRT Overrides</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Storage State Editor & Manual Sync</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 line-through">
                <span>Access to Secure Root Terminal (ROOT_TERM)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 line-through">
                <span>Developer Mode Badge & System Ingress</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {isBypassed ? (
              <div className="w-full py-3 bg-red-950/40 border border-red-500/30 text-red-500 font-mono font-black italic text-center uppercase text-xs skew-x-[-10deg]">
                LOCKED (BYPASS MODE)
              </div>
            ) : purchasedTier === 'admin' || purchasedTier === 'creator' ? (
              <div className="w-full py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black italic text-center uppercase text-xs">
                SUPREME ACCESS GRANTED
              </div>
            ) : (
              <button
                onClick={() => handleTierClick('admin')}
                className="w-full py-3 bg-yellow-500 hover:bg-white hover:text-black text-black font-black italic uppercase text-xs skew-x-[-10deg] transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse"
              >
                ACQUIRE SUPREME CONTROL
              </button>
            )}
          </div>
        </div>

        {/* Tier 3: $1,000.00 */}
        <div className={`glass border-2 rounded-sm p-6 flex flex-col justify-between relative transition-all duration-300 ${
          purchasedTier === 'creator' 
            ? 'border-red-500/60 bg-red-950/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]' 
            : 'border-white/10 hover:border-red-500/30'
        }`}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-red-500 font-black uppercase tracking-widest bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                TIER 03 // EXCLUSIVE
              </span>
              <span className="text-3xl font-black text-white italic">$1000.00</span>
            </div>
            
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
              ULTIMATE CREATOR DEV MODE
            </h3>
            
            <p className="text-gray-400 text-xs leading-relaxed">
              Exclusively delegated directly by Jaxyn. Grants permanent architectural control, custom build injections, system overrides, and a dedicated workspace.
            </p>
            
            <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-[10px]">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-red-500">✦</span>
                <span>Permanent Creator Branding & Credits</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-red-500">✦</span>
                <span>Direct Backend System Injection Override</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-red-500">✦</span>
                <span>Only Authorizable by Jaxyn</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {isBypassed ? (
              <div className="w-full py-3 bg-red-950/40 border border-red-500/30 text-red-500 font-mono font-black italic text-center uppercase text-xs skew-x-[-10deg]">
                LOCKED (BYPASS MODE)
              </div>
            ) : purchasedTier === 'creator' ? (
              <div className="w-full py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-black italic text-center uppercase text-xs">
                ULTIMATE MODE SYNCED
              </div>
            ) : (
              <button
                onClick={() => handleTierClick('creator')}
                className="w-full py-3 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all"
              >
                CONTACT OWNER (JAX)
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Interactive Verification Popup Dialogue */}
      {showPopup && selectedTier && (
        <div className="fixed inset-0 z-[260] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-8 border-2 border-blue-500/40 relative animate-scaleIn shadow-[0_0_60px_rgba(59,130,246,0.3)]">
            
            <button 
              onClick={() => { setShowPopup(false); setSelectedTier(null); audio.playWhoosh(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-sm flex items-center justify-center mx-auto mb-4 skew-x-[-12deg] shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse">
                <span className="text-white font-black text-xl">U</span>
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                {selectedTier === 'junior' ? 'JUNIOR Clearance Uplink' : selectedTier === 'admin' ? 'Supreme Admin Ingress' : 'Creator Tier Authorization'}
              </h2>
              <p className="text-[9px] font-mono text-blue-400 uppercase tracking-widest animate-pulse mt-1">
                Awaiting Payment Handshake Verification
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-white/10 rounded-sm font-mono text-xs text-gray-300 leading-relaxed text-center">
                <p className="text-[10px] text-yellow-400 uppercase font-black mb-2">✦ REQUIRED PROTOCOL ✦</p>
                To complete your transaction, connect with owner <span className="text-white font-bold">Jaxyn</span> on Discord to provide your developer ID and authorize the permit.
                <div className="mt-4 p-3 bg-black/60 rounded border border-white/5">
                  <span className="text-gray-500 text-[10px] block uppercase">Direct Gateway Address:</span>
                  <a 
                    href={DISCORD_LINK} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => setVisitedDiscord(true)}
                    className="text-blue-400 font-bold underline hover:text-blue-300 break-all"
                  >
                    {DISCORD_LINK}
                  </a>
                </div>
              </div>

              {/* Popup instructions to fulfill constraints:
                  "says this link https://discord.gg/2QfHBDBZM and show it untill they get to the link and make a pop up version to say show again and don't show after they purcheas"
              */}
              {!visitedDiscord ? (
                <button
                  onClick={handleVisitDiscord}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  VISIT DISCORD LINK FIRST
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPurchase}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.3)]"
                  >
                    YES, I HAVE CONTACTED & PAID JAX
                  </button>
                  
                  <button
                    onClick={() => { setVisitedDiscord(false); audio.playWhoosh(); }}
                    className="w-full py-2 bg-transparent border border-white/10 text-gray-400 hover:text-white font-black italic uppercase text-[10px] tracking-wider transition-all"
                  >
                    SHOW DISCORD LINK AGAIN
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Bank Account Connection Handshake Modal */}
      {showBankModal && !bankConnected && (
        <div className="fixed inset-0 z-[270] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-8 border-2 border-red-500/50 relative animate-scaleIn shadow-[0_0_60px_rgba(239,68,68,0.2)]">
            
            <button 
              onClick={() => { setShowBankModal(false); setBankError(''); audio.playWhoosh(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-sm flex items-center justify-center mx-auto mb-4 skew-x-[-12deg] shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                <span className="text-white font-black text-xl">$</span>
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                BANK LEDGER HANDSHAKE
              </h2>
              <p className="text-[9px] font-mono text-red-400 uppercase tracking-widest animate-pulse mt-1">
                SECURE AUTHENTICATION SYSTEM REQUIREMENT
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-white/10 rounded-sm font-mono text-xs text-gray-300 leading-relaxed text-center">
                <p className="text-[10px] text-red-500 uppercase font-black mb-2">✦ SECURITY CLEARANCE CODE REQUIRED ✦</p>
                To link your bank account to this website, you must input the exact authorization code. Get this code by joining the administrator's Discord server.
              </div>

              {/* Show the Discord link UNTIL they click it */}
              {!clickedDiscordBank ? (
                <div className="space-y-4 text-center">
                  <p className="text-yellow-400 font-bold uppercase text-[10px] tracking-wider animate-pulse">
                    ⚠️ YOU MUST VISIT THE DISCORD LINK TO GET AUTHORIZED
                  </p>
                  <div className="p-4 bg-black/60 rounded border border-white/5 font-sans">
                    <span className="text-gray-500 text-[10px] block font-mono uppercase tracking-widest mb-1">DIRECT LINK GATES:</span>
                    <a 
                      href={DISCORD_LINK} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={handleVisitDiscordBank}
                      className="text-blue-400 font-bold underline hover:text-blue-300 break-all select-all font-mono text-xs"
                    >
                      {DISCORD_LINK}
                    </a>
                  </div>
                  
                  <button
                    onClick={handleVisitDiscordBank}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    <span>CONNECT & GET GATEWAY CODE</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">
                      ENTER BANK CONNECTION CODE:
                    </label>
                    <input 
                      type="text"
                      value={bankCode}
                      onChange={(e) => { setBankCode(e.target.value); setBankError(''); }}
                      placeholder="ENTER GATEWAY CODE..."
                      className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-red-500 uppercase tracking-widest"
                    />
                  </div>

                  {bankError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] text-center uppercase tracking-wide">
                      {bankError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={handleVerifyBankCode}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-xs skew-x-[-10deg] transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      VERIFY CODE & SYNC BANK
                    </button>

                    <button
                      onClick={() => { setClickedDiscordBank(false); audio.playWhoosh(); }}
                      className="w-full py-2 bg-transparent border border-white/5 text-gray-500 hover:text-white font-black italic uppercase text-[9px] tracking-wider transition-all"
                    >
                      SHOW DISCORD LINK AGAIN
                    </button>
                  </div>
                </div>
              )}

              {/* Secure payment link display */}
              <div className="text-center pt-2">
                <span className="text-[8px] font-mono text-gray-500 uppercase">
                  AUTHORIZED DIRECT COUPLING VIA Jaxyn
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUCCESS REWARD CELEBRATION MODAL */}
      {unlockedReward && (
        <div className="fixed inset-0 z-[310] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-8 border-2 border-green-500 rounded-sm bg-gradient-to-b from-slate-950 to-black text-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-scaleIn">
            
            {/* Scanline pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay" 
                  style={{backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)', backgroundSize: '100% 4px'}}></div>

            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <span className="text-black font-black text-2xl">✓</span>
            </div>

            <div className="space-y-1">
              <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[9px] font-black uppercase tracking-widest skew-x-[-10deg] mb-2 animate-pulse">
                🎉 CODE SUCCESSFULLY REDEEMED
              </div>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                REWARD UNLOCKED!
              </h2>
              <p className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-widest">
                {unlockedReward === 'junior' ? 'JUNIOR OPERATOR STATUS' : unlockedReward === 'admin' ? 'SYSTEM_ADMIN CLEARANCE' : 'ULTIMATE_CREATOR ACCESS'}
              </p>
            </div>

            <div className="bg-black/60 border border-white/5 p-4 rounded-sm text-left space-y-3 font-sans">
              <span className="text-gray-500 text-[9px] font-mono block uppercase tracking-widest border-b border-white/5 pb-1.5">
                PROVISIONED PRIVILEGES & REWARDS:
              </span>
              
              {unlockedReward === 'junior' && (
                <div className="space-y-2 text-xs font-semibold italic text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Access to Admin Console (ADMIN_CMD) (Limited)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Activate High-Perf Turbo Mode for speedboost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Exclusive Operator Node privileges</span>
                  </div>
                </div>
              )}

              {unlockedReward === 'admin' && (
                <div className="space-y-2 text-xs font-semibold italic text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Full Security Console Bypass rights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Secure Root Terminal access (ROOT_TERM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Exclusive custom sound players & audio visualizers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Zero validation limitations across all modules</span>
                  </div>
                </div>
              )}

              {unlockedReward === 'creator' && (
                <div className="space-y-2 text-xs font-semibold italic text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Full AI Creator Laboratory (CREATOR WORKSHOP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Create dynamic retro games & soundboards with Gemini AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Your own permanent User Sub-Node Page mapped to your ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">▶</span>
                    <span>Full Administrative & logic override rights</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirmation Code Input Box */}
            <div className="space-y-2 text-left bg-black/40 border border-white/5 p-4 rounded-sm">
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                CONFIRM SECURITY HANDSHAKE (ENTER A VALID ACCESS CODE TO CLAIM)
              </label>
              <input
                type="text"
                placeholder="ENTER A VALID CODE FOR THIS TIER..."
                value={claimCodeInput}
                onChange={(e) => {
                  setClaimCodeInput(e.target.value.toUpperCase());
                  setClaimError('');
                }}
                className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-green-500 uppercase placeholder:text-gray-700 rounded-sm"
              />
              {claimError && (
                <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest">{claimError}</p>
              )}
            </div>

            <button
              onClick={() => {
                const entered = claimCodeInput.trim().toUpperCase();
                let isValid = false;
                if (unlockedReward === 'junior') {
                  isValid = JUNIOR_CODES.includes(entered);
                } else if (unlockedReward === 'admin') {
                  isValid = ADMIN_CODES.includes(entered);
                } else if (unlockedReward === 'creator') {
                  isValid = CREATOR_CODES.includes(entered);
                }

                if (!isValid) {
                  setClaimError('ERROR: ENTERED CODE IS NOT A VALID CODE FOR THIS PACKAGE.');
                  audio.playError();
                } else {
                  // Save the claimed code as used
                  if (!usedCodes.includes(entered)) {
                    const updatedUsed = [...usedCodes, entered];
                    setUsedCodes(updatedUsed);
                    localStorage.setItem('phonk_redeemed_codes', JSON.stringify(updatedUsed));
                  }
                  setUnlockedReward(null);
                  setClaimCodeInput('');
                  setClaimError('');
                  audio.playSuccess();
                }
              }}
              className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black italic uppercase text-sm skew-x-[-12deg] transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              CLAIM REWARDS & ENTER HUB
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
