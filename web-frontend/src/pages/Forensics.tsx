import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { DatabaseService } from '../services/DatabaseService';
import type { ForensicReport } from '../services/DatabaseService';

export default function Forensics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ title: string; msg: string } | null>(null);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [allReports, setAllReports] = useState<ForensicReport[]>([]);
  const [loading, setLoading] = useState(true);

  const reportId = searchParams.get('id');

  useEffect(() => {
    // Always fetch all reports for the fallback list view
    const all = DatabaseService.getAllReports();
    setAllReports(all);

    if (reportId) {
      const found = all.find(r => r.id === reportId) || null;
      setReport(found);
    } else {
      setReport(null);
    }
    
    setLoading(false);
  }, [reportId]);

  const showToast = (title: string, msg: string) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 2600);
  };

  const isSafe = report ? report.riskScore < 50 : true;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col">
      {/* Universal Header (Matches Settings/Dashboard vibe) */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-6 flex items-center max-w-lg mx-auto">
          <span className="text-2xl text-white" style={{ fontFamily: "'Bauhaus 93', sans-serif", letterSpacing: '0.05em' }}>VOVERA</span>
          <span className="ml-3 text-sm text-slate-400">Forensics</span>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <main className="flex-1 pt-24 pb-28 px-5 max-w-lg mx-auto w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5C365]"></div>
        </main>
      ) : !report ? (
        <main className="flex-1 pt-24 pb-28 px-5 max-w-lg mx-auto w-full flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Local Threat History</h2>
          {allReports.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <span className="material-symbols-outlined text-4xl text-[#E5C365] mb-3">history</span>
              <p className="text-sm text-slate-400">No calls have been analyzed yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allReports.map(r => (
                <Link key={r.id} to={`/forensics?id=${r.id}`} className="p-4 rounded-xl bg-[#141824] border border-white/[0.06] flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-sm font-semibold text-white">{r.callerNumber}</p>
                    <p className="text-[11px] text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${r.riskScore >= 85 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {r.riskScore >= 85 ? 'BLOCKED' : 'SAFE'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 w-full pt-20 pb-28 px-5 flex flex-col space-y-5 max-w-lg mx-auto">
          {/* Incident Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141824] border border-white/[0.06] shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-slate-400">fingerprint</span>
              <span className="text-[10px] font-mono font-semibold tracking-widest text-slate-300 uppercase">
                INCIDENT #{report.id.substring(0,8)}
              </span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {new Date(report.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Primary Assessment Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#141824] border border-white/[0.06] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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
              <div className="p-3 rounded-xl bg-[#0B0E14]/60 border border-white/[0.06]">
                <div className="text-[11px] font-medium text-slate-400 mb-1">AI Copilot Analysis</div>
                <p className="text-sm font-medium text-white/90 leading-snug">
                  {report.reportText}
                </p>
              </div>

              {/* Score */}
              <div className="flex items-end justify-between pt-1 border-t border-white/[0.06]">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Confidence Score</div>
                  <div className="text-xs text-slate-400/70">Multi-band spectral variance analysis</div>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-bold tracking-tight font-mono ${isSafe ? 'text-emerald-400' : 'text-[#ffe08d]'}`}>
                    {report.riskScore.toFixed(1)}%
                  </span>
                  <span className={`block text-[10px] font-semibold uppercase tracking-wider ${isSafe ? 'text-emerald-500' : 'text-red-400'}`}>
                    {isSafe ? 'Safe Match' : 'Synthetic Match'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Player (Mock) */}
          <div className="rounded-2xl bg-[#141824] border border-white/[0.06] p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[19px] ${isSafe ? 'text-emerald-400' : 'text-[#ffe08d]'}`}>graphic_eq</span>
                <h2 className="text-sm font-semibold text-white tracking-wide">Captured Audio Sample</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-[#1E2330] px-2 py-0.5 rounded">00:08s CLIP</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E14]/80 border border-white/[0.06] space-y-3">
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
                  <div className="w-full bg-[#1E2330] h-1.5 rounded-full overflow-hidden">
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

          {/* Transcript / Semantic Analysis */}
          {report.transcriptSnippet && (
            <div className="rounded-2xl bg-[#141824] border border-white/[0.06] p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-[#A5B4FC]">chat</span>
                  Semantic Analysis
                </h2>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${report.signals?.semantic_intent_score === 100 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {report.signals?.semantic_intent_score === 100 ? 'MALICIOUS INTENT' : 'SAFE INTENT'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0E14]/60 border border-white/[0.04]">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Live Transcript Snippet</div>
                <p className="text-[13px] font-medium text-white/90 italic leading-relaxed">
                  "{report.transcriptSnippet}"
                </p>
              </div>
            </div>
          )}

          {/* Threat Assessment (Mapped from signals) */}
          {!isSafe && report.signals && Object.keys(report.signals).length > 0 && (
            <div className="rounded-2xl bg-[#141824] border border-white/[0.06] p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-[#ffe08d]">analytics</span>
                  Threat Assessment
                </h2>
              </div>
              {Object.entries(report.signals).filter(([key]) => key !== 'semantic_intent_score').map(([key, val], i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#262932] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px] text-red-400">warning</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Anomaly Detected</div>
                    <div className="text-sm font-medium text-white">{key.replace(/_/g, ' ')} ({val}%)</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2.5 pt-1">
            <button onClick={() => showToast('Export Coming Soon', 'PDF generation is not yet implemented on the backend.')}
              className="w-full h-12 rounded-xl bg-[#161B26] hover:bg-[#1E2330] border border-white/[0.08] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Download Incident Log</span>
            </button>
          </div>
        </main>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-5 right-5 z-50 max-w-md mx-auto bg-[#1E2330] border border-[#e5c365]/30 text-white p-3.5 rounded-xl shadow-2xl flex items-center gap-3">
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
