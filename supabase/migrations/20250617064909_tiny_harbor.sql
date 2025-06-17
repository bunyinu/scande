/*
  # Create DeathCast Application Tables

  1. New Tables
    - `death_predictions` - Stores AI-generated mortality predictions
    - `death_markets` - Betting markets for death predictions  
    - `death_bets` - Individual bets placed on death markets
    - `life_extensions` - Records of life extension purchases/activities
    - `death_verifications` - Verification records for actual deaths
    - `digital_legacies` - User's digital legacy content and preferences
    - `user_subscriptions` - Subscription management for premium features

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for user data access
    - Public read access for markets and leaderboards
    - Private access for personal predictions and legacy data

  3. Features
    - Real-time betting market odds calculation
    - Automated payout processing on death verification
    - Digital legacy delivery system
    - Comprehensive analytics and leaderboards
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Death Predictions Table
CREATE TABLE IF NOT EXISTS death_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  death_date timestamp NOT NULL,
  cause_of_death text NOT NULL,
  confidence_percentage decimal(5,2),
  days_remaining integer,
  market_id text,
  risk_factors jsonb DEFAULT '{}',
  preventable_factor text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Death Markets Table
CREATE TABLE IF NOT EXISTS death_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES death_predictions(id) ON DELETE CASCADE,
  algorand_market_id text,
  total_pool decimal(10,2) DEFAULT 0,
  bet_count integer DEFAULT 0,
  odds jsonb DEFAULT '{"before": 2.5, "exact": 50.0, "after": 1.8}',
  status varchar DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Death Bets Table
CREATE TABLE IF NOT EXISTS death_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES death_markets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_type varchar,
  amount decimal(10,2),
  potential_payout decimal(10,2),
  algorand_tx_id text,
  status varchar DEFAULT 'active',
  placed_at timestamptz DEFAULT now()
);

-- Life Extensions Table
CREATE TABLE IF NOT EXISTS life_extensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id uuid REFERENCES death_predictions(id) ON DELETE CASCADE,
  original_death_date timestamp,
  new_death_date timestamp,
  days_added integer,
  method varchar,
  product_id varchar,
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Death Verifications Table
CREATE TABLE IF NOT EXISTS death_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES death_predictions(id) ON DELETE CASCADE,
  actual_death_date timestamp,
  verified_by varchar,
  verification_source text,
  confidence_score decimal(3,2) DEFAULT 0.95,
  payout_triggered boolean DEFAULT false,
  oracle_signature text,
  created_at timestamptz DEFAULT now()
);

-- Digital Legacy Table
CREATE TABLE IF NOT EXISTS digital_legacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_words text,
  digital_assets jsonb DEFAULT '{}',
  beneficiaries jsonb DEFAULT '[]',
  funeral_preferences jsonb DEFAULT '{}',
  voice_recording_url text,
  delivery_triggered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id varchar NOT NULL,
  subscription_id varchar,
  status varchar DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  revenue_cat_data jsonb DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_death_predictions_user_id ON death_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_death_predictions_death_date ON death_predictions(death_date);
CREATE INDEX IF NOT EXISTS idx_death_markets_prediction_id ON death_markets(prediction_id);
CREATE INDEX IF NOT EXISTS idx_death_bets_market_id ON death_bets(market_id);
CREATE INDEX IF NOT EXISTS idx_death_bets_user_id ON death_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_life_extensions_user_id ON life_extensions(user_id);

-- Enable Row Level Security
ALTER TABLE death_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_legacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for death_predictions
CREATE POLICY "Users can view own predictions"
  ON death_predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON death_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for death_markets (public viewing)
CREATE POLICY "Markets are publicly viewable"
  ON death_markets
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for death_bets
CREATE POLICY "Bets are publicly viewable"
  ON death_bets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own bets"
  ON death_bets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for life_extensions
CREATE POLICY "Users can view own life extensions"
  ON life_extensions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life extensions"
  ON life_extensions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for death_verifications (admin only for now)
CREATE POLICY "Admin can manage death verifications"
  ON death_verifications
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for digital_legacies
CREATE POLICY "Users can view own digital legacy"
  ON digital_legacies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digital legacy"
  ON digital_legacies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digital legacy"
  ON digital_legacies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard view
CREATE OR REPLACE VIEW death_leaderboard AS
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

-- Functions for market operations
CREATE OR REPLACE FUNCTION update_market_pool(market_id uuid, bet_amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE death_markets 
  SET 
    total_pool = total_pool + bet_amount,
    bet_count = bet_count + 1,
    updated_at = now()
  WHERE id = market_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate market odds
CREATE OR REPLACE FUNCTION calculate_market_odds(market_id uuid)
RETURNS jsonb AS $$
DECLARE
  before_bets decimal := 0;
  exact_bets decimal := 0;
  after_bets decimal := 0;
  total_pool decimal := 0;
  odds jsonb;
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN bet_type = 'before' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN bet_type = 'exact' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN bet_type = 'after' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0)
  INTO before_bets, exact_bets, after_bets, total_pool
  FROM death_bets db
  JOIN death_markets dm ON db.market_id = dm.id
  WHERE dm.id = market_id;
  
  IF total_pool > 0 THEN
    odds := jsonb_build_object(
      'before', CASE WHEN before_bets > 0 THEN ROUND((total_pool / before_bets)::numeric, 2) ELSE 2.5 END,
      'exact', CASE WHEN exact_bets > 0 THEN ROUND((total_pool / exact_bets)::numeric, 2) ELSE 50.0 END,
      'after', CASE WHEN after_bets > 0 THEN ROUND((total_pool / after_bets)::numeric, 2) ELSE 1.8 END
    );
  ELSE
    odds := '{"before": 2.5, "exact": 50.0, "after": 1.8}'::jsonb;
  END IF;
  
  UPDATE death_markets SET odds = odds WHERE id = market_id;
  
  RETURN odds;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update market odds when bets are placed
CREATE OR REPLACE FUNCTION trigger_update_odds()
RETURNS trigger AS $$
BEGIN
  PERFORM calculate_market_odds(NEW.market_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_odds_on_bet'
  ) THEN
    CREATE TRIGGER update_odds_on_bet
      AFTER INSERT ON death_bets
      FOR EACH ROW
      EXECUTE FUNCTION trigger_update_odds();
  END IF;
END $$;