// AIEngine.ts
// Simulates the on-device ECAPA-TDNN and HuBERT models running via TFLite/ONNX on the mobile CPU/NPU.

import { DatabaseService } from './DatabaseService';
import { ThreatReporter } from './ThreatReporter';

// Callbacks for the UI to update in real-time
type OnScoreUpdate = (score: number, signals: any) => void;
type OnThreatDetected = (reportId: string) => void;

export class LocalAIEngine {
  private analyzing: boolean = false;
  private intervalId: any = null;
  private currentScore: number = 0;

  startAnalysis(
    callerNumber: string,
    onScoreUpdate: OnScoreUpdate,
    onThreatDetected: OnThreatDetected
  ) {
    console.log('[AI Engine] 🚀 Starting on-device ECAPA-TDNN & HuBERT models...');
    this.analyzing = true;
    this.currentScore = 15; // Start with baseline suspicion

    this.intervalId = setInterval(() => {
      if (!this.analyzing) return;

      // Simulate model inference extracting features every 500ms
      const jump = Math.floor(Math.random() * 15) + 5; 
      this.currentScore += jump;

      const mockSignals = {
        spectral_artifacts: Math.min(this.currentScore * 0.8, 99),
        pitch_inconsistency: Math.min(this.currentScore * 0.6, 99),
        voice_clone_probability: Math.min(this.currentScore, 99)
      };

      onScoreUpdate(this.currentScore, mockSignals);

      // Threat Threshold Reached!
      if (this.currentScore >= 85) {
        this.stopAnalysis();
        console.warn('[AI Engine] 🚨 DEEPFAKE DETECTED BY LOCAL MODEL. CUTTING CALL.');
        
        // 1. Generate the local forensic report
        const reportId = 'rep_' + Date.now().toString(36);
        DatabaseService.saveReport({
          id: reportId,
          callerNumber: callerNumber,
          callerHash: btoa(callerNumber).substring(0, 10), // fake hash
          riskScore: this.currentScore,
          timestamp: new Date().toISOString(),
          signals: mockSignals,
          reportText: 'The on-device ECAPA-TDNN model detected severe spectral anomalies consistent with neural voice synthesis. Call terminated automatically for user protection.',
          actionTaken: 'BLOCKED'
        });

        // 2. Silently report the attacker to the global threat map
        ThreatReporter.reportAttacker(callerNumber, this.currentScore);

        // 3. Notify the UI to navigate to forensics
        onThreatDetected(reportId);
      }
    }, 1000);
  }

  stopAnalysis() {
    this.analyzing = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[AI Engine] 🛑 On-device models spun down.');
  }
}

export const aiEngine = new LocalAIEngine();
