import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeathContext } from '../context/DeathContext';
import { supabase, placeBet as placeBetSupabase, getBets } from '../lib/supabase';
import { placeBet as placeBetAlgorand, getMarketStatus } from '../lib/algorand-market';
import { marketUpdateAnnouncement } from '../lib/elevenlabs';
import moment from 'moment';
import './MarketplaceScreen.css';

export default function MarketplaceScreen() {
  const navigate = useNavigate();
  const { currentPrediction, marketData, addBet, user } = useDeathContext();
  const [bets, setBets] = useState([]);
  const [betAmount, setBetAmount] = useState('');
  const [selectedBetType, setSelectedBetType] = useState(null);
  const [marketStats, setMarketStats] = useState({
    total_pool: 0,
    bet_count: 0,
    odds: { before: 2.3, exact: 50.0, after: 1.8 }
  });
  const [loading, setLoading] = useState(true);
  const [placingBet, setPlacingBet] = useState(false);

  useEffect(() => {
    if (!currentPrediction) {
      navigate('/death-scan');
      return;
    }

    loadMarketData();
    subscribeToUpdates();
  }, [currentPrediction, navigate]);

  const loadMarketData = async () => {
    try {
      // Load market data from Supabase
      if (marketData?.id) {
        const marketBets = await getBets(marketData.id);
        setBets(marketBets || []);
      }

      // Get Algorand market status
      if (marketData?.algorandMarketId) {
        const algorandStatus = await getMarketStatus(marketData.algorandMarketId);
        if (algorandStatus) {
          setMarketStats(prev => ({
            ...prev,
            ...algorandStatus,
          }));
        }
      }

      // Simulate some market activity for demo
      setMarketStats(prev => ({
        ...prev,
        total_pool: prev.total_pool + Math.floor(Math.random() * 1000),
        bet_count: prev.bet_count + Math.floor(Math.random() * 5),
      }));

      setLoading(false);
    } catch (error) {
      console.error('Failed to load market data:', error);
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!marketData?.id) return;

    try {
      const subscription = supabase
        .channel(`market_updates_${Date.now()}`) // Unique channel name
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'death_bets' },
          (payload) => {
            console.log('New bet placed:', payload);
            if (payload.eventType === 'INSERT') {
              setBets(prev => [payload.new, ...prev]);
              setMarketStats(prev => ({
                ...prev,
                total_pool: prev.total_pool + payload.new.amount,
                bet_count: prev.bet_count + 1,
              }));
            }
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('Real-time updates not available, using demo mode:', error.message);
      return () => {}; // No-op cleanup function
    }
  };

  const placeBetOnDeath = async () => {
    if (!selectedBetType || !betAmount || placingBet) return;

    setPlacingBet(true);

    try {
      const amount = parseFloat(betAmount);
      const potentialPayout = calculatePayout(selectedBetType, amount);

      // Place bet on Algorand blockchain
      const algorandBet = await placeBetAlgorand(
        marketData?.algorandMarketId || 'demo_market',
        selectedBetType,
        amount
      );

      // Record in Supabase database
      const betData = {
        marketId: marketData?.id || 'demo_market',
        userId: user?.id || 'anonymous',
        betType: selectedBetType,
        amount: amount,
        potentialPayout: potentialPayout,
      };

      const supabaseBet = await placeBetSupabase(betData);

      // Update local state
      const newBet = {
        ...supabaseBet,
        algorandTxId: algorandBet.transactionId,
      };

      addBet(newBet);
      setBets(prev => [newBet, ...prev]);

      // Update market stats
      setMarketStats(prev => ({
        ...prev,
        total_pool: prev.total_pool + amount,
        bet_count: prev.bet_count + 1,
      }));

      // Announce market update
      await marketUpdateAnnouncement({
        totalPool: marketStats.total_pool + amount,
        newBets: 1,
        odds: marketStats.odds,
      });

      // Reset form
      setBetAmount('');
      setSelectedBetType(null);

      alert(`Bet placed successfully! Transaction ID: ${algorandBet.transactionId}`);

    } catch (error) {
      console.error('Failed to place bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setPlacingBet(false);
    }
  };

  const calculatePayout = (type, amount) => {
    const odds = marketStats.odds[type] || 1;
    return parseFloat(amount) * odds;
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div className="loading-marketplace">
          <div className="skull-loading">💀</div>
          <p>Loading death market...</p>
        </div>
      </div>
    );
  }

  if (!currentPrediction) {
    return (
      <div className="marketplace-container">
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
    <div className="marketplace-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="marketplace-content">
        <div className="market-header">
          <h1 className="market-title">DEATH PREDICTION MARKET</h1>
          <p className="market-subtitle">
            Subject dies: {moment(currentPrediction.deathDate).format('MMM DD, YYYY')}
          </p>
          <div className="subject-info">
            <span className="subject-name">{user?.name || 'Anonymous'}</span>
            <span className="confidence">Confidence: {currentPrediction.confidence}%</span>
          </div>
        </div>

        <div className="pool-section">
          <div className="pool-display">
            <span className="pool-label">TOTAL DEATH POOL</span>
            <span className="pool-amount">${marketStats.total_pool.toLocaleString()}</span>
            <span className="bet-count">{marketStats.bet_count} bets placed</span>
          </div>
        </div>

        <div className="betting-section">
          <h3 className="section-title">PLACE YOUR BET</h3>
          
          <div className="bet-options">
            <button
              className={`bet-option ${selectedBetType === 'before' ? 'selected' : ''}`}
              onClick={() => setSelectedBetType('before')}
            >
              <div className="bet-option-content">
                <span className="bet-title">DIES BEFORE</span>
                <span className="bet-description">Dies before predicted date</span>
                <span className="odds">{marketStats.odds.before}x payout</span>
              </div>
            </button>

            <button
              className={`bet-option ${selectedBetType === 'exact' ? 'selected' : ''}`}
              onClick={() => setSelectedBetType('exact')}
            >
              <div className="bet-option-content">
                <span className="bet-title">DIES ON EXACT DATE</span>
                <span className="bet-description">Dies on predicted date</span>
                <span className="odds">{marketStats.odds.exact}x payout</span>
              </div>
            </button>

            <button
              className={`bet-option ${selectedBetType === 'after' ? 'selected' : ''}`}
              onClick={() => setSelectedBetType('after')}
            >
              <div className="bet-option-content">
                <span className="bet-title">DIES AFTER</span>
                <span className="bet-description">Dies after predicted date</span>
                <span className="odds">{marketStats.odds.after}x payout</span>
              </div>
            </button>
          </div>

          <div className="bet-input-section">
            <input
              type="number"
              className="bet-input"
              placeholder="Bet amount ($)"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max="10000"
            />

            {selectedBetType && betAmount && (
              <div className="payout-preview">
                <span className="payout-label">Potential payout:</span>
                <span className="payout-amount">
                  ${calculatePayout(selectedBetType, betAmount).toFixed(2)}
                </span>
              </div>
            )}

            <button
              className="place-bet-button"
              onClick={placeBetOnDeath}
              disabled={!selectedBetType || !betAmount || placingBet}
            >
              {placingBet ? 'PLACING BET...' : 'PLACE BET ON DEATH'}
            </button>
          </div>
        </div>

        <div className="recent-bets-section">
          <h3 className="section-title">RECENT DEATH BETS</h3>
          <div className="bets-list">
            {bets.length === 0 ? (
              <div className="no-bets">
                <p>No bets placed yet. Be the first to bet on this death!</p>
              </div>
            ) : (
              bets.slice(0, 10).map((bet, index) => (
                <div key={bet.id || index} className="bet-item">
                  <div className="bet-info">
                    <span className="bet-type">{bet.bet_type?.toUpperCase()}</span>
                    <span className="bet-amount">${bet.amount}</span>
                  </div>
                  <div className="bet-details">
                    <span className="potential-payout">
                      Potential: ${bet.potential_payout?.toFixed(2)}
                    </span>
                    <span className="bet-time">
                      {moment(bet.placed_at).fromNow()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="market-disclaimer">
          <div className="disclaimer-content">
            <h4>⚠️ MARKET DISCLAIMER</h4>
            <ul>
              <li>This is a prediction market for entertainment purposes only</li>
              <li>All bets are final and cannot be refunded</li>
              <li>Payouts occur only upon verified death confirmation</li>
              <li>Market operates on Algorand blockchain for transparency</li>
              <li>DeathCast is not responsible for prediction accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
