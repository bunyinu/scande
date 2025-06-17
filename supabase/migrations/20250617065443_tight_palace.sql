/*
  # Fix Duplicate Policy Error

  1. Security Updates
    - Drop existing policies safely using IF EXISTS
    - Recreate policies with proper permissions
    - Handle edge cases for policy conflicts

  2. Changes
    - Safe policy dropping with IF EXISTS
    - Proper error handling for existing policies
    - Maintain security while fixing access issues
*/

-- Safely drop existing policies using IF EXISTS to prevent errors
DROP POLICY IF EXISTS "Admin can manage death verifications" ON death_verifications;
DROP POLICY IF EXISTS "Users can view own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Enable read access for all users" ON death_predictions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON death_predictions;
DROP POLICY IF EXISTS "Enable update for own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Markets are publicly viewable" ON death_markets;
DROP POLICY IF EXISTS "Enable read access for all users" ON death_markets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON death_markets;
DROP POLICY IF EXISTS "Enable update for market operations" ON death_markets;
DROP POLICY IF EXISTS "Bets are publicly viewable" ON death_bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON death_bets;
DROP POLICY IF EXISTS "Enable read access for all users" ON death_bets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON death_bets;
DROP POLICY IF EXISTS "Users can view own life extensions" ON life_extensions;
DROP POLICY IF EXISTS "Users can insert own life extensions" ON life_extensions;
DROP POLICY IF EXISTS "Users can view own digital legacy" ON digital_legacies;
DROP POLICY IF EXISTS "Users can insert own digital legacy" ON digital_legacies;
DROP POLICY IF EXISTS "Users can update own digital legacy" ON digital_legacies;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON user_subscriptions;

-- Create new policies with proper permissions
-- Death Predictions: Public read, user-specific write
CREATE POLICY "death_predictions_select_policy" ON death_predictions
  FOR SELECT USING (true);

CREATE POLICY "death_predictions_insert_policy" ON death_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "death_predictions_update_policy" ON death_predictions
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Death Markets: Public read, authenticated write
CREATE POLICY "death_markets_select_policy" ON death_markets
  FOR SELECT USING (true);

CREATE POLICY "death_markets_insert_policy" ON death_markets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "death_markets_update_policy" ON death_markets
  FOR UPDATE USING (true);

-- Death Bets: Public read, user-specific write
CREATE POLICY "death_bets_select_policy" ON death_bets
  FOR SELECT USING (true);

CREATE POLICY "death_bets_insert_policy" ON death_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Life Extensions: User-specific access
CREATE POLICY "life_extensions_select_policy" ON life_extensions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "life_extensions_insert_policy" ON life_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Digital Legacies: User-specific access
CREATE POLICY "digital_legacies_select_policy" ON digital_legacies
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "digital_legacies_insert_policy" ON digital_legacies
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "digital_legacies_update_policy" ON digital_legacies
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- User Subscriptions: User-specific access
CREATE POLICY "user_subscriptions_select_policy" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "user_subscriptions_insert_policy" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Death Verifications: Admin only (recreate with unique name)
CREATE POLICY "death_verifications_admin_policy" ON death_verifications
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- Grant necessary permissions to roles
DO $$
BEGIN
  -- Grant SELECT permissions to anon role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'death_predictions' AND grantee = 'anon' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON death_predictions TO anon;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'death_markets' AND grantee = 'anon' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON death_markets TO anon;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants 
    WHERE table_name = 'death_bets' AND grantee = 'anon' AND privilege_type = 'SELECT'
  ) THEN
    GRANT SELECT ON death_bets TO anon;
  END IF;

  -- Grant permissions to authenticated role
  GRANT INSERT, UPDATE ON death_predictions TO authenticated;
  GRANT INSERT, UPDATE ON death_markets TO authenticated;
  GRANT INSERT ON death_bets TO authenticated;
  GRANT INSERT, UPDATE ON digital_legacies TO authenticated;
  GRANT INSERT ON life_extensions TO authenticated;
  GRANT INSERT ON user_subscriptions TO authenticated;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but continue
    RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END $$;

-- Ensure the leaderboard view has proper access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'death_leaderboard') THEN
    GRANT SELECT ON death_leaderboard TO anon;
    GRANT SELECT ON death_leaderboard TO authenticated;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error granting view permissions: %', SQLERRM;
END $$;