import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type RiskStatus = 'SAFE' | 'ANALYZING' | 'DANGER';

const waveBars = [
  { h: 'h-4', color: 'bg-amber-400/80', delay: '0.1s' },
  { h: 'h-7', color: 'bg-amber-400/90', delay: '0.3s' },
  { h: 'h-10', color: 'bg-amber-300', delay: '0.2s' },
  { h: 'h-6', color: 'bg-amber-400', delay: '0.5s' },
  { h: 'h-12', color: 'bg-red-400', delay: '0.15s' },
  { h: 'h-14', color: 'bg-red-500', delay: '0.4s' },
  { h: 'h-11', color: 'bg-red-500', delay: '0.25s' },
  { h: 'h-12', color: 'bg-red-400', delay: '0.6s' },
  { h: 'h-14', color: 'bg-red-500', delay: '0.35s' },
  { h: 'h-10', color: 'bg-red-400', delay: '0.45s' },
  { h: 'h-8', color: 'bg-amber-400', delay: '0.2s' },
  { h: 'h-11', color: 'bg-amber-300', delay: '0.55s' },
  { h: 'h-7', color: 'bg-amber-400', delay: '0.1s' },
  { h: 'h-9', color: 'bg-amber-400/80', delay: '0.4s' },
  { h: 'h-5', color: 'bg-amber-400/60', delay: '0.25s' },
  { h: 'h-3', color: 'bg-amber-400/50', delay: '0.65s' },
];

export default function InCall() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [riskStatus, setRiskStatus] = useState<RiskStatus>('SAFE');
  const [riskScore, setRiskScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (msg: string, icon: string) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    // 1. Start the call timer
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    
    // 2. Connect to real backend WebSocket
    const ws = new WebSocket('ws://localhost:8000/api/v1/analyze/ws/stream');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('Connected to AI Voice Guard stream');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRiskScore(data.risk_score || 0);
        
        if (data.action === 'CUT_CALL') {
          setRiskStatus('DANGER');
          showToast('Deepfake Intercepted — Call Terminated', 'crisis_alert');
          ws.close();
          // Wait 2 seconds so user sees the red state, then navigate to forensics
          setTimeout(() => navigate(`/forensics?id=${data.id}`), 2000);
        } else if (data.risk_score > 40) {
          setRiskStatus('ANALYZING');
        } else {
          setRiskStatus('SAFE');
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // 3. Simulate streaming audio to backend (since we don't have real device mic access in browser)
    const audioSim = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send a dummy 1KB byte array to simulate audio chunks
        ws.send(new Uint8Array(1024));
      }
    }, 1000); // 1 chunk per second

    return () => {
      clearInterval(timer);
      clearInterval(audioSim);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [navigate]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  
  // Calculate synthetic % based on real backend risk score
  const syntheticPercent = riskStatus === 'SAFE' ? Math.max(0, riskScore) : 
                           riskStatus === 'ANALYZING' ? Math.max(40, riskScore) : 
                           Math.max(90, riskScore);
                           
  const humanPercent = 100 - syntheticPercent;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col">
      {/* Header */}
      <header className="pt-safe w-full z-30 px-6 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-sm font-semibold tracking-wider text-white/90">{formatTime(seconds)}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181D2A]/80 border border-[#404756]/60 backdrop-blur-md">
          <span className="material-symbols-outlined text-[15px] text-[#E5C365]">verified_user</span>
          <span className="text-[11px] font-medium tracking-wide text-[#E5C365]">AI Voice Guard Live</span>
        </div>
        <div className="w-9"></div> {/* Spacer to center the pill */}
      </header>

      <main className="flex-1 flex flex-col justify-between px-6 pt-2 pb-6 max-w-md mx-auto w-full">
        {/* Caller Info */}
        <section className="text-center pt-2 pb-4 space-y-1.5">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-b from-[#222736] to-[#181D2A] flex items-center justify-center border border-[#404756]/70 shadow-lg shadow-black/40 mb-3 relative">
            <span className="material-symbols-outlined text-[28px] text-slate-400">person</span>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0A0D14] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white font-bold">priority_high</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Unverified Caller</h1>
          <p className="text-xs font-medium text-slate-400 tracking-normal">+1 (415) 890–2134</p>
        </section>

        {/* Voice Authenticity Card */}
        <section className="rounded-3xl bg-[#181D2A]/60 border border-[#404756]/50 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Voice Authenticity</span>
            <div className={`inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-0.5 rounded-full border transition-colors duration-500 ${
              riskStatus === 'SAFE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              riskStatus === 'ANALYZING' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse' :
              'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              <span className="material-symbols-outlined text-[14px]">{riskStatus === 'SAFE' ? 'check_circle' : riskStatus === 'ANALYZING' ? 'sensors' : 'crisis_alert'}</span>
              <span>{riskStatus === 'SAFE' ? 'Scanning...' : riskStatus === 'ANALYZING' ? 'Analyzing' : 'Synthetic Clone'}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-[#2E3446]/80 overflow-hidden flex p-[1px]">
            <div className="h-full bg-[#E5C365] rounded-l-full transition-all duration-700" style={{ width: `${humanPercent}%` }} />
            <div className="w-0.5 h-full bg-[#0A0D14]" />
            <div className="h-full bg-gradient-to-r from-red-500/90 to-red-500 rounded-r-full transition-all duration-700" style={{ width: `${syntheticPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E5C365]"></span>
              <span className="text-slate-400">Human:</span>
              <span className="font-semibold text-[#E5C365]">{humanPercent.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Synthetic Clone:</span>
              <span className="font-semibold text-red-400">{syntheticPercent.toFixed(0)}%</span>
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            </div>
          </div>

          {/* Animated Wave */}
          <div className="h-14 rounded-2xl bg-[#131722]/80 border border-[#404756]/30 flex items-end justify-center gap-1 px-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent pointer-events-none"></div>
            {waveBars.map((bar, i) => (
              <div key={i} className={`w-1 ${bar.color} rounded-full ${bar.h} wave-bar`} style={{ animationDelay: bar.delay }} />
            ))}
          </div>
        </section>

        {/* Controls */}
        <section className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setIsMuted(!isMuted); showToast(isMuted ? 'Microphone active' : 'Microphone muted', isMuted ? 'mic' : 'mic_off'); }}
              className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#181D2A]/70 border border-[#404756]/40 hover:border-[#404756] transition-all active:scale-[0.97]">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-[#2E3446]/60 text-white'}`}>
                <span className="material-symbols-outlined text-[20px]">{isMuted ? 'mic_off' : 'mic'}</span>
              </div>
              <span className="text-xs font-medium text-white text-center">{isMuted ? 'Muted' : 'Mute Mic'}</span>
            </button>
            <button onClick={() => { setIsSpeaker(!isSpeaker); showToast(isSpeaker ? 'Speaker disabled' : 'Speaker enabled', isSpeaker ? 'volume_down' : 'volume_up'); }}
              className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#181D2A]/70 border border-[#404756]/40 hover:border-[#404756] transition-all active:scale-[0.97]">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-colors ${isSpeaker ? 'bg-white/20 text-white' : 'bg-[#2E3446]/60 text-slate-300'}`}>
                <span className="material-symbols-outlined text-[20px]">{isSpeaker ? 'volume_up' : 'volume_down'}</span>
              </div>
              <span className="text-xs font-medium text-white text-center">Speaker</span>
            </button>
          </div>
          <button onClick={() => { wsRef.current?.close(); navigate('/'); }}
            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/25 transition-all">
            <span className="material-symbols-outlined text-[22px]">call_end</span>
            <span>End Call</span>
          </button>
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-x-6 bottom-6 z-50 rounded-2xl bg-[#2E3446]/95 border border-[#404756]/60 p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#E5C365] text-[20px]">{toast.icon}</span>
            <span className="text-xs font-medium text-white">{toast.msg}</span>
          </div>
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium ml-2 shrink-0">SHIELD</span>
        </div>
      )}
    </div>
  );
}
