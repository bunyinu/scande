import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initSupabase } from './lib/supabase';
import { initElevenLabs } from './lib/elevenlabs';
import { DeathProvider } from './context/DeathContext';

// Screens
import SplashScreen from './screens/SplashScreen';
import LandingScreen from './screens/LandingScreen';
import DeathScanScreen from './screens/DeathScanScreen';
import DeathResultScreen from './screens/DeathResultScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PayToLiveScreen from './screens/PayToLiveScreen';
import LegacyScreen from './screens/LegacyScreen';

import './App.css';

export default function App() {
  useEffect(() => {
    // Initialize all services
    initSupabase();
    initElevenLabs();
  }, []);

  return (
    <DeathProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/landing" element={<LandingScreen />} />
            <Route path="/death-scan" element={<DeathScanScreen />} />
            <Route path="/death-result" element={<DeathResultScreen />} />
            <Route path="/marketplace" element={<MarketplaceScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/pay-to-live" element={<PayToLiveScreen />} />
            <Route path="/legacy" element={<LegacyScreen />} />
          </Routes>
        </div>
      </Router>
    </DeathProvider>
  );
}
