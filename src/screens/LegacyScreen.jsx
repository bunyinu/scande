import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { lastWordsRecording } from '../lib/elevenlabs';
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
  const [saving, setSaving] = useState(false);

  // Load existing legacy data on component mount
  useEffect(() => {
    const loadExistingLegacy = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/legacy/${user.id}`);
        if (response.ok) {
          const legacyData = await response.json();
          setLastWords(legacyData.lastWords || '');
          setDigitalAssets(legacyData.digitalAssets || {
            socialMedia: '',
            photos: '',
            documents: '',
            crypto: '',
          });
          setBeneficiaries(legacyData.beneficiaries || [
            { name: '', email: '', relationship: '' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load existing legacy:', error);
      }
    };

    loadExistingLegacy();
  }, [user?.id]);

  const handleSaveLegacy = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    setSaving(true);

    try {
      // Validate required fields
      if (!lastWords.trim()) {
        // Show error message without alert
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
          <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 102, 102, 0.95);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 10000;
            text-align: center;
            border: 2px solid #ff6666;
          ">
            ⚠️ Last Words Required<br>
            <small>Please enter your final message in the text area above before saving your legacy.</small>
          </div>
        `;
        document.body.appendChild(errorMessage);

        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 4000);

        setSaving(false);
        return;
      }

      const validBeneficiaries = beneficiaries.filter(b => b.name && b.email);
      if (validBeneficiaries.length === 0) {
        alert('Please add at least one beneficiary with name and email.');
        setSaving(false);
        return;
      }

      // Record last words
      await lastWordsRecording({
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Anonymous',
        message: lastWords,
      });

      // Save digital legacy to database
      const legacyData = {
        userId: user?.id,
        lastWords,
        digitalAssets,
        beneficiaries: validBeneficiaries,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyData)
      });

      if (!response.ok) {
        throw new Error('Failed to save legacy');
      }

      console.log('Digital legacy saved successfully');

      // Show success message without alert (which can cause refresh)
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

      // Show error message without alert
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 0, 0, 0.9);
          color: white;
          padding: 20px 40px;
          border-radius: 10px;
          font-size: 1.2rem;
          font-weight: bold;
          z-index: 10000;
          text-align: center;
        ">
          ❌ Failed to Save Legacy<br>
          <small>Please try again.</small>
        </div>
      `;
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
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
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={beneficiary.email}
                      onChange={(e) => updateBeneficiary(index, 'email', e.target.value)}
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
                      className="remove-beneficiary"
                      onClick={() => removeBeneficiary(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button className="add-beneficiary" onClick={addBeneficiary}>
                + Add Beneficiary
              </button>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">⚰️ Funeral Preferences</h3>
            <div className="funeral-options">
              <label className="checkbox-item">
                <input type="checkbox" />
                <span>Burial</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                <span>Cremation</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                <span>Donate to Science</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
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
