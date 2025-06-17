import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aloinmadrxbjfywagtgg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2lubWFkcnhiamZ5d2FndGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTk4MDcsImV4cCI6MjA2NTE3NTgwN30.wo8vVWAjcu_6Gen0cEyXOOowrvQs0QQWkVjdm9s1MtU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let supabaseChannel = null;

export const initSupabase = async () => {
  console.log('Supabase initialized for DeathCast');

  // Only create channel if it doesn't exist
  if (!supabaseChannel) {
    supabaseChannel = supabase.channel('death_markets_' + Date.now());

    supabaseChannel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'death_bets' },
        (payload) => {
          console.log('New bet placed:', payload);
          // Handle real-time bet updates
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'death_markets' },
        (payload) => {
          console.log('Market updated:', payload);
          // Handle real-time market updates
        }
      )
      .subscribe();
  }

  return supabaseChannel;
};

// Death Predictions
export const createDeathPrediction = async (predictionData) => {
  try {
    const { data, error } = await supabase
      .from('death_predictions')
      .insert([{
        user_id: predictionData.userId,
        death_date: predictionData.deathDate,
        cause_of_death: predictionData.cause,
        confidence_percentage: predictionData.confidence,
        days_remaining: predictionData.daysRemaining,
        market_id: predictionData.marketId,
      }])
      .select()
      .single();

    if (error) {
      console.log('Database table might not exist yet, using demo mode:', error.message);
      // Return mock data for demo
      return {
        id: 'demo_' + Date.now(),
        ...predictionData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.log('Using demo mode for predictions:', err.message);
    return {
      id: 'demo_' + Date.now(),
      ...predictionData,
      created_at: new Date().toISOString()
    };
  }
};

export const getDeathPrediction = async (userId) => {
  const { data, error } = await supabase
    .from('death_predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Death Markets
export const createDeathMarket = async (predictionId) => {
  try {
    const { data, error } = await supabase
      .from('death_markets')
      .insert([{
        prediction_id: predictionId,
        total_pool: 0,
        bet_count: 0,
        odds: { before: 2.5, exact: 50.0, after: 1.8 },
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.log('Database table might not exist yet, using demo mode:', error.message);
      // Return mock data for demo
      return {
        id: 'demo_market_' + Date.now(),
        prediction_id: predictionId,
        total_pool: Math.floor(Math.random() * 10000),
        bet_count: Math.floor(Math.random() * 50),
        odds: { before: 2.5, exact: 50.0, after: 1.8 },
        status: 'active'
      };
    }
    return data;
  } catch (err) {
    throw new Error(`Failed to create market: ${err.message}`);
  }
};

export const getMarketData = async (predictionId) => {
  const { data, error } = await supabase
    .from('death_markets')
    .select(`
      *,
      death_bets (*)
    `)
    .eq('prediction_id', predictionId)
    .single();

  if (error) throw error;
  return data;
};

// Death Bets
export const placeBet = async (betData) => {
  const { data, error } = await supabase
    .from('death_bets')
    .insert([{
      market_id: betData.marketId,
      user_id: betData.userId,
      bet_type: betData.betType,
      amount: betData.amount,
      potential_payout: betData.potentialPayout,
    }])
    .select()
    .single();

  if (error) throw error;

  // Update market pool
  await supabase.rpc('update_market_pool', {
    market_id: betData.marketId,
    bet_amount: betData.amount
  });

  return data;
};

export const getBets = async (marketId) => {
  try {
    const { data, error } = await supabase
      .from('death_bets')
      .select('*')
      .eq('market_id', marketId)
      .order('placed_at', { ascending: false });

    if (error) {
      console.log('Database table might not exist yet, using demo mode:', error.message);
      // Return demo bets
      return generateDemoBets();
    }
    return data;
  } catch (err) {
    console.log('Using demo mode for bets:', err.message);
    return generateDemoBets();
  }
};

const generateDemoBets = () => {
  const demoUsers = ['DeathSeeker42', 'MortalityFan', 'GrimReaper2024', 'LifeGambler', 'DeathWatcher'];
  const betTypes = ['before', 'exact', 'after'];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `demo_bet_${i}`,
    user_id: demoUsers[Math.floor(Math.random() * demoUsers.length)],
    bet_type: betTypes[Math.floor(Math.random() * betTypes.length)],
    amount: Math.floor(Math.random() * 1000) + 50,
    potential_payout: Math.floor(Math.random() * 2000) + 100,
    placed_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    status: 'active'
  }));
};

// Life Extensions
export const recordLifeExtension = async (extensionData) => {
  const { data, error } = await supabase
    .from('life_extensions')
    .insert([{
      user_id: extensionData.userId,
      original_death_date: extensionData.originalDeathDate,
      new_death_date: extensionData.newDeathDate,
      days_added: extensionData.daysAdded,
      method: extensionData.method,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Death Verification (controversial but necessary)
export const verifyDeath = async (verificationData) => {
  const { data, error } = await supabase
    .from('death_verifications')
    .insert([{
      prediction_id: verificationData.predictionId,
      actual_death_date: verificationData.actualDeathDate,
      verified_by: verificationData.verifiedBy,
      verification_source: verificationData.source,
      payout_triggered: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Leaderboard
export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('death_predictions')
    .select(`
      *,
      death_markets (total_pool, bet_count)
    `)
    .order('confidence_percentage', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};
