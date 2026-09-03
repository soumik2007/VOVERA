import React from 'react';
import { Link } from 'react-router-dom';

export default function Report() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-gray-400 hover:text-white mb-6 inline-block">? Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mb-4">Post-Call Report</h1>
        {/* DESIGN ME */}
        <p>Design the deepfake analysis report here!</p>
      </div>
    </div>
  );
}
