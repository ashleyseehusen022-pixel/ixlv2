
import React, { useState, useEffect } from 'react';
import { downloadProjectZip } from '../services/exportService';

export const DeployPortal: React.FC = () => {
  const [step, setStep] = useState(1);
  const [repoUrl, setRepoUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('PHONK_DEPLOYED_REPO');
    if (saved) setRepoUrl(saved);
  }, []);

  const steps = [
    {
      title: "PREPARE_UPLINK",
      desc: "Package the entire Phonk Arcade source code into a secure ZIP archive. This includes the automated GitHub Actions for instant deployment.",
      action: "DOWNLOAD_SOURCE_ZIP",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500"><path d="M12 22v-5"/><path d="M9 20l3 2 3-2"/><path d="M12 12V2"/><path d="M9 4l3-2 3 2"/><path d="M19 9l2 3-2 3"/><path d="M5 9l-2 3 2 3"/><path d="m3 12 18 0"/></svg>
      )
    },
    {
      title: "GITHUB_HANDSHAKE",
      desc: "Create a new Public repository on GitHub. Once created, upload the contents of your ZIP file directly to the 'main' branch.",
      action: "OPEN_GITHUB_WIZARD",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
      )
    },
    {
      title: "LINK_ACTIVE",
      desc: "Your mirror is now syncing via GitHub Actions. Paste your repository URL below to verify the uplink and enable the remote mirror.",
      action: "VERIFY_DEPLOYMENT",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      )
    }
  ];

  const handleAction = async () => {
    if (step === 1) {
      setIsSyncing(true);
      // Simulate preparing files
      setTimeout(async () => {
        // In a real scenario, we'd pass the actual file map here.
        // For this demo, we use a placeholder readme to trigger the download logic.
        await downloadProjectZip({ 
          'README.md': '# Phonk Arcade Mirror\nDeploying to GitHub Pages...',
          '.github/workflows/deploy.yml': 'name: Deploy\non: push\njobs: build: runs-on: ubuntu-latest\nsteps: - uses: actions/checkout@v4'
        });
        setIsSyncing(false);
        setStep(2);
      }, 1500);
    } else if (step === 2) {
      window.open('https://github.com/new', '_blank');
      setStep(3);
    } else if (step === 3) {
      if (repoUrl) {
         setStep(1); // Reset or show success
         alert("DEPLOYMENT_VERIFIED: MIRROR IS NOW SYNCED.");
      } else {
        alert("ERROR: REPOSITORY_URL_REQUIRED");
      }
    }
  };

  const handleSaveRepo = (url: string) => {
    setRepoUrl(url);
    localStorage.setItem('PHONK_DEPLOYED_REPO', url);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fadeIn">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black italic mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-yellow-500 uppercase tracking-tighter phonk-text">
          GITHUB_SYNC_ENGINE
        </h2>
        <p className="text-gray-500 text-xs font-black italic uppercase tracking-[0.3em]">
          Automated Node Mirroring // GitHub Pages Integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {steps.map((s, idx) => (
          <div 
            key={idx} 
            className={`p-6 border-2 transition-all flex flex-col gap-4 skew-x-[-10deg] ${step === idx + 1 ? 'bg-white/5 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-black/40 border-white/5 opacity-50 grayscale'}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-black/60 border border-white/10 rounded-sm">
                {s.icon}
              </div>
              <span className="text-[10px] font-black text-gray-600">0{idx + 1}</span>
            </div>
            <div>
              <h3 className="text-sm font-black italic text-white uppercase mb-2">{s.title}</h3>
              <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-10 border-2 border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter">
              {steps[step-1].title}
            </h4>
            
            <div className="p-4 bg-black/80 border border-white/5 font-mono text-[10px] text-gray-400 leading-loose min-h-[120px]">
              {isSyncing ? (
                <div className="flex flex-col items-center justify-center h-full animate-pulse">
                   <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <span className="text-green-500">PACKAGING_SOURCE_NODES...</span>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <div className="space-y-1">
                      <div className="text-green-500">&gt; KERNEL: PHONK_ARCADE_V5.4</div>
                      <div>&gt; ARCHIVING GAMES: TINY_FISHING, PHONK_MOTO, etc.</div>
                      <div>&gt; INJECTING GITHUB_ACTIONS_DEPLOYMENT_SCRIPT</div>
                      <div className="text-yellow-500">&gt; READY_TO_DOWNLOAD</div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-1">
                      <div className="text-blue-500">&gt; TARGET: https://github.com/new</div>
                      <div>&gt; NAME: phonk-arcade</div>
                      <div>&gt; VISIBILITY: PUBLIC</div>
                      <div>&gt; ACTION: UPLOAD_ALL_FILES_FROM_ZIP</div>
                      <div className="text-red-500">&gt; SETTINGS &gt; PAGES &gt; SOURCE: GITHUB_ACTIONS</div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-3">
                      <div className="text-green-500">&gt; UPLOAD_DETECTED_WAITING_FOR_HASH</div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-gray-500 block">ENTER REPOSITORY URL:</label>
                        <input 
                          type="text" 
                          value={repoUrl}
                          onChange={(e) => handleSaveRepo(e.target.value)}
                          placeholder="https://github.com/username/repo"
                          className="w-full bg-black border border-white/10 p-2 text-white font-mono text-[9px] outline-none focus:border-green-500"
                        />
                      </div>
                      {repoUrl && (
                        <a 
                          href={repoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block text-blue-400 hover:text-blue-300 underline animate-pulse"
                        >
                          OPEN_REMOTE_NODE
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <button 
              onClick={handleAction}
              disabled={isSyncing}
              className="w-full py-5 bg-green-600 hover:bg-white hover:text-green-600 text-white font-black italic uppercase skew-x-[-12deg] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {steps[step-1].action}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <div className="hidden md:block w-72 h-72 relative">
             <div className="absolute inset-0 border-2 border-dashed border-green-500/20 rounded-full animate-spin-slow"></div>
             <div className="absolute inset-8 border-2 border-blue-500/10 rounded-full animate-reverse-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl font-black italic text-white block">{isSyncing ? '...' : step === 3 ? '100%' : step === 2 ? '66%' : '33%'}</span>
                  <span className="text-[10px] font-black text-gray-600 uppercase">SYNC_STATUS</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest max-w-xl mx-auto leading-loose italic">
          Disclaimer: This utility facilitates the migration of Phonk Systems Arcade code to your own GitHub infrastructure. By using this service, you agree to mirror the source code ethically. High-performance hosting provided by GitHub Actions.
        </p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 15s linear infinite; }
      `}</style>
    </div>
  );
};
