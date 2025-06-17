import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { lifeExtensionCelebration } from '../lib/elevenlabs';
import { recordLifeExtension } from '../lib/supabase';
import moment from 'moment';
import './PayToLiveScreen.css';

const LIFE_PACKAGES = {
  basic: {
    id: 'life_extension_basic',
    name: 'Life Extension Basic',
    price: 9.99,
    period: 'monthly',
    daysAdded: 30,
    features: [
      'Daily mortality reduction tips',
      'Danger alerts based on location',
      'Health optimization recommendations',
      'Add up to 5 years to prediction',
    ],
  },
  pro: {
    id: 'life_extension_pro',
    name: 'Life Extension Pro',
    price: 49.99,
    period: 'monthly',
    daysAdded: 90,
    features: [
      'Everything in Basic',
      'AI health coach',
      'Real-time risk monitoring',
      'Emergency response system',
      'Add up to 15 years to prediction',
    ],
  },
  immortality: {
    id: 'immortality_package',
    name: 'Immortality Package',
    price: 199.99,
    period: 'monthly',
    daysAdded: 365,
    features: [
      'Everything in Pro',
      'Quantum life extension therapy',
      'Digital consciousness backup',
      'Clone preparation service',
      'Theoretical immortality',
    ],
  },
  insurance: {
    id: 'death_insurance',
    name: 'Death Insurance',
    price: 19.99,
    period: 'monthly',
    daysAdded: 0,
    features: [
      'If we predict correctly, your family gets $50,000',
      'Covers funeral expenses',
      'Digital legacy preservation',
      'Last words delivery service',
    ],
  },
};

export default function PayToLiveScreen() {
  const navigate = useNavigate();
  const { currentPrediction, extendLife, user } = useDeathContext();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const purchaseLifeExtension = async (packageKey) => {
    if (purchasing) return;
    
    setPurchasing(true);
    const package_ = LIFE_PACKAGES[packageKey];

    // Process real payment through RevenueCat
    const response = await fetch('/api/purchase-life-extension', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
        packageKey,
        currentPrediction
      })
    });

    if (!response.ok) {
      throw new Error('Purchase failed');
    }

    const result = await response.json();

    // Update context with new death date
    extendLife({
      newDeathDate: result.newDeathDate,
      newTimeRemaining: calculateTimeRemaining(moment(result.newDeathDate)),
    });

    // Celebrate with voice announcement
    await lifeExtensionCelebration({
      daysAdded: package_.daysAdded,
      newDeathDate: result.newDeathDate,
    });

    alert(`Congratulations! You've extended your life by ${package_.daysAdded} days!`);
    navigate('/death-result');

    setPurchasing(false);
  };



  const calculateTimeRemaining = (deathDate) => {
    const now = moment();
    const duration = moment.duration(deathDate.diff(now));
    
    return {
      years: Math.floor(duration.asYears()),
      days: Math.floor(duration.asDays() % 365),
      hours: duration.hours(),
      minutes: duration.minutes(),
    };
  };

  if (!currentPrediction) {
    return (
      <div className="pay-to-live-container">
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
    <div className="pay-to-live-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="pay-to-live-content">
        <div className="header-section">
          <h1 className="page-title">EXTEND YOUR LIFE</h1>
          <p className="page-subtitle">Choose your path to immortality</p>
          
          <div className="current-prediction">
            <div className="death-info">
              <span className="death-label">Current Death Date:</span>
              <span className="death-date">
                {moment(currentPrediction.deathDate).format('MMMM DD, YYYY')}
              </span>
            </div>
            <div className="days-remaining">
              <span className="days-number">
                {moment(currentPrediction.deathDate).diff(moment(), 'days')}
              </span>
              <span className="days-label">days remaining</span>
            </div>
          </div>
        </div>

        <div className="packages-section">
          <h2 className="packages-title">LIFE EXTENSION PACKAGES</h2>
          
          <div className="packages-grid">
            {Object.entries(LIFE_PACKAGES).map(([key, package_]) => (
              <div
                key={key}
                className={`package-card ${selectedPackage === key ? 'selected' : ''} ${key === 'immortality' ? 'premium' : ''}`}
                onClick={() => setSelectedPackage(key)}
              >
                <div className="package-header">
                  <h3 className="package-name">{package_.name}</h3>
                  <div className="package-price">
                    <span className="price-amount">${package_.price}</span>
                    <span className="price-period">/{package_.period}</span>
                  </div>
                </div>

                {package_.daysAdded > 0 && (
                  <div className="days-added">
                    <span className="days-number">+{package_.daysAdded}</span>
                    <span className="days-label">days added</span>
                  </div>
                )}

                <div className="package-features">
                  {package_.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="purchase-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    purchaseLifeExtension(key);
                  }}
                  disabled={purchasing}
                >
                  {purchasing ? 'PROCESSING...' : 'PURCHASE NOW'}
                </button>

                {key === 'immortality' && (
                  <div className="premium-badge">
                    <span>👑 PREMIUM</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials-section">
          <h3 className="testimonials-title">CUSTOMER TESTIMONIALS</h3>
          <div className="testimonials-grid">
            <div className="testimonial">
              <p>"DeathCast predicted I'd die in 2023, but I bought the Pro package and I'm still alive in 2024! Worth every penny!"</p>
              <span className="testimonial-author">- Sarah M. (Still Alive)</span>
            </div>
            <div className="testimonial">
              <p>"The Immortality Package changed my life. I haven't aged a day since subscribing!"</p>
              <span className="testimonial-author">- John D. (Immortal)</span>
            </div>
            <div className="testimonial">
              <p>"My death prediction was wrong by 50 years thanks to the Basic plan. Highly recommend!"</p>
              <span className="testimonial-author">- Mary K. (Defied Death)</span>
            </div>
          </div>
        </div>

        <div className="guarantee-section">
          <h3 className="guarantee-title">💀 DEATH-BACK GUARANTEE</h3>
          <p className="guarantee-text">
            If you die within 30 days of purchase, we'll refund your subscription and resurrect you for free!*
          </p>
          <p className="guarantee-disclaimer">
            *Resurrection not guaranteed. Side effects may include zombie-like symptoms.
          </p>
        </div>

        <div className="actions-section">
          <button 
            className="secondary-button"
            onClick={() => navigate('/death-result')}
          >
            Return to Death Results
          </button>
        </div>
      </div>
    </div>
  );
}
