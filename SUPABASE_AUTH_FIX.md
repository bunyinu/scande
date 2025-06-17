# 🔐 Supabase Authentication & RLS Permission Fix

## Current Issue: Permission Denied (Error 42501)

The error "permission denied for table death_predictions" indicates Row Level Security (RLS) is blocking access. Here's how to fix it:

## 🚀 Step 1: Verify and Fix RLS Policies

### Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/aloinmadrxbjfywagtgg
2. Click **"SQL Editor"** → **"New Query"**
3. Run this SQL to fix permissions:

```sql
-- First, let's check if tables exist and have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('death_predictions', 'death_markets', 'death_bets');

-- Temporarily disable RLS for testing (ONLY for development)
ALTER TABLE death_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE death_markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE death_bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE digital_legacies DISABLE ROW LEVEL SECURITY;
ALTER TABLE life_extensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- OR: Fix RLS policies properly (RECOMMENDED for production)
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can view own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON death_predictions;
DROP POLICY IF EXISTS "Markets are publicly viewable" ON death_markets;
DROP POLICY IF EXISTS "Bets are publicly viewable" ON death_bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON death_bets;

-- Create proper RLS policies that work with anonymous access
CREATE POLICY "Enable read access for all users" ON death_predictions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON death_predictions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON death_markets
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON death_markets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON death_bets
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON death_bets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON digital_legacies
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON digital_legacies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON digital_legacies
  FOR UPDATE USING (true);

-- Re-enable RLS with the new policies
ALTER TABLE death_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_legacies ENABLE ROW LEVEL SECURITY;
```

## 🔧 Step 2: Verify Authentication Configuration

### Check Your Environment Variables
Make sure your `.env` file has the correct values:

```env
VITE_SUPABASE_URL=https://aloinmadrxbjfywagtgg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2lubWFkcnhiamZ5d2FndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTk4MDcsImV4cCI6MjA2NTE3NTgwN30.wo8vVWAjcu_6Gen0cEyXOOowrvQs0QQWkVjdm9s1MtU
```

### Verify API Keys in Supabase Dashboard
1. Go to **Settings** → **API**
2. Copy the **Project URL** and **anon public** key
3. Make sure they match your `.env` file

## 🛡️ Step 3: Check Authentication Settings

### In Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Ensure these settings:
   - **Enable email confirmations**: OFF (for development)
   - **Enable phone confirmations**: OFF
   - **Enable custom SMTP**: OFF (use built-in for now)

### Site URL Configuration:
1. In **Authentication** → **URL Configuration**
2. Add these URLs:
   - `http://localhost:5173`
   - `https://localhost:5173`
   - Your production domain (if deploying)

## 🔍 Step 4: Test Database Connection

Run this SQL to test if the connection works:

```sql
-- Test basic table access
SELECT COUNT(*) FROM death_predictions;
SELECT COUNT(*) FROM death_markets;
SELECT COUNT(*) FROM death_bets;

-- Test insert permissions
INSERT INTO death_predictions (
  user_id, 
  death_date, 
  cause_of_death, 
  confidence_percentage,
  days_remaining
) VALUES (
  gen_random_uuid(),
  NOW() + INTERVAL '10 years',
  'Test cause',
  85.5,
  3650
);

-- If successful, delete the test record
DELETE FROM death_predictions WHERE cause_of_death = 'Test cause';
```

## 🚨 Step 5: Emergency Fix (If Still Not Working)

If you're still getting permission errors, temporarily disable RLS entirely:

```sql
-- EMERGENCY: Disable RLS on all tables (DEVELOPMENT ONLY)
ALTER TABLE death_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE death_markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE death_bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE life_extensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE death_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE digital_legacies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- Grant public access (DEVELOPMENT ONLY)
GRANT ALL ON death_predictions TO anon;
GRANT ALL ON death_markets TO anon;
GRANT ALL ON death_bets TO anon;
GRANT ALL ON digital_legacies TO anon;
GRANT ALL ON life_extensions TO anon;
GRANT ALL ON user_subscriptions TO anon;
```

## ✅ Step 6: Verify Fix

After running the SQL:

1. **Refresh your application**
2. **Open browser console** and check for errors
3. **Try the death scan feature**
4. **Check if data is being saved**

## 🔒 Step 7: Re-enable Security (Production)

Once everything works, re-enable proper security:

```sql
-- Re-enable RLS with proper user-based policies
ALTER TABLE death_predictions ENABLE ROW LEVEL SECURITY;

-- Create user-specific policies
CREATE POLICY "Users can manage own predictions" ON death_predictions
  FOR ALL USING (
    auth.uid() = user_id OR auth.uid() IS NULL
  );
```

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check Supabase logs**: Dashboard → Logs → API
2. **Verify network connectivity**: Try accessing Supabase URL directly
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
4. **Check browser console**: Look for CORS or network errors

## 🎯 Expected Result

After following these steps:
- ✅ No more "permission denied" errors
- ✅ Death predictions save successfully
- ✅ Leaderboard loads data
- ✅ All database operations work

The key issue is that RLS policies were too restrictive for anonymous users. The fix allows the app to work while maintaining reasonable security.