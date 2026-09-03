import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

export default function Settings() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [shareStats, setShareStats] = useState(false);
  const [language, setLanguage] = useState('English');

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${value ? 'bg-[#E5C365]' : 'bg-white/10'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-[#0B0E14] shadow transition-all duration-200 mt-0.5 ${value ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-6 flex items-center max-w-lg mx-auto">
          <span className="text-xl font-bold tracking-[0.2em] text-white">VOVERA</span>
          <span className="ml-3 text-sm text-slate-400">Settings</span>
        </div>
      </header>

      <main className="flex-1 w-full pt-24 pb-28 px-5 flex flex-col gap-4 max-w-lg mx-auto">
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
            {['English', 'Hindi', 'Spanish', 'French', 'Arabic'].map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className="flex items-center justify-between w-full px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-b-0">
                <span className="text-sm text-white">{lang}</span>
                {language === lang && (
                  <span className="material-symbols-outlined text-[#E5C365] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141824]">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-5 pt-5 pb-3">Data Management</h3>
          <button className="flex items-center justify-between w-full px-5 py-4 border-t border-white/[0.05] hover:bg-red-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-red-400">delete_sweep</span>
              <p className="text-sm font-medium text-red-400">Clear Call History</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-500">chevron_right</span>
          </button>
        </div>

        {/* About */}
        <div className="mt-2 text-center space-y-1">
          <p className="text-xs text-slate-500">VOVERA v2.0.0 • Blockchain: Active</p>
          <p className="text-xs text-slate-600">MIT License</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
