# 🗄️ Database Setup Instructions

## ⚠️ CRITICAL: Database Tables Missing

The error you're seeing indicates that the Supabase database tables haven't been created yet. Follow these steps to set up your database:

## 🚀 Quick Setup (Required)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `aloinmadrxbjfywagtgg`

### Step 2: Create Database Tables
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `supabase-schema.sql` (provided below)
4. Click **"Run"** to execute the SQL

### Step 3: Verify Tables Created
After running the SQL, you should see these tables in your database:
- `death_predictions`
- `death_markets` 
- `death_bets`
- `life_extensions`
- `death_verifications`
- `digital_legacies`
- `user_subscriptions`

## 📋 Complete SQL Schema

```sql
-- Supabase Database Schema for DeathCast
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Death Predictions Table
CREATE TABLE IF NOT EXISTS death_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  death_date TIMESTAMP NOT NULL,
  cause_of_death TEXT NOT NULL,
  confidence_percentage DECIMAL(5,2),
  days_remaining INTEGER,
  market_id TEXT,
  risk_factors JSONB DEFAULT '{}',
  preventable_factor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Death Markets Table
CREATE TABLE IF NOT EXISTS death_markets (
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
CREATE TABLE IF NOT EXISTS death_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID REFERENCES death_markets,
  user_id UUID REFERENCES auth.users,
  bet_type VARCHAR,
  amount DECIMAL(10,2),
  potential_payout DECIMAL(10,2),
  algorand_tx_id TEXT,
  status VARCHAR DEFAULT 'active',
  placed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life Extensions Table
CREATE TABLE IF NOT EXISTS life_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  prediction_id UUID REFERENCES death_predictions,
  original_death_date TIMESTAMP,
  new_death_date TIMESTAMP,
  days_added INTEGER,
  method VARCHAR,
  product_id VARCHAR,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Death Verifications Table
CREATE TABLE IF NOT EXISTS death_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES death_predictions,
  actual_death_date TIMESTAMP,
  verified_by VARCHAR,
  verification_source TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.95,
  payout_triggered BOOLEAN DEFAULT false,
  oracle_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Legacy Table
CREATE TABLE IF NOT EXISTS digital_legacies (
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
CREATE TABLE IF NOT EXISTS user_subscriptions (
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_death_predictions_user_id ON death_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_death_predictions_death_date ON death_predictions(death_date);
CREATE INDEX IF NOT EXISTS idx_death_markets_prediction_id ON death_markets(prediction_id);
CREATE INDEX IF NOT EXISTS idx_death_bets_market_id ON death_bets(market_id);
CREATE INDEX IF NOT EXISTS idx_death_bets_user_id ON death_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_life_extensions_user_id ON life_extensions(user_id);

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
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_market_odds(NEW.market_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_odds_on_bet ON death_bets;
CREATE TRIGGER update_odds_on_bet
  AFTER INSERT ON death_bets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_odds();
```

## ✅ After Running the SQL

1. **Refresh your app** - The database errors should be resolved
2. **Test the death scan** - Try getting a mortality prediction
3. **Check the leaderboard** - Should now load without errors
4. **Verify data persistence** - Your predictions will be saved

## 🔧 Troubleshooting

If you still see errors after running the SQL:

1. **Check Supabase logs** in your dashboard
2. **Verify RLS policies** are enabled
3. **Ensure your API keys** are correct in `.env`
4. **Try refreshing** the browser page

## 🎯 Next Steps

Once the database is set up:
1. Test all features end-to-end
2. Deploy to production
3. Your app is ready for worldwide use! 🌍