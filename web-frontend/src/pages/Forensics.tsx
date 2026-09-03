import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface ReportData {
  id: number;
  caller_hash: string;
  risk_score: number;
  signals: string[];
  report_text: string;
  created_at: string;
}

export default function Forensics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ title: string; msg: string } | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const reportId = searchParams.get('id');

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/api/v1/analyze/report/${reportId}`)
      .then(res => {
        if (!res.ok) throw new Error("Report not found");
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [reportId]);

  const showToast = (title: string, msg: string) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 2600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0e13] text-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#e5c365] border-t-transparent rounded-full"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0c0e13] text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <span className="material-symbols-outlined text-slate-500 text-5xl">find_in_page</span>
          <p className="text-slate-400">Select a scan from your Dashboard to view forensics.</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-[#2b2f3a] rounded-lg text-sm font-medium">Return Home</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const isSafe = report.risk_score < 50;

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0c0e13]/80 backdrop-blur-xl border-b border-[#2b2f3a]/50">
        <div className="h-16 px-5 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16181e] border border-[#e5c365]/30 flex items-center justify-center text-[#e5c365] shadow-[0_0_15px_rgba(229,195,101,0.12)]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#e5c365] uppercase">VOVERA SIGNAL</span>
              <span className="text-base font-semibold tracking-tight text-white">Threat Forensics</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pt-20 pb-28 px-5 flex flex-col space-y-5 max-w-lg mx-auto">
        {/* Incident Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {!isSafe && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            <span className="text-[11px] tracking-wider uppercase font-semibold text-slate-400 font-mono">
              INCIDENT #VOV-{report.id.toString().padStart(4, '0')}
            </span>
          </div>
          <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
            {new Date(report.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Hero Incident Card */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#16181e] to-[#1d2027] border p-5 shadow-xl shadow-black/40 ${isSafe ? 'border-emerald-500/30' : 'border-[#e5c365]/30'}`}>
          {!isSafe && <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#e5c365]/10 rounded-full blur-3xl pointer-events-none"></div>}
          {!isSafe && <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>}
          
          <div className="relative flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5 ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className="material-symbols-outlined text-[14px]">{isSafe ? 'check_circle' : 'crisis_alert'}</span>
                  {isSafe ? 'Verified Safe' : 'Intercepted Threat'}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {isSafe ? 'Authentic Human Voice' : 'Synthetic Voice Intercepted'}
                </h1>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase ${isSafe ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {isSafe ? 'ALLOWED' : 'BLOCKED'}
              </div>
            </div>

            {/* AI Report Text */}
            <div className="p-3 rounded-xl bg-[#0c0e13]/60 border border-[#2b2f3a]/60">
              <div className="text-[11px] font-medium text-slate-400 mb-1">AI Copilot Analysis</div>
              <p className="text-sm font-medium text-white/90 leading-snug">
                {report.report_text}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-end justify-between pt-1 border-t border-[#2b2f3a]/40">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Confidence Score</div>
                <div className="text-xs text-slate-400/70">Multi-band spectral variance analysis</div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold tracking-tight font-mono ${isSafe ? 'text-emerald-400' : 'text-[#ffe08d]'}`}>
                  {report.risk_score.toFixed(1)}%
                </span>
                <span className={`block text-[10px] font-semibold uppercase tracking-wider ${isSafe ? 'text-emerald-500' : 'text-red-400'}`}>
                  {isSafe ? 'Safe Match' : 'Synthetic Match'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player (Mock) */}
        <div className="rounded-2xl bg-[#16181e] border border-[#2b2f3a]/50 p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[19px] ${isSafe ? 'text-emerald-400' : 'text-[#ffe08d]'}`}>graphic_eq</span>
              <h2 className="text-sm font-semibold text-white tracking-wide">Captured Audio Sample</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-[#1d2027] px-2 py-0.5 rounded">00:08s CLIP</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0c0e13]/80 border border-[#2b2f3a]/40 space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0 ${isSafe ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-[#ffe08d] text-[#3d2f00] hover:bg-[#fbe5a2]'}`}>
                <span className="material-symbols-outlined text-[24px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={`${isSafe ? 'text-emerald-400' : 'text-[#ffe08d]'} font-medium`}>00:00.0</span>
                  <span className="text-slate-400">00:08.0</span>
                </div>
                <div className="w-full bg-[#1d2027] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full w-0 ${isPlaying ? 'w-full transition-all duration-[8000ms] ease-linear' : ''} ${isSafe ? 'bg-emerald-400' : 'bg-[#ffe08d]'}`}></div>
                </div>
              </div>
            </div>
            {/* Waveform */}
            <div className="h-12 w-full flex items-center justify-between gap-[3px] px-1">
              {[3,5,8,4,6,7,4,11,12,9,11,5,4,7,9,6,5,10,11,7,3,2].map((h, i) => (
                <div key={i} className={`w-1 rounded-full ${(!isSafe && i >= 7 && i <= 10) ? 'bg-red-500 ring-2 ring-red-500/20' : (!isSafe && i >= 18 && i <= 20) ? 'bg-red-400/90' : i % 3 === 0 ? (isSafe ? 'bg-emerald-500/70' : 'bg-[#ffe08d]/70') : 'bg-[#434752]'}`} style={{ height: `${h * 4}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Threat Assessment (Mapped from signals) */}
        {!isSafe && report.signals && report.signals.length > 0 && (
          <div className="rounded-2xl bg-[#16181e] border border-[#2b2f3a]/50 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#2b2f3a]/30">
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#ffe08d]">analytics</span>
                Threat Assessment
              </h2>
            </div>
            {report.signals.map((sig, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#1d2027]/60 border border-[#2b2f3a]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#262932] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px] text-red-400">warning</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Anomaly Detected</div>
                  <div className="text-sm font-medium text-white">{sig}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2.5 pt-1">
          <button onClick={() => showToast('Export Coming Soon', 'PDF generation is not yet implemented on the backend.')}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2b2f3a] to-[#1d2027] border border-[#2b2f3a] hover:border-[#434752] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Download Incident Log</span>
          </button>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-5 right-5 z-50 max-w-md mx-auto bg-[#31353f] border border-[#e5c365]/30 text-white p-3.5 rounded-xl shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e5c365]/20 text-[#ffe08d] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">{toast.title}</p>
            <p className="text-[11px] text-slate-400 truncate">{toast.msg}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
