// DatabaseService.ts
// Simulates the on-device SQLite database (Capacitor SQLite) using IndexedDB/LocalStorage for the web prototype.

export interface ForensicReport {
  id: string;
  callerNumber: string;
  callerHash: string;
  riskScore: number;
  timestamp: string;
  signals: {
    spectral_artifacts: number;
    pitch_inconsistency: number;
    voice_clone_probability: number;
    semantic_intent_score?: number;
  };
  transcriptSnippet?: string;
  reportText: string;
  actionTaken: 'BLOCKED' | 'WARNED' | 'SAFE';
}

export const DatabaseService = {
  // Save a new forensic report entirely locally
  saveReport: (report: ForensicReport) => {
    try {
      const existing = DatabaseService.getAllReports();
      existing.unshift(report);
      // Keep only the 100 most recent reports to save space
      const trimmed = existing.slice(0, 100);
      localStorage.setItem('vovera_local_db_reports', JSON.stringify(trimmed));
      console.log('[Local DB] Saved forensic report locally for', report.callerNumber);
    } catch (e) {
      console.error('[Local DB] Failed to save report', e);
    }
  },

  // Get all past reports for the Dashboard/Forensics tab
  getAllReports: (): ForensicReport[] => {
    try {
      const data = localStorage.getItem('vovera_local_db_reports');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Local DB] Corrupt database data, resetting...', e);
      return [];
    }
  },

  // Get a specific report by ID
  getReportById: (id: string): ForensicReport | null => {
    const reports = DatabaseService.getAllReports();
    return reports.find(r => r.id === id) || null;
  },

  // Clear all local history
  clearHistory: () => {
    localStorage.removeItem('vovera_local_db_reports');
    console.log('[Local DB] Cleared all local forensic history.');
  }
};
