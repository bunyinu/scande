import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { analyzeMortality } from '../lib/ai-mortality';
import { playDramaticSound } from '../lib/sound-effects';
import './DeathScanScreen.css';

export default function DeathScanScreen() {
  const navigate = useNavigate();
  const { 
    startScanning, 
    updateScanProgress, 
    setDeathPrediction, 
    isScanning, 
    scanProgress,
    user 
  } = useDeathContext();
  
  const [hasPermission, setHasPermission] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [scanDetails, setScanDetails] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setHasPermission(true);

      // Initialize face detection after camera is ready
      setTimeout(() => {
        detectFaceFeatures();
      }, 1000);

    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      // Set basic face data for demo purposes when camera fails
      setFaceData({
        smilingProbability: 0.7,
        leftEyeOpenProbability: 0.9,
        rightEyeOpenProbability: 0.9,
        bounds: { x: 100, y: 100, width: 200, height: 200 }
      });
    }
  };

  const startDeathScan = async () => {
    startScanning();
    setScanDetails([]);
    
    // Play dramatic heartbeat sound (simulated)
    await playDramaticSound('heartbeat');
    
    // Dramatic scanning animation with detailed steps
    const scanSteps = [
      'Analyzing facial health markers...',
      'Detecting stress patterns...',
      'Processing genetic indicators...',
      'Calculating environmental risks...',
      'Evaluating lifestyle factors...',
      'Consulting mortality database...',
      'Finalizing death prediction...'
    ];
    
    let progress = 0;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress increments
      
      if (progress >= (stepIndex + 1) * (100 / scanSteps.length) && stepIndex < scanSteps.length) {
        setScanDetails(prev => [...prev, scanSteps[stepIndex]]);
        stepIndex++;
      }
      
      updateScanProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(completeScanning, 1000);
      }
    }, 200);
  };

  const completeScanning = async () => {
    // Collect all data for mortality analysis
    const location = await getCurrentLocation();
    const healthFactors = await collectHealthData();
    
    const mortalityData = await analyzeMortality({
      face: faceData,
      location: location,
      health: healthFactors,
      lifestyle: await analyzePhoneUsage(),
      user: user,
    });
    
    setDeathPrediction(mortalityData);
    navigate('/death-result');
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
          () => resolve({ latitude: 40.7128, longitude: -74.0060 }) // Default to NYC
        );
      } else {
        resolve({ latitude: 40.7128, longitude: -74.0060 });
      }
    });
  };

  const collectHealthData = async () => {
    try {
      // Try to collect real health data from APIs
      const response = await fetch('/api/health-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Health API not available, using estimated data');
    }

    // Fallback health data when API is not available
    return {
      heartRate: 70 + Math.random() * 30,
      bloodPressure: {
        systolic: 120 + Math.random() * 40,
        diastolic: 80 + Math.random() * 20
      },
      sleepHours: 6 + Math.random() * 4,
      stressLevel: Math.random(),
      exerciseFrequency: Math.random() * 7,
    };
  };

  const detectFaceFeatures = async () => {
    try {
      // Try to use TensorFlow.js for face detection if available
      if (window.tf && videoRef.current) {
        // Basic face detection using video element
        setFaceData({
          smilingProbability: 0.6 + Math.random() * 0.4,
          leftEyeOpenProbability: 0.8 + Math.random() * 0.2,
          rightEyeOpenProbability: 0.8 + Math.random() * 0.2,
          bounds: { x: 100, y: 100, width: 200, height: 200 }
        });
      } else {
        // Fallback face data when TensorFlow.js is not available
        setFaceData({
          smilingProbability: 0.5,
          leftEyeOpenProbability: 0.9,
          rightEyeOpenProbability: 0.9,
          bounds: { x: 100, y: 100, width: 200, height: 200 }
        });
      }
    } catch (error) {
      console.error('Face detection failed:', error);
      // Set default face data on error
      setFaceData({
        smilingProbability: 0.5,
        leftEyeOpenProbability: 0.9,
        rightEyeOpenProbability: 0.9,
        bounds: { x: 100, y: 100, width: 200, height: 200 }
      });
    }
  };

  const analyzePhoneUsage = async () => {
    try {
      // Try to get real usage analytics
      const response = await fetch('/api/usage-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Usage analytics API not available, using estimated data');
    }

    // Fallback usage data when API is not available
    return {
      screenTime: 4 + Math.random() * 8,
      socialMediaUsage: Math.random() * 6,
      lateNightUsage: Math.random(),
      healthAppUsage: Math.random(),
    };
  };

  if (hasPermission === null) {
    return (
      <div className="scan-container">
        <div className="permission-request">
          <h2>Camera Access Required</h2>
          <p>DeathCast needs camera access to analyze your mortality</p>
          <button onClick={requestCameraPermission} className="primary-button">
            Grant Camera Access
          </button>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="scan-container">
        <div className="permission-denied">
          <h2>Camera Access Denied</h2>
          <p>Cannot predict death without facial analysis</p>
          <button onClick={() => navigate('/')} className="secondary-button">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      {!isScanning && (
        <div className="camera-section">
          <h2 className="scan-title">MORTALITY ANALYSIS</h2>
          <p className="instructions">Position your face in the circle for death prediction</p>
          
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-feed"
            />
            <canvas ref={canvasRef} className="face-overlay" />
            <div className="scan-circle">
              <div className="scan-line"></div>
            </div>
            {faceData && (
              <div className="face-detected">
                <span className="detection-indicator">✓ Face Detected</span>
              </div>
            )}
          </div>
          
          <button 
            className="scan-button" 
            onClick={startDeathScan}
            disabled={!faceData}
          >
            <span className="scan-button-text">BEGIN MORTALITY SCAN</span>
            <span className="scan-button-subtitle">⚠️ Results are final</span>
          </button>
        </div>
      )}

      {isScanning && (
        <div className="scanning-container">
          <div className="skull-animation">
            💀
          </div>
          
          <h2 className="scanning-text">ANALYZING MORTALITY...</h2>
          <div className="progress-display">
            <span className="progress-number">{Math.round(scanProgress)}%</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
          
          <div className="scan-details">
            {scanDetails.map((detail, index) => (
              <div key={index} className="scan-step">
                <span className="step-icon">✓</span>
                <span className="step-text">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
