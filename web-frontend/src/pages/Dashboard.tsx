import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface CallRecord {
  id: number;
  caller_hash: string;
  risk_score: number;
  created_at: string;
  is_safe: boolean;
}

export default function Dashboard() {
  const [defenseOn, setDefenseOn] = useState(true);
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real call history from backend
    fetch('http://localhost:8000/api/v1/analyze/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentCalls(data);
          setTotalScans(data.length);
        }
      })
      .catch(err => console.error("Failed to fetch history:", err));
  }, []);

  // Live uptime ticker
  useEffect(() => {
    if (!defenseOn) return;
    const t = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [defenseOn]);

  const formatUptime = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  const threatsBlocked = recentCalls.filter(c => !c.is_safe).length;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* Ambient background glow when shield is active */}
      {defenseOn && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[280px] bg-[#E5C365]/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />
      )}

      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="h-16 px-6 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-white" style={{ fontFamily: "'Bauhaus 93', sans-serif", letterSpacing: '0.05em' }}>VOVERA</span>
            {defenseOn ? (
              <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full border border-[#E5C365]/30 bg-[#E5C365]/10 text-[#E5C365] font-medium uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C365] animate-pulse inline-block" />
                Shield Active
              </span>
            ) : (
              <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full border border-slate-600/40 bg-slate-600/10 text-slate-400 font-medium uppercase">
                Shield Off
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full pt-24 pb-28 px-5 flex flex-col gap-5 max-w-lg mx-auto">

        {/* Voice Shield Status Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141824] border border-white/[0.06] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#E5C365]/5 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col items-center text-center">
            {/* Radial Ring — outer ring pulses when shield is active */}
            <div className="relative flex items-center justify-center mb-4" style={{ width: '148px', height: '148px' }}>
              {defenseOn && (
                <div className="absolute inset-0 rounded-full border-2 border-[#E5C365]/15 animate-ping" style={{ animationDuration: '2.8s' }} />
              )}
              <svg width="148" height="148" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                <circle cx="50" cy="50" fill="none" r="42"
                  stroke="url(#goldGradient)"
                  strokeDasharray="264" strokeDashoffset="18"
                  strokeLinecap="round" strokeWidth="3.5"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5C365" />
                    <stop offset="100%" stopColor="#A38532" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute' }} className="flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[#E5C365]" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-xs font-medium tracking-wider text-slate-400 uppercase mt-0.5">Protected</span>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-white tracking-tight mt-1">Voice Shield Active</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">Real-time neural synthesis detection defending your calls</p>

            {/* Live uptime indicator */}
            {defenseOn && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Monitoring for {formatUptime(uptimeSeconds)}
              </div>
            )}

            {/* Metrics with context */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-5 border-t border-white/[0.06]">
              <div className="flex flex-col items-center">
                <span className={`text-2xl font-light tracking-tight ${threatsBlocked > 0 ? 'text-red-400' : 'text-white'}`}>
                  {threatsBlocked > 0 ? threatsBlocked : '—'}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5 font-medium">Threats Blocked</span>
                {threatsBlocked === 0 && <span className="text-[10px] text-emerald-500/70 mt-0.5">Clean record ✓</span>}
              </div>
              <div className="flex flex-col items-center border-l border-white/[0.06]">
                <span className={`text-2xl font-light tracking-tight ${totalScans > 0 ? 'text-[#E5C365]' : 'text-white'}`}>
                  {totalScans > 0 ? totalScans : '—'}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5 font-medium">Total Scans</span>
                {totalScans === 0 && <span className="text-[10px] text-slate-500 mt-0.5">Ready to scan</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Defense Toggle — live uptime + color change when off */}
        <div className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${defenseOn ? 'bg-[#0F1A0F] border-emerald-500/20' : 'bg-[#161B26] border-white/[0.06]'}`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${defenseOn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#E5C365]/10 text-[#E5C365]'}`}>
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Automated Voice Defense</span>
              <span className={`text-xs flex items-center gap-1.5 mt-0.5 font-medium ${defenseOn ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${defenseOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                {defenseOn ? `Active · ${formatUptime(uptimeSeconds)}` : 'Disabled — calls unprotected'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setDefenseOn(!defenseOn)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${defenseOn ? 'bg-emerald-500' : 'bg-white/10'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all duration-200 mt-0.5 ${defenseOn ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Recent Calls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Recent Call Activity</h2>
            <button
              onClick={() => navigate('/incoming')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5C365]/10 hover:bg-[#E5C365]/15 border border-[#E5C365]/20 transition-colors text-xs font-medium text-[#E5C365]"
            >
              <span className="material-symbols-outlined text-[14px]">ring_volume</span>
              Simulate Call
            </button>
          </div>

          {recentCalls.length === 0 ? (
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/[0.05] bg-[#141824]/60 gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E5C365]/10 border border-[#E5C365]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#E5C365] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Your shield is ready</p>
                <p className="text-xs text-slate-400 mt-1.5 max-w-[220px] mx-auto leading-relaxed">
                  When a call comes in, VOVERA automatically scans the voice for deepfake patterns in real time.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="material-symbols-outlined text-[13px]">info</span>
                No calls analyzed yet
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentCalls.map(call => (
                <button
                  key={call.id}
                  onClick={() => { if (!call.is_safe) navigate(`/forensics?id=${call.id}`); }}
                  className={`flex items-center justify-between p-4 rounded-xl bg-[#141824] border border-white/[0.05] transition-all text-left w-full ${!call.is_safe ? 'hover:border-red-500/20 cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${call.is_safe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      <span className="material-symbols-outlined text-[20px]">{call.is_safe ? 'call' : 'phone_disabled'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white truncate font-mono text-[11px]">{call.caller_hash.substring(0, 12)}...</span>
                      <span className={`inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium w-fit ${call.is_safe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {call.is_safe ? 'Verified Authentic' : 'AI Impersonation Blocked'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs text-slate-400">{formatTimeAgo(call.created_at)}</span>
                    {!call.is_safe && (
                      <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-0.5">
                        View Report
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
