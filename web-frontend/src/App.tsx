import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InCall from './pages/InCall';
import Forensics from './pages/Forensics';
import Settings from './pages/Settings';
import IncomingCall from './pages/IncomingCall';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/incoming"  element={<IncomingCall />} />
        <Route path="/incall"    element={<InCall />} />
        <Route path="/forensics" element={<Forensics />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
