import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { setUser } = useDeathContext();
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Dramatic entrance animation
    setTimeout(() => setFadeIn(true), 500);
    
    // Auto-navigate after dramatic pause
    const timer = setTimeout(() => {
      setLoading(false);
      // Set a mock user for demo purposes
      setUser({
        id: 'demo-user-' + Date.now(),
        name: 'Mortal Being',
        email: 'mortal@deathcast.app',
      });
      navigate('/death-scan');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, setUser]);

  const handleSkip = () => {
    setUser({
      id: 'demo-user-' + Date.now(),
      name: 'Mortal Being',
      email: 'mortal@deathcast.app',
    });
    navigate('/death-scan');
  };

  return (
    <div className="splash-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className={`splash-content ${fadeIn ? 'fade-in' : ''}`}>
        <div className="skull-logo">
          💀
        </div>
        
        <h1 className="app-title">DEATHCAST</h1>
        
        <div className="tagline">
          <p>AI-Powered Mortality Prediction</p>
          <p className="subtitle">Know Your Expiration Date</p>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🔮</span>
            <span>Advanced AI Death Scanning</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>Blockchain Death Markets</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🗣️</span>
            <span>Voice AI Death Announcements</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span>Pay to Extend Your Life</span>
          </div>
        </div>

        {loading && (
          <div className="loading-section">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p className="loading-text">Initializing Death Prediction Systems...</p>
          </div>
        )}

        <div className="disclaimer">
          <p>⚠️ For Entertainment Purposes Only</p>
          <p>DeathCast predictions are not medical advice</p>
        </div>

        <div className="action-buttons">
          <button className="skip-button" onClick={handleSkip}>
            Skip to Death Scan →
          </button>
          <button
            className="landing-button"
            onClick={() => navigate('/landing')}
          >
            View Landing Page
          </button>
        </div>
      </div>

      <div className="background-animation">
        <div className="floating-skull skull-1">💀</div>
        <div className="floating-skull skull-2">☠️</div>
        <div className="floating-skull skull-3">💀</div>
        <div className="floating-skull skull-4">⚰️</div>
        <div className="floating-skull skull-5">🪦</div>
      </div>
    </div>
  );
}
