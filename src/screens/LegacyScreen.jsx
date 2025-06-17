import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { lastWordsRecording } from '../lib/elevenlabs';
import { saveDigitalLegacy, getDigitalLegacy } from '../lib/supabase';
import './LegacyScreen.css';

export default function LegacyScreen() {
  const navigate = useNavigate();
  const { currentPrediction, user } = useDeathContext();
  const [lastWords, setLastWords] = useState('');
  const [digitalAssets, setDigitalAssets] = useState({
    socialMedia: '',
    photos: '',
    documents: '',
    crypto: '',
  });
  const [beneficiaries, setBeneficiaries] = useState([
    { name: '', email: '', relationship: '' }
  ]);
  const [funeralPreferences, setFuneralPreferences] = useState({
    burial: false,
    cremation: false,
    donateToScience: false,
    cryogenicPreservation: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing legacy data on component mount
  useEffect(() => {
    const loadExistingLegacy = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const legacyData = await getDigitalLegacy(user.id);
        if (legacyData) {
          setLastWords(legacyData.last_words || '');
          setDigitalAssets(legacyData.digital_assets || {
            socialMedia: '',
            photos: '',
            documents: '',
            crypto: '',
          });
          setBeneficiaries(legacyData.beneficiaries || [
            { name: '', email: '', relationship: '' }
          ]);
          setFuneralPreferences(legacyData.funeral_preferences || {
            burial: false,
            cremation: false,
            donateToScience: false,
            cryogenicPreservation: false,
          });
        }
      } catch (error) {
        console.error('Failed to load existing legacy:', error);
        setError('Failed to load existing legacy data');
      } finally {
        setLoading(false);
      }
    };

    loadExistingLegacy();
  }, [user?.id]);

  const handleSaveLegacy = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!lastWords.trim()) {
        throw new Error('Last words are required');
      }

      const validBeneficiaries = beneficiaries.filter(b => b.name && b.email);
      if (validBeneficiaries.length === 0) {
        throw new Error('Please add at least one beneficiary with name and email');
      }

      // Record last words
      let voiceRecordingUrl = null;
      try {
        voiceRecordingUrl = await lastWordsRecording({
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous',
          message: lastWords,
        });
      } catch (voiceError) {
        console.error('Voice recording failed:', voiceError);
        // Continue without voice recording
      }

      // Save digital legacy to database
      const legacyData = {
        userId: user?.id,
        lastWords,
        digitalAssets,
        beneficiaries: validBeneficiaries,
        funeralPreferences,
        voiceRecordingUrl,
      };

      await saveDigitalLegacy(legacyData);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 255, 0, 0.9);
          color: black;
          padding: 20px 40px;
          border-radius: 10px;
          font-size: 1.2rem;
          font-weight: bold;
          z-index: 10000;
          text-align: center;
        ">
          ✅ Digital Legacy Saved Successfully!<br>
          <small>Your loved ones will receive your final messages upon death verification.</small>
        </div>
      `;
      document.body.appendChild(successMessage);

      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
        navigate('/death-result');
      }, 3000);

    } catch (error) {
      console.error('Failed to save legacy:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', email: '', relationship: '' }]);
  };

  const updateBeneficiary = (index, field, value) => {
    const updated = [...beneficiaries];
    updated[index][field] = value;
    setBeneficiaries(updated);
  };

  const removeBeneficiary = (index) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const handleFuneralPreferenceChange = (preference) => {
    setFuneralPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  if (!currentPrediction) {
    return (
      <div className="legacy-container">
        <div className="no-prediction">
          <h2>No Death Prediction Found</h2>
          <button onClick={() => navigate('/death-scan')} className="primary-button">
            Get Death Prediction First
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="legacy-container">
        <div className="loading">
          <div className="skull-loading">💀</div>
          <p>Loading digital legacy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="legacy-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="legacy-content">
        <div className="header">
          <h1 className="title">CREATE DIGITAL LEGACY</h1>
          <p className="subtitle">Prepare your final messages and digital inheritance</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid #ff0000',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            color: '#ff0000',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form className="legacy-form" onSubmit={handleSaveLegacy}>
          <div className="section">
            <h3 className="section-title">📝 Last Words</h3>
            <p className="section-description">
              Record your final message to be delivered to loved ones upon death verification
            </p>
            <div style={{ position: 'relative' }}>
              <textarea
                className="last-words-input"
                placeholder="Enter your final words here... (Required)"
                value={lastWords}
                onChange={(e) => setLastWords(e.target.value)}
                rows={6}
                required
                style={{
                  border: lastWords.trim() ? '2px solid #9966ff' : '2px solid #ff6666',
                  boxShadow: lastWords.trim() ? '0 0 10px rgba(153, 102, 255, 0.3)' : '0 0 10px rgba(255, 102, 102, 0.3)'
                }}
              />
              {!lastWords.trim() && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  background: '#ff6666',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  REQUIRED
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">💾 Digital Assets</h3>
            <p className="section-description">
              Specify how your digital assets should be handled
            </p>
            <div className="assets-grid">
              <div className="asset-item">
                <label>Social Media Accounts</label>
                <input
                  type="text"
                  placeholder="Instructions for social media..."
                  value={digitalAssets.socialMedia}
                  onChange={(e) => setDigitalAssets({...digitalAssets, socialMedia: e.target.value})}
                />
              </div>
              <div className="asset-item">
                <label>Photos & Videos</label>
                <input
                  type="text"
                  placeholder="Photo storage instructions..."
                  value={digitalAssets.photos}
                  onChange={(e) => setDigitalAssets({...digitalAssets, photos: e.target.value})}
                />
              </div>
              <div className="asset-item">
                <label>Important Documents</label>
                <input
                  type="text"
                  placeholder="Document locations..."
                  value={digitalAssets.documents}
                  onChange={(e) => setDigitalAssets({...digitalAssets, documents: e.target.value})}
                />
              </div>
              <div className="asset-item">
                <label>Cryptocurrency</label>
                <input
                  type="text"
                  placeholder="Wallet information..."
                  value={digitalAssets.crypto}
                  onChange={(e) => setDigitalAssets({...digitalAssets, crypto: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">👥 Beneficiaries</h3>
            <p className="section-description">
              Who should receive your digital legacy?
            </p>
            <div className="beneficiaries-list">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="beneficiary-item">
                  <div className="beneficiary-inputs">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={beneficiary.name}
                      onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={beneficiary.email}
                      onChange={(e) => updateBeneficiary(index, 'email', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={beneficiary.relationship}
                      onChange={(e) => updateBeneficiary(index, 'relationship', e.target.value)}
                    />
                  </div>
                  {beneficiaries.length > 1 && (
                    <button
                      type="button"
                      className="remove-beneficiary"
                      onClick={() => removeBeneficiary(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-beneficiary" onClick={addBeneficiary}>
                + Add Beneficiary
              </button>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">⚰️ Funeral Preferences</h3>
            <div className="funeral-options">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={funeralPreferences.burial}
                  onChange={() => handleFuneralPreferenceChange('burial')}
                />
                <span>Burial</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox"
                  checked={funeralPreferences.cremation}
                  onChange={() => handleFuneralPreferenceChange('cremation')}
                />
                <span>Cremation</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox"
                  checked={funeralPreferences.donateToScience}
                  onChange={() => handleFuneralPreferenceChange('donateToScience')}
                />
                <span>Donate to Science</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox"
                  checked={funeralPreferences.cryogenicPreservation}
                  onChange={() => handleFuneralPreferenceChange('cryogenicPreservation')}
                />
                <span>Cryogenic Preservation</span>
              </label>
            </div>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'SAVING LEGACY...' : 'SAVE DIGITAL LEGACY'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/death-result')}
            >
              Back to Results
            </button>
          </div>
        </form>

        <div className="legacy-info">
          <h4>🔒 Privacy & Security</h4>
          <ul>
            <li>Your legacy is encrypted and stored securely</li>
            <li>Messages are only delivered upon verified death</li>
            <li>Beneficiaries are notified automatically</li>
            <li>You can update your legacy anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}