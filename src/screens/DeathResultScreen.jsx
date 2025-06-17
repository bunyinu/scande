import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { createDeathMarket } from '../lib/algorand-market';
import { announceDeathPrediction, generateVoice, playAudio, deathVoices } from '../lib/elevenlabs';
import { createDeathPrediction, createDeathMarket as createSupabaseMarket } from '../lib/supabase';
import moment from 'moment';
import './DeathResultScreen.css';

export default function DeathResultScreen() {
  const navigate = useNavigate();
  const { currentPrediction, setMarketData, user } = useDeathContext();
  const [timeLeft, setTimeLeft] = useState(null);
  const [marketCreated, setMarketCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('grim_reaper');
  const [playingVoice, setPlayingVoice] = useState(false);

  useEffect(() => {
    if (!currentPrediction) {
      navigate('/death-scan');
      return;
    }

    initializeResult();
  }, [currentPrediction, navigate]);

  useEffect(() => {
    if (currentPrediction) {
      // Calculate initial time
      calculateTimeRemaining();
      
      // Set up timer to update every second
      const timer = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentPrediction]);

  const initializeResult = async () => {
    try {
      calculateTimeRemaining();
      await createMarketplace();
      await announceResult();
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize result:', error);
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!currentPrediction?.deathDate) {
      console.warn('No death date available for countdown');
      return;
    }

    const deathMoment = moment(currentPrediction.deathDate);
    const now = moment();
    const duration = moment.duration(deathMoment.diff(now));

    // If death date has passed, show zeros
    if (duration.asMilliseconds() <= 0) {
      setTimeLeft({
        years: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      });
      return;
    }

    const timeRemaining = {
      years: Math.floor(duration.asYears()),
      days: Math.floor(duration.asDays() % 365),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
      total: duration.asMilliseconds()
    };

    setTimeLeft(timeRemaining);
  };

  const createMarketplace = async () => {
    try {
      // Save prediction to database
      const savedPrediction = await createDeathPrediction(currentPrediction);
      
      // Create Supabase market
      const market = await createSupabaseMarket(savedPrediction.id);
      
      // Create Algorand market (blockchain)
      const algorandMarket = await createDeathMarket({
        userId: currentPrediction.userId,
        deathDate: currentPrediction.deathDate,
        confidence: currentPrediction.confidence,
        cause: currentPrediction.cause,
      });

      setMarketData({
        ...market,
        algorandMarketId: algorandMarket.marketId,
        total_pool: Math.floor(Math.random() * 10000), // Simulate initial pool
        bet_count: Math.floor(Math.random() * 50),
      });

      setMarketCreated(true);
    } catch (error) {
      console.error('Failed to create marketplace:', error);
      // Continue without market for demo
      setMarketCreated(true);
    }
  };

  const announceResult = async () => {
    try {
      await announceDeathPrediction({
        ...currentPrediction,
        userName: user?.name || 'Anonymous',
        marketPool: Math.floor(Math.random() * 10000),
      });
    } catch (error) {
      console.error('Failed to announce result:', error);
    }
  };

  const shareDeathDate = async () => {
    const shareData = {
      title: 'My Death Prediction - DeathCast',
      text: `DeathCast predicted I'll die on ${moment(currentPrediction.deathDate).format('MMMM DD, YYYY')}. Current betting pool: $${currentPrediction.marketPool || 0}. Think I'll live longer? Bet on it! 💀`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        alert('Death prediction copied to clipboard!');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const purchaseLifeExtension = () => {
    navigate('/pay-to-live');
  };

  const downloadCertificate = () => {
    if (!currentPrediction) return;

    // Create certificate content
    const certificateContent = generateCertificateHTML(currentPrediction, user);

    // Create a new window for printing/saving
    const printWindow = window.open('', '_blank');
    printWindow.document.write(certificateContent);
    printWindow.document.close();

    // Auto-trigger print dialog (user can save as PDF)
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateCertificateHTML = (prediction, user) => {
    const userName = user?.name || 'Anonymous Mortal';
    const deathDate = moment(prediction.deathDate).format('MMMM DD, YYYY');
    const confidence = prediction.confidence;
    const cause = prediction.cause;
    const daysRemaining = moment(prediction.deathDate).diff(moment(), 'days');
    const certificateId = `DC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DeathCast Mortality Prediction Certificate</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%);
            color: #fff;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .certificate {
            border: 8px solid #ff0000;
            padding: 60px;
            text-align: center;
            background: rgba(17, 17, 17, 0.9);
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
            position: relative;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header {
            margin-bottom: 40px;
          }
          .logo {
            font-size: 4rem;
            margin-bottom: 20px;
          }
          .title {
            font-size: 2.5rem;
            color: #ff0000;
            font-weight: bold;
            letter-spacing: 3px;
            margin-bottom: 10px;
            text-shadow: 0 0 20px #ff0000;
          }
          .subtitle {
            font-size: 1.2rem;
            color: #ccc;
            margin-bottom: 40px;
          }
          .content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .certificate-text {
            font-size: 1.3rem;
            line-height: 2;
            margin-bottom: 40px;
          }
          .name {
            font-size: 2rem;
            color: #ff0000;
            font-weight: bold;
            text-decoration: underline;
            margin: 20px 0;
          }
          .death-details {
            background: rgba(255, 0, 0, 0.1);
            border: 2px solid #ff0000;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
          }
          .death-date {
            font-size: 1.8rem;
            color: #ff0000;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
          }
          .detail-item {
            text-align: left;
          }
          .detail-label {
            color: #999;
            font-size: 0.9rem;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #fff;
            font-size: 1.1rem;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            border-top: 2px solid #333;
            padding-top: 30px;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-bottom: 2px solid #666;
            margin-bottom: 10px;
            height: 40px;
            display: flex;
            align-items: end;
            justify-content: center;
            font-style: italic;
            color: #999;
          }
          .signature-label {
            color: #ccc;
            font-size: 0.9rem;
          }
          .certificate-id {
            color: #666;
            font-size: 0.8rem;
            margin-top: 20px;
          }
          .disclaimer {
            background: rgba(255, 255, 0, 0.1);
            border: 1px solid rgba(255, 255, 0, 0.3);
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
          }
          .disclaimer-text {
            color: #ffff99;
            font-size: 0.8rem;
            line-height: 1.4;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 6rem;
            color: rgba(255, 0, 0, 0.1);
            z-index: 0;
            pointer-events: none;
          }
          .content-wrapper {
            position: relative;
            z-index: 1;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="watermark">💀 DEATHCAST 💀</div>
          <div class="content-wrapper">
            <div class="header">
              <div class="logo">💀</div>
              <div class="title">DEATHCAST</div>
              <div class="subtitle">Official Mortality Prediction Certificate</div>
            </div>

            <div class="content">
              <div class="certificate-text">
                This is to certify that
                <div class="name">${userName}</div>
                has been officially analyzed by our advanced AI mortality prediction system
                and has received their personalized death forecast.
              </div>

              <div class="death-details">
                <div class="death-date">Predicted Death Date: ${deathDate}</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Days Remaining:</div>
                    <div class="detail-value">${daysRemaining} days</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Confidence Level:</div>
                    <div class="detail-value">${confidence}%</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Predicted Cause:</div>
                    <div class="detail-value">${cause}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Analysis Date:</div>
                    <div class="detail-value">${moment().format('MMMM DD, YYYY')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line">Dr. Death AI</div>
                  <div class="signature-label">Chief Mortality Officer</div>
                </div>
                <div class="signature">
                  <div class="signature-line">Grim Reaper</div>
                  <div class="signature-label">Death Verification Specialist</div>
                </div>
              </div>

              <div class="certificate-id">
                Certificate ID: ${certificateId}<br>
                Generated: ${moment().format('MMMM DD, YYYY [at] h:mm A')}
              </div>

              <div class="disclaimer">
                <div class="disclaimer-text">
                  ⚠️ DISCLAIMER: This certificate is for entertainment purposes only.
                  DeathCast predictions are not medical advice and should not be used for
                  life planning, insurance, or any serious decisions. Actual death dates
                  may vary significantly from predictions. Please consult real medical
                  professionals for health concerns.
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const testVoice = async (voiceType) => {
    if (playingVoice) return;

    setPlayingVoice(true);
    setSelectedVoice(voiceType);

    try {
      const testMessage = `Hello! This is the ${deathVoices[voiceType].description}. ${deathVoices[voiceType].personality}`;
      const audioUrl = await generateVoice(testMessage, voiceType);
      if (audioUrl) {
        await playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setPlayingVoice(false);
    }
  };

  const replayDeathAnnouncement = async () => {
    if (playingVoice) return;

    setPlayingVoice(true);
    try {
      await announceDeathPrediction({
        ...currentPrediction,
        userName: user?.name || 'Anonymous',
        marketPool: marketStats?.total_pool || 0,
      });
    } catch (error) {
      console.error('Announcement replay failed:', error);
    } finally {
      setPlayingVoice(false);
    }
  };

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading-result">
          <div className="skull-loading">💀</div>
          <p>Processing your mortality...</p>
        </div>
      </div>
    );
  }

  if (!currentPrediction) {
    return (
      <div className="result-container">
        <div className="no-prediction">
          <h2>No Death Prediction Found</h2>
          <button onClick={() => navigate('/death-scan')} className="primary-button">
            Get Death Prediction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="result-content">
        <div className="verdict-header">
          <h1 className="verdict">YOUR DEATH HAS BEEN CALCULATED</h1>
        </div>

        <div className="death-date-section">
          <p className="death-date-label">YOU WILL DIE ON</p>
          <h2 className="death-date">
            {moment(currentPrediction.deathDate).format('MMMM DD, YYYY')}
          </h2>
          <p className="death-time">
            at approximately {moment(currentPrediction.deathDate).format('h:mm A')}
          </p>
        </div>

        <div className="cause-section">
          <p className="cause-label">CAUSE OF DEATH</p>
          <h3 className="cause">{currentPrediction.cause}</h3>
          <p className="confidence">
            Confidence: {currentPrediction.confidence}%
          </p>
        </div>

        {/* COUNTDOWN TIMER - This is the key section */}
        {timeLeft && (
          <div className="countdown-section">
            <p className="time-left-label">TIME REMAINING UNTIL DEATH</p>
            <div className="time-boxes">
              <TimeBox value={timeLeft.years} label="YEARS" />
              <TimeBox value={timeLeft.days} label="DAYS" />
              <TimeBox value={timeLeft.hours} label="HOURS" />
              <TimeBox value={timeLeft.minutes} label="MINUTES" />
              <TimeBox value={timeLeft.seconds} label="SECONDS" />
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px', 
              color: '#666',
              fontSize: '0.9rem'
            }}>
              Live countdown to your predicted death date
            </div>
          </div>
        )}

        <div className="market-section">
          <h3 className="market-title">DEATH PREDICTION MARKET</h3>
          <div className="pool-amount">${currentPrediction.marketPool || 0}</div>
          <p className="pool-label">Current Betting Pool</p>
          
          <div className="odds-grid">
            <OddsBox label="Dies Before" odds="2.3x" />
            <OddsBox label="Dies On Time" odds="50x" />
            <OddsBox label="Dies After" odds="1.8x" />
          </div>

          <button 
            className="bet-button"
            onClick={() => navigate('/marketplace')}
          >
            ENTER DEATH MARKET
          </button>
        </div>

        <div className="voice-section">
          <h3 className="section-title">🎭 CHOOSE YOUR DEATH ANNOUNCER</h3>
          <div className="voice-grid">
            {Object.entries(deathVoices).map(([voiceKey, voice]) => (
              <button
                key={voiceKey}
                className={`voice-option ${selectedVoice === voiceKey ? 'selected' : ''}`}
                onClick={() => testVoice(voiceKey)}
                disabled={playingVoice}
              >
                <div className="voice-name">
                  {voiceKey.replace('_', ' ').toUpperCase()}
                </div>
                <div className="voice-description">
                  {voice.description}
                </div>
                <div className="voice-personality">
                  {voice.personality}
                </div>
              </button>
            ))}
          </div>

          <button
            className="replay-button"
            onClick={replayDeathAnnouncement}
            disabled={playingVoice}
          >
            {playingVoice ? '🔊 PLAYING...' : '🔊 REPLAY DEATH ANNOUNCEMENT'}
          </button>
        </div>

        <div className="actions-section">
          <button className="primary-button" onClick={purchaseLifeExtension}>
            <span className="button-text">PAY TO LIVE LONGER</span>
            <span className="button-subtext">Starting at $9.99/month</span>
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate('/landing')}
          >
            🏠 LANDING PAGE
          </button>

          <button className="secondary-button" onClick={shareDeathDate}>
            SHARE DEATH DATE
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate('/legacy')}
          >
            CREATE DIGITAL LEGACY
          </button>
        </div>

        <div className="certificate-section">
          <button
            className="certificate-button"
            onClick={downloadCertificate}
          >
            📜 Download Death Prediction Certificate
          </button>
          <p className="certificate-info">
            Get your official mortality prediction certificate (PDF format)
          </p>
        </div>
      </div>
    </div>
  );
}

const TimeBox = ({ value, label }) => (
  <div className="time-box">
    <div className="time-value">{value || 0}</div>
    <div className="time-label">{label}</div>
  </div>
);

const OddsBox = ({ label, odds }) => (
  <div className="odds-box">
    <div className="odds-label">{label}</div>
    <div className="odds-value">{odds}</div>
  </div>
);