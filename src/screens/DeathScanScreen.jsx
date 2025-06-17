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
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          detectFaceFeatures();
        };
      }

      setHasPermission(true);
      setError(null);

    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      setError('Camera access is required for mortality analysis. Please enable camera permissions and refresh the page.');
    }
  };

  const startDeathScan = async () => {
    if (!faceData) {
      setError('No face detected. Please ensure your face is visible in the camera.');
      return;
    }

    try {
      startScanning();
      setScanDetails([]);
      setError(null);
      
      // Play dramatic heartbeat sound
      try {
        await playDramaticSound('heartbeat');
      } catch (soundError) {
        console.warn('Sound effects not available:', soundError);
      }
      
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
        progress += Math.random() * 15 + 5;
        
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
    } catch (error) {
      console.error('Scan initialization failed:', error);
      setError('Failed to start mortality scan. Please try again.');
    }
  };

  const completeScanning = async () => {
    try {
      // Collect all data for mortality analysis
      const location = await getCurrentLocation();
      const healthFactors = await collectHealthData();
      const lifestyle = await analyzePhoneUsage();
      
      const mortalityData = await analyzeMortality({
        face: faceData,
        location: location,
        health: healthFactors,
        lifestyle: lifestyle,
        user: user,
      });
      
      setDeathPrediction(mortalityData);
      navigate('/death-result');
    } catch (error) {
      console.error('Mortality analysis failed:', error);
      setError(`Mortality analysis failed: ${error.message}`);
      // Reset scanning state
      updateScanProgress(0);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
          (error) => {
            console.warn('Geolocation failed:', error);
            // Default to a major city if geolocation fails
            resolve({ latitude: 40.7128, longitude: -74.0060 }); // NYC
          }
        );
      } else {
        resolve({ latitude: 40.7128, longitude: -74.0060 });
      }
    });
  };

  const collectHealthData = async () => {
    // Simulate health data collection
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
      if (!videoRef.current) return;

      // Basic face detection simulation
      // In a real implementation, this would use TensorFlow.js or similar
      setFaceData({
        smilingProbability: 0.6 + Math.random() * 0.4,
        leftEyeOpenProbability: 0.8 + Math.random() * 0.2,
        rightEyeOpenProbability: 0.8 + Math.random() * 0.2,
        landmarks: {
          // Simulated facial landmarks
          nose: { x: 320, y: 240 },
          leftEye: { x: 280, y: 200 },
          rightEye: { x: 360, y: 200 },
          mouth: { x: 320, y: 280 }
        },
        bounds: { x: 100, y: 100, width: 200, height: 200 }
      });
    } catch (error) {
      console.error('Face detection failed:', error);
      setError('Face detection failed. Please ensure good lighting and try again.');
    }
  };

  const analyzePhoneUsage = async () => {
    // Simulate digital lifestyle analysis
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
          {error && <p style={{ color: '#ff6666', marginTop: '10px' }}>{error}</p>}
          <button onClick={requestCameraPermission} className="primary-button">
            Try Again
          </button>
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

      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 0, 0, 0.9)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          zIndex: 1000,
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

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