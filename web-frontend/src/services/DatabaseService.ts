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
  };
  reportText: string;
  actionTaken: 'BLOCKED' | 'WARNED' | 'SAFE';
}

export const DatabaseService = {
  // Save a new forensic report entirely locally
  saveReport: (report: ForensicReport) => {
    const existing = DatabaseService.getAllReports();
    existing.unshift(report);
    localStorage.setItem('vovera_local_db_reports', JSON.stringify(existing));
    console.log('[Local DB] Saved forensic report locally for', report.callerNumber);
  },

  // Get all past reports for the Dashboard/Forensics tab
  getAllReports: (): ForensicReport[] => {
    const data = localStorage.getItem('vovera_local_db_reports');
    return data ? JSON.parse(data) : [];
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
