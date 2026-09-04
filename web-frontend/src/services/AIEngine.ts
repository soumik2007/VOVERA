// AIEngine.ts
// Connects the React UI to the Python FastAPI backend hosting the PyTorch VoveraShield.

import { DatabaseService } from './DatabaseService';
import { ThreatReporter } from './ThreatReporter';

// Callbacks for the UI to update in real-time
type OnScoreUpdate = (score: number, signals: any, waveform?: number[]) => void;
type OnThreatDetected = (reportId: string) => void;

export class LocalAIEngine {
  private analyzing: boolean = false;
  private animationFrameId: number | null = null;
  private currentScore: number = 0;
  
  // Audio state
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private visualAnalyzer: AnalyserNode | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;

  // Python Backend Connection
  private ws: WebSocket | null = null;
  private latestSignals: any = { acoustic_variance: 0, phonetic_marker: 0 };

  async startAnalysis(
    callerNumber: string,
    onScoreUpdate: OnScoreUpdate,
    onThreatDetected: OnThreatDetected
  ) {
    this.stopAnalysis();
    console.log('[AI Engine] Requesting microphone access for PyTorch Edge AI streaming...');
    this.analyzing = true;
    this.currentScore = 15; // Start with baseline suspicion

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.visualAnalyzer = this.audioContext.createAnalyser();
      this.visualAnalyzer.fftSize = 64; 
      this.visualAnalyzer.smoothingTimeConstant = 0.8;
      
      this.audioProcessor = this.audioContext.createScriptProcessor(16384, 1, 1);
      
      source.connect(this.visualAnalyzer);
      this.visualAnalyzer.connect(this.audioProcessor);
      this.audioProcessor.connect(this.audioContext.destination);

      // Connect to Python FastAPI Backend
      this.ws = new WebSocket('ws://localhost:8000/api/v1/stream-audio');
      
      this.ws.onopen = () => {
        console.log("[AI Engine] Connected to Python PyTorch Backend!");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'success') {
             // Smooth the score with a rolling average (50% old, 50% new)
             // This speeds up the deepfake catch time to ~3 seconds while still preventing 1-second anomalies.
             this.currentScore = (this.currentScore * 0.5) + (data.risk_score * 0.5);
             this.latestSignals = data.details || {};
             console.log("[AI Engine] Score Update from PyTorch:", this.currentScore.toFixed(1));
          }
        } catch(e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      const uiDataArray = new Uint8Array(this.visualAnalyzer.frequencyBinCount);

      // This event fires every ~1 second of audio (16384 samples at 16kHz)
      this.audioProcessor.onaudioprocess = (e) => {
        if (!this.analyzing) return;
        
        const audioData = e.inputBuffer.getChannelData(0);
        
        const volume = audioData.reduce((acc, val) => acc + Math.abs(val), 0) / audioData.length;
        
        // If WebSocket is open and someone is actually speaking, send to Python!
        if (this.ws && this.ws.readyState === WebSocket.OPEN && volume > 0.01) {
            this.ws.send(audioData);
        }
      };

      // 60FPS UI Loop for the Waveforms
      const processUI = () => {
        if (!this.analyzing || !this.visualAnalyzer) return;

        this.visualAnalyzer.getByteFrequencyData(uiDataArray);
        const waveform = Array.from(uiDataArray).slice(0, 22).map(v => Math.max(1, v / 8));

        const mappedSignals = {
          acoustic_variance: this.latestSignals.acoustic_variance || 0,
          phonetic_marker: this.latestSignals.phonetic_marker || 0,
          voice_clone_probability: Math.min(this.currentScore, 99)
        };

        onScoreUpdate(this.currentScore, mappedSignals, waveform);

        if (this.currentScore >= 95) {
          this.stopAnalysis();
          console.warn('[AI Engine] DEEPFAKE DETECTED BY PYTORCH BACKEND. CUTTING CALL.');
          
          const reportId = 'rep_' + Date.now().toString(36);
          DatabaseService.saveReport({
            id: reportId,
            callerNumber: callerNumber,
            callerHash: btoa(callerNumber).substring(0, 10),
            riskScore: this.currentScore,
            timestamp: new Date().toISOString(),
            signals: mappedSignals,
            reportText: 'The VoveraShield PyTorch engine (ECAPA-TDNN & HuBERT) detected severe acoustic variance and phonetic anomalies consistent with neural voice synthesis. Call terminated automatically.',
            actionTaken: 'BLOCKED'
          });

          ThreatReporter.reportAttacker(callerNumber, this.currentScore);
          onThreatDetected(reportId);
          return;
        }

        this.animationFrameId = requestAnimationFrame(processUI);
      };

      processUI();

    } catch (err) {
      console.error("[AI Engine] Failed to get microphone access:", err);
      onScoreUpdate(100, {}, Array(22).fill(1));
      onThreatDetected('rep_mic_blocked');
    }
  }

  stopAnalysis() {
    this.analyzing = false;
    
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }

    if (this.visualAnalyzer) {
      this.visualAnalyzer.disconnect();
      this.visualAnalyzer = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('[AI Engine] Microphone stream spun down.');
  }
}

export const aiEngine = new LocalAIEngine();
