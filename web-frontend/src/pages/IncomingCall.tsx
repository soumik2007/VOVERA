import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const waveBars = [
  { h: 'h-4', color: 'bg-amber-400/80', delay: '0.1s' },
  { h: 'h-7', color: 'bg-amber-400/90', delay: '0.3s' },
  { h: 'h-10', color: 'bg-amber-300', delay: '0.2s' },
  { h: 'h-6', color: 'bg-amber-400', delay: '0.5s' },
  { h: 'h-12', color: 'bg-red-400', delay: '0.15s' },
  { h: 'h-14', color: 'bg-red-500', delay: '0.4s' },
  { h: 'h-11', color: 'bg-red-500', delay: '0.25s' },
  { h: 'h-13', color: 'bg-red-400', delay: '0.6s' },
  { h: 'h-14', color: 'bg-red-500', delay: '0.35s' },
  { h: 'h-10', color: 'bg-red-400', delay: '0.45s' },
  { h: 'h-8', color: 'bg-amber-400', delay: '0.2s' },
  { h: 'h-11', color: 'bg-amber-300', delay: '0.55s' },
  { h: 'h-7', color: 'bg-amber-400', delay: '0.1s' },
  { h: 'h-9', color: 'bg-amber-400/80', delay: '0.4s' },
  { h: 'h-5', color: 'bg-amber-400/60', delay: '0.25s' },
  { h: 'h-3', color: 'bg-amber-400/50', delay: '0.65s' },
];

export default function IncomingCall() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ msg: string; desc: string; icon: string; color: string } | null>(null);

  const showToast = (msg: string, desc: string, icon: string, color: string) => {
    setToast({ msg, desc, icon, color });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col selection:bg-[#FFE08D] selection:text-[#3D2F00]">
      {/* Ambient Top Glow for Threat Level */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      {/* Minimal Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-14 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1E2330] border border-white/10 flex items-center justify-center text-[#FFE08D] shadow-sm">
              <span className="material-symbols-outlined text-[17px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base text-[#F0F2F8]" style={{ fontFamily: "'Bauhaus 93', sans-serif" }}>VOVERA</span>
              <span className="text-[10px] text-[#9DA7B8] font-medium tracking-wide">Signal Shield</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse"></span>
              <span className="text-[11px] font-semibold text-red-400 tracking-wide uppercase">Call Intercept</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Flow */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-28 px-5 max-w-md mx-auto w-full justify-between">
        
        {/* Executive Caller Section */}
        <div className="flex flex-col items-center text-center w-full pt-3">
          {/* Caller Avatar with Luxury Glow Ring */}
          <div className="relative mb-4">
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-b from-red-500/30 via-amber-500/15 to-transparent blur-md opacity-75"></div>
            <div className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-b from-red-400/60 to-red-900/40 shadow-2xl flex items-center justify-center bg-[#07090D]">
              <span className="material-symbols-outlined text-slate-400 text-5xl">person</span>
              <div className="absolute -bottom-1 right-1 w-6 h-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center shadow-lg border-2 border-[#0B0E14]">
                <span className="material-symbols-outlined text-[13px] font-bold">warning</span>
              </div>
            </div>
          </div>
          
          {/* Caller Identification */}
          <h1 className="text-2xl font-bold tracking-tight text-[#F0F2F8]">Unknown Number</h1>
          <p className="text-xs font-normal text-[#9DA7B8]/70 tracking-wider mt-1">+1 (650) 412-9931</p>
          
          {/* Clean High-Impact Threat Tag */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined text-[#FF6B6B] text-[17px]">crisis_alert</span>
            <span className="text-xs font-semibold text-red-300 tracking-wide">Synthetic Voice Warning</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#FF6B6B] text-[#0B0E14] font-mono">89%</span>
          </div>
        </div>

        {/* Acoustic Wave & Key Insight Centerpiece */}
        <div className="w-full my-6 flex flex-col items-center">
          <div className="w-full bg-[#11141C]/90 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center shadow-[0_0_60px_-10px_rgba(239,68,68,0.18)]">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFE08D] text-[18px]">graphic_eq</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F0F2F8]">Analyzing Inbound Audio</span>
              </div>
              <span className="text-[11px] text-[#FFE08D]/80 font-medium tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE08D] animate-ping"></span>
                Real-time
              </span>
            </div>
            
            {/* Sleek Minimal Audio Spectrum */}
            <div className="h-14 w-full flex items-end justify-center gap-1.5 py-1 px-2">
              {waveBars.map((bar, i) => (
                <div key={i} className={`wave-bar w-1.5 rounded-full ${bar.color} ${bar.h}`} style={{ animationDelay: bar.delay }}></div>
              ))}
            </div>
            
            <div className="mt-4 pt-3.5 border-t border-white/[0.05] w-full flex items-center justify-center gap-2 text-center">
              <span className="material-symbols-outlined text-red-400 text-[16px] shrink-0">fingerprint</span>
              <span className="text-xs text-[#9DA7B8] font-medium">Neural clone detected matching external voice library.</span>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => {
              showToast('Caller Blocked', 'Identity flagged and added to zero-trust blocklist.', 'block', 'text-red-400 bg-red-500/20');
              setTimeout(() => navigate('/'), 2000);
            }}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#591419] to-[#3B0E12] hover:from-[#6B1A20] hover:to-[#4A1217] border border-red-500/30 text-red-100 font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/40 active:scale-[0.985] transition-all">
            <span className="material-symbols-outlined text-[21px] text-red-400">call_end</span>
            <span>Reject & Block Caller</span>
          </button>
          
          <button 
            onClick={() => navigate('/incall')}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#161B26] hover:bg-[#1E2330] border border-white/[0.08] text-[#F0F2F8] font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.985] transition-all">
            <span className="material-symbols-outlined text-[#FFE08D] text-[19px]">shield_with_heart</span>
            <span>Screen Call with AI Guard</span>
          </button>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 bg-[#282E3E]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-xl animate-fade-in">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.color}`}>
            <span className="material-symbols-outlined text-[18px]">{toast.icon}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white leading-tight truncate">{toast.msg}</span>
            <span className="text-xs text-slate-400 leading-normal truncate">{toast.desc}</span>
          </div>
        </div>
      )}
      
    </div>
  );
}
