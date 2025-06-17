import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let supabaseChannel = null;

export const initSupabase = async () => {
  console.log('Supabase initialized for DeathCast');

  // Test connection
  try {
    const { data, error } = await supabase.from('death_predictions').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    throw error;
  }

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
  const { data, error } = await supabase
    .from('death_predictions')
    .insert([{
      user_id: predictionData.userId,
      death_date: predictionData.deathDate,
      cause_of_death: predictionData.cause,
      confidence_percentage: predictionData.confidence,
      days_remaining: predictionData.daysRemaining,
      market_id: predictionData.marketId,
      risk_factors: predictionData.riskFactors || {},
      preventable_factor: predictionData.preventableFactor,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create death prediction: ${error.message}`);
  return data;
};

export const getDeathPrediction = async (userId) => {
  const { data, error } = await supabase
    .from('death_predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get death prediction: ${error.message}`);
  }
  return data;
};

// Death Markets
export const createDeathMarket = async (predictionId) => {
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

  if (error) throw new Error(`Failed to create market: ${error.message}`);
  return data;
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

  if (error) throw new Error(`Failed to get market data: ${error.message}`);
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

  if (error) throw new Error(`Failed to place bet: ${error.message}`);

  // Update market pool
  const { error: updateError } = await supabase.rpc('update_market_pool', {
    market_id: betData.marketId,
    bet_amount: betData.amount
  });

  if (updateError) {
    console.error('Failed to update market pool:', updateError);
  }

  return data;
};

export const getBets = async (marketId) => {
  const { data, error } = await supabase
    .from('death_bets')
    .select('*')
    .eq('market_id', marketId)
    .order('placed_at', { ascending: false });

  if (error) throw new Error(`Failed to get bets: ${error.message}`);
  return data || [];
};

// Life Extensions
export const recordLifeExtension = async (extensionData) => {
  const { data, error } = await supabase
    .from('life_extensions')
    .insert([{
      user_id: extensionData.userId,
      prediction_id: extensionData.predictionId,
      original_death_date: extensionData.originalDeathDate,
      new_death_date: extensionData.newDeathDate,
      days_added: extensionData.daysAdded,
      method: extensionData.method,
      product_id: extensionData.productId,
      transaction_id: extensionData.transactionId,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to record life extension: ${error.message}`);
  return data;
};

// Death Verification
export const verifyDeath = async (verificationData) => {
  const { data, error } = await supabase
    .from('death_verifications')
    .insert([{
      prediction_id: verificationData.predictionId,
      actual_death_date: verificationData.actualDeathDate,
      verified_by: verificationData.verifiedBy,
      verification_source: verificationData.source,
      confidence_score: verificationData.confidence || 0.95,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to verify death: ${error.message}`);
  return data;
};

// Digital Legacy
export const saveDigitalLegacy = async (legacyData) => {
  const { data, error } = await supabase
    .from('digital_legacies')
    .upsert([{
      user_id: legacyData.userId,
      last_words: legacyData.lastWords,
      digital_assets: legacyData.digitalAssets,
      beneficiaries: legacyData.beneficiaries,
      funeral_preferences: legacyData.funeralPreferences || {},
      voice_recording_url: legacyData.voiceRecordingUrl,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to save digital legacy: ${error.message}`);
  return data;
};

export const getDigitalLegacy = async (userId) => {
  const { data, error } = await supabase
    .from('digital_legacies')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get digital legacy: ${error.message}`);
  }
  return data;
};

// Leaderboard
export const getLeaderboard = async (limit = 50) => {
  const { data, error } = await supabase
    .from('death_leaderboard')
    .select('*')
    .order('confidence_percentage', { ascending: false })
    .order('total_pool', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get leaderboard: ${error.message}`);
  return data || [];
};

// User Subscriptions
export const saveUserSubscription = async (subscriptionData) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert([{
      user_id: subscriptionData.userId,
      product_id: subscriptionData.productId,
      subscription_id: subscriptionData.subscriptionId,
      status: subscriptionData.status,
      expires_at: subscriptionData.expiresAt,
      revenue_cat_data: subscriptionData.revenueCatData || {},
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to save subscription: ${error.message}`);
  return data;
};

export const getUserSubscriptions = async (userId) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw new Error(`Failed to get user subscriptions: ${error.message}`);
  return data || [];
};