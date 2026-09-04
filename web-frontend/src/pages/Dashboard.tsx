import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { DatabaseService } from '../services/DatabaseService';
import type { ForensicReport } from '../services/DatabaseService';

export default function Dashboard() {
  const defenseOn = true; // Shield is now always on by default
  const [recentCalls, setRecentCalls] = useState<ForensicReport[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch local history from on-device database
    const data = DatabaseService.getAllReports();
    setRecentCalls(data);
    setTotalScans(data.length);
  }, []);

  // Live uptime ticker
  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  const threatsBlocked = recentCalls.filter(c => c.riskScore >= 50).length;

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
            {/* Sonar Lens (The Circular Protected Tag) */}
            <div className="relative flex items-center justify-center mb-6 mt-2" style={{ width: '160px', height: '160px' }}>
              {/* Central Glow */}
              {defenseOn && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E5C365]/15 blur-[40px] rounded-full pointer-events-none" />
              )}
              
              {/* Staggered Sonar Ripples */}
              {defenseOn && (
                <>
                  <div className="absolute inset-1 rounded-full border border-[#E5C365]/40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-1 rounded-full border border-[#E5C365]/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }} />
                  <div className="absolute inset-1 rounded-full border border-[#E5C365]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '2s' }} />
                </>
              )}

              {/* Core Glass Lens */}
              <div className={`relative w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center transition-all duration-700 shadow-2xl z-10 overflow-hidden ${
                defenseOn
                  ? 'bg-[#0B0E14] border border-[#E5C365]/50 shadow-[0_0_40px_rgba(229,195,101,0.15),inset_0_0_30px_rgba(229,195,101,0.25)]'
                  : 'bg-[#161B26] border border-white/[0.06] shadow-inner'
              }`}>
                <span className={`material-symbols-outlined transition-all duration-500 relative z-20 ${
                  defenseOn ? 'text-[#E5C365] drop-shadow-[0_0_12px_rgba(229,195,101,0.8)]' : 'text-slate-500'
                }`} style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>
                  {defenseOn ? 'security' : 'gpp_bad'}
                </span>
                <span className={`text-[10px] font-bold tracking-[0.15em] uppercase mt-1 relative z-20 transition-colors ${
                  defenseOn ? 'text-[#E5C365]' : 'text-slate-500'
                }`}>
                  {defenseOn ? 'Protected' : 'Offline'}
                </span>
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
              {recentCalls.map(call => {
                const isSafe = call.riskScore < 50;
                return (
                  <button
                    key={call.id}
                    onClick={() => navigate(`/forensics?id=${call.id}`)}
                    className={`flex items-center justify-between p-4 rounded-xl bg-[#141824] border border-white/[0.05] transition-all text-left w-full hover:border-white/[0.1] cursor-pointer`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isSafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">{isSafe ? 'call' : 'phone_disabled'}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate font-mono text-[11px]">{call.callerNumber}</span>
                        <span className={`inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium w-fit ${isSafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isSafe ? 'Verified Authentic' : 'AI Impersonation Blocked'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="text-xs text-slate-400">{formatTimeAgo(call.timestamp)}</span>
                      {!isSafe && (
                        <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-0.5">
                          View Report
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
