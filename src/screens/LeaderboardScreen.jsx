import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../lib/supabase';
import moment from 'moment';
import './LeaderboardScreen.css';

export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      
      // Add some mock data for demo
      const mockData = [
        {
          id: 1,
          user_name: 'Death Defier',
          death_date: moment().add(50, 'years').toISOString(),
          confidence_percentage: 95,
          cause_of_death: 'Old age',
          death_markets: { total_pool: 50000, bet_count: 200 }
        },
        {
          id: 2,
          user_name: 'Mortal Mike',
          death_date: moment().add(2, 'years').toISOString(),
          confidence_percentage: 89,
          cause_of_death: 'Heart attack',
          death_markets: { total_pool: 25000, bet_count: 150 }
        },
        {
          id: 3,
          user_name: 'Risky Rachel',
          death_date: moment().add(6, 'months').toISOString(),
          confidence_percentage: 78,
          cause_of_death: 'Extreme sports accident',
          death_markets: { total_pool: 75000, bet_count: 300 }
        }
      ];

      setLeaderboard(data.length > 0 ? data : mockData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">
          <div className="skull-loading">💀</div>
          <p>Loading death leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Built with Bolt.new Badge - REQUIRED */}
      <div className="bolt-badge">
        <span className="bolt-text">⚡ Built with Bolt.new</span>
      </div>

      <div className="leaderboard-content">
        <div className="header">
          <h1 className="title">DEATH LEADERBOARD</h1>
          <p className="subtitle">Who's closest to death?</p>
        </div>

        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className={`leaderboard-item rank-${index + 1}`}>
              <div className="rank">
                <span className="rank-number">#{index + 1}</span>
                {index === 0 && <span className="crown">👑</span>}
              </div>
              
              <div className="user-info">
                <span className="user-name">{entry.user_name || 'Anonymous'}</span>
                <span className="death-date">
                  Dies: {moment(entry.death_date).format('MMM DD, YYYY')}
                </span>
                <span className="cause">{entry.cause_of_death}</span>
              </div>

              <div className="stats">
                <div className="confidence">
                  <span className="stat-value">{entry.confidence_percentage}%</span>
                  <span className="stat-label">Confidence</span>
                </div>
                <div className="market-pool">
                  <span className="stat-value">${entry.death_markets?.total_pool || 0}</span>
                  <span className="stat-label">Market Pool</span>
                </div>
                <div className="days-left">
                  <span className="stat-value">
                    {moment(entry.death_date).diff(moment(), 'days')}
                  </span>
                  <span className="stat-label">Days Left</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={() => navigate('/death-scan')} className="primary-button">
            Get Your Death Prediction
          </button>
          <button onClick={() => navigate('/')} className="secondary-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
