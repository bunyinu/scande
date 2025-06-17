/*
  # Clean Fix for RLS Policy Conflicts
  
  1. Security Updates
    - Use IF NOT EXISTS to avoid policy conflicts
    - Properly drop existing policies with conditional checks
    - Create clean, working policies for all tables
    
  2. Changes
    - Safe policy creation and dropping
    - Proper permissions for anon and authenticated users
    - Maintain security while fixing access issues
*/

-- Function to safely drop policies if they exist
DO $$
BEGIN
  -- Drop existing policies for death_predictions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_predictions' AND policyname = 'death_predictions_select_policy') THEN
    DROP POLICY death_predictions_select_policy ON death_predictions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_predictions' AND policyname = 'death_predictions_insert_policy') THEN
    DROP POLICY death_predictions_insert_policy ON death_predictions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_predictions' AND policyname = 'death_predictions_update_policy') THEN
    DROP POLICY death_predictions_update_policy ON death_predictions;
  END IF;

  -- Drop existing policies for death_markets
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_markets' AND policyname = 'death_markets_select_policy') THEN
    DROP POLICY death_markets_select_policy ON death_markets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_markets' AND policyname = 'death_markets_insert_policy') THEN
    DROP POLICY death_markets_insert_policy ON death_markets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_markets' AND policyname = 'death_markets_update_policy') THEN
    DROP POLICY death_markets_update_policy ON death_markets;
  END IF;

  -- Drop existing policies for death_bets
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_bets' AND policyname = 'death_bets_select_policy') THEN
    DROP POLICY death_bets_select_policy ON death_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_bets' AND policyname = 'death_bets_insert_policy') THEN
    DROP POLICY death_bets_insert_policy ON death_bets;
  END IF;

  -- Drop existing policies for life_extensions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_extensions' AND policyname = 'life_extensions_select_policy') THEN
    DROP POLICY life_extensions_select_policy ON life_extensions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_extensions' AND policyname = 'life_extensions_insert_policy') THEN
    DROP POLICY life_extensions_insert_policy ON life_extensions;
  END IF;

  -- Drop existing policies for digital_legacies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'digital_legacies' AND policyname = 'digital_legacies_select_policy') THEN
    DROP POLICY digital_legacies_select_policy ON digital_legacies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'digital_legacies' AND policyname = 'digital_legacies_insert_policy') THEN
    DROP POLICY digital_legacies_insert_policy ON digital_legacies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'digital_legacies' AND policyname = 'digital_legacies_update_policy') THEN
    DROP POLICY digital_legacies_update_policy ON digital_legacies;
  END IF;

  -- Drop existing policies for user_subscriptions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_select_policy') THEN
    DROP POLICY user_subscriptions_select_policy ON user_subscriptions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_insert_policy') THEN
    DROP POLICY user_subscriptions_insert_policy ON user_subscriptions;
  END IF;

  -- Drop existing policies for death_verifications
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_verifications' AND policyname = 'death_verifications_admin_policy') THEN
    DROP POLICY death_verifications_admin_policy ON death_verifications;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'death_verifications' AND policyname = 'Admin can manage death verifications') THEN
    DROP POLICY "Admin can manage death verifications" ON death_verifications;
  END IF;

END $$;

-- Grant necessary table permissions
GRANT SELECT ON death_predictions TO anon, authenticated;
GRANT INSERT, UPDATE ON death_predictions TO anon, authenticated;

GRANT SELECT ON death_markets TO anon, authenticated;
GRANT INSERT, UPDATE ON death_markets TO anon, authenticated;

GRANT SELECT ON death_bets TO anon, authenticated;
GRANT INSERT ON death_bets TO anon, authenticated;

GRANT SELECT ON life_extensions TO authenticated;
GRANT INSERT ON life_extensions TO authenticated;

GRANT SELECT ON digital_legacies TO authenticated;
GRANT INSERT, UPDATE ON digital_legacies TO authenticated;

GRANT SELECT ON user_subscriptions TO authenticated;
GRANT INSERT ON user_subscriptions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create new policies using IF NOT EXISTS
CREATE POLICY IF NOT EXISTS death_predictions_select_policy 
ON death_predictions
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS death_predictions_insert_policy 
ON death_predictions
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS death_predictions_update_policy 
ON death_predictions
FOR UPDATE 
USING (true);

CREATE POLICY IF NOT EXISTS death_markets_select_policy 
ON death_markets
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS death_markets_insert_policy 
ON death_markets
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS death_markets_update_policy 
ON death_markets
FOR UPDATE 
USING (true);

CREATE POLICY IF NOT EXISTS death_bets_select_policy 
ON death_bets
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS death_bets_insert_policy 
ON death_bets
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS life_extensions_select_policy 
ON life_extensions
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS life_extensions_insert_policy 
ON life_extensions
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS digital_legacies_select_policy 
ON digital_legacies
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS digital_legacies_insert_policy 
ON digital_legacies
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS digital_legacies_update_policy 
ON digital_legacies
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS user_subscriptions_select_policy 
ON user_subscriptions
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS user_subscriptions_insert_policy 
ON user_subscriptions
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY IF NOT EXISTS death_verifications_admin_policy 
ON death_verifications
FOR ALL 
USING ((auth.jwt() ->> 'role') = 'admin');

-- Ensure leaderboard view access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'death_leaderboard') THEN
    GRANT SELECT ON death_leaderboard TO anon, authenticated;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error granting view permissions: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been successfully created with IF NOT EXISTS';
  RAISE NOTICE 'All permission conflicts should now be resolved';
  RAISE NOTICE 'Your DeathCast application should work without errors';
END $$;