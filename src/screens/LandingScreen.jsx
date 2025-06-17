import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingScreen.css';

// Matrix Rain Component
const MatrixRain = ({ fontSize = 16, color = '#ff0000', characters = '01💀⚰️🔥', fadeOpacity = 0.05, speed = 0.5 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = characters.split('');
    const drops = [];
    const columnCount = Math.floor(canvas.width / fontSize);

    for (let i = 0; i < columnCount; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }
    };

    const interval = setInterval(draw, 33 / speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fontSize, color, characters, fadeOpacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default function LandingScreen() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const features = [
    {
      icon: '🤖',
      title: 'AI MORTALITY PREDICTION',
      description: 'Advanced facial analysis determines your exact death date',
      tech: 'Powered by TensorFlow.js'
    },
    {
      icon: '🎭',
      title: '12 VOICE ANNOUNCERS',
      description: 'From Grim Reaper to Valley Girl - choose your death narrator',
      tech: 'Powered by ElevenLabs Voice AI'
    },
    {
      icon: '⛓️',
      title: 'BLOCKCHAIN DEATH MARKETS',
      description: 'Bet on death timing with smart contracts',
      tech: 'Powered by Algorand Blockchain'
    },
    {
      icon: '💳',
      title: 'PAY TO LIVE LONGER',
      description: 'Purchase life extensions and death insurance',
      tech: 'Powered by RevenueCat Payments'
    },
    {
      icon: '🗄️',
      title: 'DIGITAL LEGACY STORAGE',
      description: 'Secure last words and inheritance planning',
      tech: 'Powered by Supabase Database'
    },
    {
      icon: '📜',
      title: 'DEATH CERTIFICATES',
      description: 'Official mortality prediction certificates',
      tech: 'PDF Generation & Download'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const startDeathPrediction = () => {
    navigate('/death-scan');
  };

  const skipToDemo = () => {
    navigate('/death-result');
  };

  const startDemoScan = () => {
    setScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/death-result');
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="landing-screen">
      {/* Matrix Rain Background */}
      <MatrixRain
        fontSize={16}
        color="#ff0000"
        characters="01💀⚰️🔥"
        fadeOpacity={0.05}
        speed={0.5}
      />

      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="landing-content">{!scanning ? (
        <>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="skull-animation">💀</div>
          <h1 className="app-title">DEATHCAST</h1>
          <p className="app-tagline">AI-Powered Mortality Prediction & Death Markets</p>
          <p className="app-subtitle">
            Know when you'll die. Bet on it. Profit from death.
          </p>
        </div>

        {/* Interactive Demo Section */}
        <div className="demo-section">
          <h2 className="demo-title">PREDICT YOUR DEATH</h2>
          <p className="demo-subtitle">
            Advanced AI mortality prediction using facial analysis, location data, and lifestyle patterns
          </p>

          <div className="scan-area">
            <div className="scan-frame">
              <div className="scan-content">
                <div className="skull-icon">💀</div>
                <p className="scan-instruction">Position your face here</p>
              </div>
            </div>
          </div>

          <button className="scan-button" onClick={startDemoScan}>
            BEGIN MORTALITY SCAN
          </button>
        </div>
        </>
      ) : (
        /* Scanning Animation */
        <div className="scanning-section">
          <div className="scanning-skull">💀</div>
          <h2 className="scanning-title">ANALYZING MORTALITY...</h2>
          <div className="scanning-progress">
            <div className="progress-number">{scanProgress}%</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          <div className="scanning-status">
            {scanProgress > 20 && <div className="status-item">✓ Facial health markers detected</div>}
            {scanProgress > 40 && <div className="status-item">✓ Stress patterns analyzed</div>}
            {scanProgress > 60 && <div className="status-item">✓ Genetic indicators processed</div>}
            {scanProgress > 80 && <div className="status-item">✓ Environmental risks calculated</div>}
          </div>
        </div>
      )}
        {/* Hero Section */}
        <div className="hero-section">
          <div className="skull-animation">💀</div>
          <h1 className="app-title">DEATHCAST</h1>
          <p className="app-tagline">AI-Powered Mortality Prediction & Death Markets</p>
          <p className="app-subtitle">
            Know when you'll die. Bet on it. Profit from death.
          </p>
        </div>

        {/* Feature Showcase */}
        <div className="feature-showcase">
          <h2 className="features-title">🚀 POWERED BY CUTTING-EDGE TECHNOLOGY</h2>
          <div className="feature-display">
            <div className="feature-icon">{features[currentFeature].icon}</div>
            <h3 className="feature-title">{features[currentFeature].title}</h3>
            <p className="feature-description">{features[currentFeature].description}</p>
            <p className="feature-tech">{features[currentFeature].tech}</p>
          </div>

          <div className="feature-dots">
            {features.map((_, index) => (
              <button
                key={index}
                className={`feature-dot ${index === currentFeature ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button className="primary-cta" onClick={startDeathPrediction}>
            <span className="cta-text">ENTER DEATHCAST</span>
            <span className="cta-subtext">Full Experience</span>
          </button>

          <button className="secondary-cta" onClick={skipToDemo}>
            SKIP TO RESULTS
          </button>
        </div>



        {/* Footer */}
        <div className="landing-footer">
          <p className="disclaimer">
            ⚠️ For entertainment purposes only. Not actual medical advice.
          </p>
          <p className="copyright">
            © 2024 DeathCast. Built for Hackathon. Predicting mortality since today.
          </p>
        </div>
      </div>
    </div>
  );
}
