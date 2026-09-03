import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

export default function Settings() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [shareStats, setShareStats] = useState(false); // OFF by default — privacy first
  const [language, setLanguage] = useState('English');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${value ? 'bg-[#E5C365]' : 'bg-white/10'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-[#0B0E14] shadow transition-all duration-200 mt-0.5 ${value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  );

  const languages = [
    { name: 'English', flag: '🇬🇧' },
    { name: 'Hindi', flag: '🇮🇳' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'Arabic', flag: '🇸🇦' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col">
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-6 flex items-center max-w-lg mx-auto">
          <span className="text-2xl text-white" style={{ fontFamily: "'Bauhaus 93', sans-serif", letterSpacing: '0.05em' }}>VOVERA</span>
          <span className="ml-3 text-sm text-slate-400">Settings</span>
        </div>
      </header>

      <main className="flex-1 w-full pt-24 pb-28 px-5 flex flex-col gap-4 max-w-lg mx-auto">

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-5 rounded-xl bg-[#141824] border border-white/[0.06]">
          <div className="w-12 h-12 rounded-full bg-[#E5C365]/10 border border-[#E5C365]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#E5C365] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">VOVERA User</p>
            <p className="text-xs text-slate-400 mt-0.5">Protected Account</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Active
          </div>
        </div>

        {/* Privacy */}
        <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-white/[0.06] bg-[#141824]">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-5 pt-5 pb-3">Privacy & Data</h3>
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <div>
              <p className="text-sm font-medium text-white">Auto-delete Audio</p>
              <p className="text-xs text-slate-400 mt-0.5">Delete recordings immediately after analysis</p>
            </div>
            <Toggle value={autoDelete} onChange={() => setAutoDelete(!autoDelete)} />
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <div>
              <p className="text-sm font-medium text-white">Share Anonymous Stats</p>
              <p className="text-xs text-slate-400 mt-0.5">Help improve global threat detection</p>
            </div>
            <Toggle value={shareStats} onChange={() => setShareStats(!shareStats)} />
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141824]">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-5 pt-5 pb-3">Language</h3>
          <div className="border-t border-white/[0.05]">
            {languages.map(lang => (
              <button key={lang.name} onClick={() => setLanguage(lang.name)}
                className="flex items-center justify-between w-full px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-b-0">
                <span className="text-xl">{lang.flag}</span>
                {language === lang.name && (
                  <span className="material-symbols-outlined text-[#E5C365] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141824]">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-5 pt-5 pb-3">Data Management</h3>
          {!showClearConfirm ? (
            <button onClick={() => setShowClearConfirm(true)} className="flex items-center justify-between w-full px-5 py-4 border-t border-white/[0.05] hover:bg-red-500/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-red-400">delete_sweep</span>
                <p className="text-sm font-medium text-red-400">Clear Call History</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-slate-500">chevron_right</span>
            </button>
          ) : (
            <div className="px-5 py-4 border-t border-white/[0.05]">
              <p className="text-sm font-medium text-white mb-1">Are you sure?</p>
              <p className="text-xs text-slate-400 mb-4">This will permanently delete all call history and forensic reports. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white font-medium hover:bg-white/[0.1] transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-400 font-semibold hover:bg-red-500/30 transition-colors">
                  Delete All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141824]">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-5 pt-5 pb-3">About</h3>
          <div className="border-t border-white/[0.05] px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Version</span>
              <span className="text-sm font-medium text-white">VOVERA v2.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Blockchain Status</span>
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">License</span>
              <span className="text-sm font-medium text-white">MIT License</span>
            </div>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

