// AIEngine.ts
// Simulates the on-device ECAPA-TDNN and HuBERT models running via TFLite/ONNX on the mobile CPU/NPU.

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
  private analyzer: AnalyserNode | null = null;

  async startAnalysis(
    callerNumber: string,
    onScoreUpdate: OnScoreUpdate,
    onThreatDetected: OnThreatDetected
  ) {
    this.stopAnalysis();
    console.log('[AI Engine] 🎤 Requesting real microphone access for Web Audio testing...');
    this.analyzing = true;
    this.currentScore = 15; // Start with baseline suspicion

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 64; // Small bin count for smooth UI bars
      this.analyzer.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyzer);
      const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);

      const processAudio = () => {
        if (!this.analyzing || !this.analyzer) return;

        // Get live microphone frequency data
        this.analyzer.getByteFrequencyData(dataArray);

        // Calculate average volume / energy
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // Map frequency bins to UI wavebars (slice first 22 bins, scale them down)
        const waveform = Array.from(dataArray).slice(0, 22).map(v => Math.max(1, v / 8));

        // Mock AI Logic:
        // If the user is speaking (volume > threshold), the "model" gets suspicious
        // The louder or longer you talk, the faster the risk score climbs!
        if (volume > 20) {
          this.currentScore += (volume / 200); // Gradual increase while talking
        }

        const mockSignals = {
          spectral_artifacts: Math.min(this.currentScore * 0.8, 99),
          pitch_inconsistency: Math.min(this.currentScore * 0.6, 99),
          voice_clone_probability: Math.min(this.currentScore, 99)
        };

        // Push updates to the UI (60fps)
        onScoreUpdate(this.currentScore, mockSignals, waveform);

        // Threat Threshold Reached!
        if (this.currentScore >= 85) {
          this.stopAnalysis();
          console.warn('[AI Engine] 🚨 DEEPFAKE DETECTED BY AUDIO MODEL. CUTTING CALL.');
          
          const reportId = 'rep_' + Date.now().toString(36);
          DatabaseService.saveReport({
            id: reportId,
            callerNumber: callerNumber,
            callerHash: btoa(callerNumber).substring(0, 10),
            riskScore: this.currentScore,
            timestamp: new Date().toISOString(),
            signals: mockSignals,
            reportText: 'The audio processor detected severe spectral anomalies and uncharacteristic volume spikes consistent with neural voice synthesis. Call terminated automatically for user protection.',
            actionTaken: 'BLOCKED'
          });

          ThreatReporter.reportAttacker(callerNumber, this.currentScore);
          onThreatDetected(reportId);
          return; // Stop loop
        }

        this.animationFrameId = requestAnimationFrame(processAudio);
      };

      // Start the audio loop
      processAudio();

    } catch (err) {
      console.error("[AI Engine] Failed to get microphone access:", err);
      // Fallback if user blocks mic
      onScoreUpdate(100, {}, Array(22).fill(1));
      onThreatDetected('rep_mic_blocked');
    }
  }

  stopAnalysis() {
    this.analyzing = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyzer = null;
    console.log('[AI Engine] 🛑 Microphone stream and models spun down.');
  }
}

export const aiEngine = new LocalAIEngine();
