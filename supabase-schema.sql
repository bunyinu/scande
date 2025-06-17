-- Supabase Database Schema for DeathCast
-- For Startup Challenge ($25k)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Death Predictions Table
CREATE TABLE death_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  death_date TIMESTAMP NOT NULL,
  cause_of_death TEXT NOT NULL,
  confidence_percentage DECIMAL(5,2),
  days_remaining INTEGER,
  market_id TEXT, -- Algorand market ID
  risk_factors JSONB DEFAULT '{}',
  preventable_factor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Death Markets Table
CREATE TABLE death_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES death_predictions,
  algorand_market_id TEXT,
  total_pool DECIMAL(10,2) DEFAULT 0,
  bet_count INTEGER DEFAULT 0,
  odds JSONB DEFAULT '{"before": 2.5, "exact": 50.0, "after": 1.8}',
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Death Bets Table
CREATE TABLE death_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID REFERENCES death_markets,
  user_id UUID REFERENCES auth.users,
  bet_type VARCHAR, -- 'before', 'exact', 'after'
  amount DECIMAL(10,2),
  potential_payout DECIMAL(10,2),
  algorand_tx_id TEXT,
  status VARCHAR DEFAULT 'active',
  placed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life Extensions Table
CREATE TABLE life_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  prediction_id UUID REFERENCES death_predictions,
  original_death_date TIMESTAMP,
  new_death_date TIMESTAMP,
  days_added INTEGER,
  method VARCHAR, -- 'subscription', 'challenge', 'purchase'
  product_id VARCHAR,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Death Verifications Table (controversial but necessary)
CREATE TABLE death_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES death_predictions,
  actual_death_date TIMESTAMP,
  verified_by VARCHAR, -- 'user_report', 'news_article', 'obituary', 'oracle'
  verification_source TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.95,
  payout_triggered BOOLEAN DEFAULT false,
  oracle_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Legacy Table
CREATE TABLE digital_legacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  last_words TEXT,
  digital_assets JSONB DEFAULT '{}',
  beneficiaries JSONB DEFAULT '[]',
  funeral_preferences JSONB DEFAULT '{}',
  voice_recording_url TEXT,
  delivery_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  product_id VARCHAR NOT NULL,
  subscription_id VARCHAR,
  status VARCHAR DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revenue_cat_data JSONB DEFAULT '{}'
);

-- Leaderboard View
CREATE VIEW death_leaderboard AS
SELECT 
  dp.id,
  dp.user_id,
  u.email as user_email,
  dp.death_date,
  dp.cause_of_death,
  dp.confidence_percentage,
  dp.days_remaining,
  dm.total_pool,
  dm.bet_count,
  dp.created_at
FROM death_predictions dp
LEFT JOIN death_markets dm ON dp.id = dm.prediction_id
LEFT JOIN auth.users u ON dp.user_id = u.id
ORDER BY dp.confidence_percentage DESC, dm.total_pool DESC;

-- Indexes for performance
CREATE INDEX idx_death_predictions_user_id ON death_predictions(user_id);
CREATE INDEX idx_death_predictions_death_date ON death_predictions(death_date);
CREATE INDEX idx_death_markets_prediction_id ON death_markets(prediction_id);
CREATE INDEX idx_death_bets_market_id ON death_bets(market_id);
CREATE INDEX idx_death_bets_user_id ON death_bets(user_id);
CREATE INDEX idx_life_extensions_user_id ON life_extensions(user_id);

-- Real-time subscriptions setup
ALTER TABLE death_markets REPLICA IDENTITY FULL;
ALTER TABLE death_bets REPLICA IDENTITY FULL;
ALTER TABLE death_predictions REPLICA IDENTITY FULL;

-- Row Level Security (RLS) Policies
ALTER TABLE death_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_legacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own predictions
CREATE POLICY "Users can view own predictions" ON death_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON death_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Markets are public for viewing
CREATE POLICY "Markets are publicly viewable" ON death_markets
  FOR SELECT USING (true);

-- Users can view all bets but only insert their own
CREATE POLICY "Bets are publicly viewable" ON death_bets
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own bets" ON death_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own life extensions
CREATE POLICY "Users can view own life extensions" ON life_extensions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life extensions" ON life_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own digital legacy
CREATE POLICY "Users can view own digital legacy" ON digital_legacies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digital legacy" ON digital_legacies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digital legacy" ON digital_legacies
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for market operations
CREATE OR REPLACE FUNCTION update_market_pool(market_id UUID, bet_amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE death_markets 
  SET 
    total_pool = total_pool + bet_amount,
    bet_count = bet_count + 1,
    updated_at = NOW()
  WHERE id = market_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate market odds
CREATE OR REPLACE FUNCTION calculate_market_odds(market_id UUID)
RETURNS JSONB AS $$
DECLARE
  before_bets DECIMAL := 0;
  exact_bets DECIMAL := 0;
  after_bets DECIMAL := 0;
  total_pool DECIMAL := 0;
  odds JSONB;
BEGIN
  -- Get bet totals by type
  SELECT 
    COALESCE(SUM(CASE WHEN bet_type = 'before' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN bet_type = 'exact' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN bet_type = 'after' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0)
  INTO before_bets, exact_bets, after_bets, total_pool
  FROM death_bets db
  JOIN death_markets dm ON db.market_id = dm.id
  WHERE dm.id = market_id;
  
  -- Calculate odds (simplified)
  IF total_pool > 0 THEN
    odds := jsonb_build_object(
      'before', CASE WHEN before_bets > 0 THEN ROUND((total_pool / before_bets)::numeric, 2) ELSE 2.5 END,
      'exact', CASE WHEN exact_bets > 0 THEN ROUND((total_pool / exact_bets)::numeric, 2) ELSE 50.0 END,
      'after', CASE WHEN after_bets > 0 THEN ROUND((total_pool / after_bets)::numeric, 2) ELSE 1.8 END
    );
  ELSE
    odds := '{"before": 2.5, "exact": 50.0, "after": 1.8}'::jsonb;
  END IF;
  
  -- Update market odds
  UPDATE death_markets SET odds = odds WHERE id = market_id;
  
  RETURN odds;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update market odds when bets are placed
CREATE OR REPLACE FUNCTION trigger_update_odds()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_market_odds(NEW.market_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_odds_on_bet
  AFTER INSERT ON death_bets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_odds();

-- Function to trigger death verification payouts
CREATE OR REPLACE FUNCTION process_death_verification(pred_id UUID, actual_date TIMESTAMP)
RETURNS void AS $$
DECLARE
  predicted_date TIMESTAMP;
  winning_type VARCHAR;
  market_record RECORD;
BEGIN
  -- Get prediction details
  SELECT death_date INTO predicted_date
  FROM death_predictions
  WHERE id = pred_id;
  
  -- Determine winning bet type
  IF actual_date < predicted_date THEN
    winning_type := 'before';
  ELSIF actual_date::date = predicted_date::date THEN
    winning_type := 'exact';
  ELSE
    winning_type := 'after';
  END IF;
  
  -- Get market info
  SELECT * INTO market_record
  FROM death_markets
  WHERE prediction_id = pred_id;
  
  -- Mark winning bets (in a real system, this would trigger payouts)
  UPDATE death_bets
  SET status = 'won'
  WHERE market_id = market_record.id AND bet_type = winning_type;
  
  UPDATE death_bets
  SET status = 'lost'
  WHERE market_id = market_record.id AND bet_type != winning_type;
  
  -- Mark market as closed
  UPDATE death_markets
  SET status = 'closed'
  WHERE id = market_record.id;
  
END;
$$ LANGUAGE plpgsql;
