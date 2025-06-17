import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

let supabaseChannel = null;

export const initSupabase = async () => {
  console.log('Supabase initialized for DeathCast');

  // Test connection with better error handling
  try {
    const { data, error } = await supabase.from('death_predictions').select('count').limit(1);
    if (error) {
      if (error.code === '42501') {
        console.error('Permission denied - RLS policies need to be fixed');
        throw new Error('Database permission denied. Please check RLS policies in Supabase dashboard.');
      } else if (error.code === '42P01') {
        console.error('Table does not exist - database schema needs to be created');
        throw new Error('Database tables not found. Please run the database setup SQL.');
      } else {
        console.error('Supabase connection error:', error);
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    // Don't throw here - let the app continue with demo mode
    console.warn('⚠️ Running in demo mode due to database connection issues');
  }

  // Only create channel if it doesn't exist
  if (!supabaseChannel) {
    try {
      supabaseChannel = supabase.channel('death_markets_' + Date.now());

      supabaseChannel
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'death_bets' },
          (payload) => {
            console.log('New bet placed:', payload);
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'death_markets' },
          (payload) => {
            console.log('Market updated:', payload);
          }
        )
        .subscribe();
    } catch (error) {
      console.warn('Real-time subscriptions not available:', error);
    }
  }

  return supabaseChannel;
};

// Death Predictions with better error handling
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
        risk_factors: predictionData.riskFactors || {},
        preventable_factor: predictionData.preventableFactor,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create death prediction:', error);
      // Return demo data if database fails
      return {
        id: 'demo_' + Date.now(),
        ...predictionData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.error('Database error, using demo mode:', err);
    return {
      id: 'demo_' + Date.now(),
      ...predictionData,
      created_at: new Date().toISOString()
    };
  }
};

export const getDeathPrediction = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('death_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get death prediction:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return null;
  }
};

// Death Markets with fallback
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
      console.error('Failed to create market:', error);
      // Return demo market
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
    console.error('Database error, using demo mode:', err);
    return {
      id: 'demo_market_' + Date.now(),
      prediction_id: predictionId,
      total_pool: Math.floor(Math.random() * 10000),
      bet_count: Math.floor(Math.random() * 50),
      odds: { before: 2.5, exact: 50.0, after: 1.8 },
      status: 'active'
    };
  }
};

export const getMarketData = async (predictionId) => {
  try {
    const { data, error } = await supabase
      .from('death_markets')
      .select(`
        *,
        death_bets (*)
      `)
      .eq('prediction_id', predictionId)
      .single();

    if (error) {
      console.error('Failed to get market data:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return null;
  }
};

// Death Bets with fallback
export const placeBet = async (betData) => {
  try {
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

    if (error) {
      console.error('Failed to place bet:', error);
      // Return demo bet
      return {
        id: 'demo_bet_' + Date.now(),
        ...betData,
        placed_at: new Date().toISOString(),
        status: 'active'
      };
    }

    // Try to update market pool
    try {
      await supabase.rpc('update_market_pool', {
        market_id: betData.marketId,
        bet_amount: betData.amount
      });
    } catch (updateError) {
      console.warn('Failed to update market pool:', updateError);
    }

    return data;
  } catch (err) {
    console.error('Database error, using demo mode:', err);
    return {
      id: 'demo_bet_' + Date.now(),
      ...betData,
      placed_at: new Date().toISOString(),
      status: 'active'
    };
  }
};

export const getBets = async (marketId) => {
  try {
    const { data, error } = await supabase
      .from('death_bets')
      .select('*')
      .eq('market_id', marketId)
      .order('placed_at', { ascending: false });

    if (error) {
      console.error('Failed to get bets:', error);
      return generateDemoBets();
    }
    return data || [];
  } catch (err) {
    console.error('Database error, using demo mode:', err);
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
  try {
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

    if (error) {
      console.error('Failed to record life extension:', error);
      return {
        id: 'demo_extension_' + Date.now(),
        ...extensionData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return {
      id: 'demo_extension_' + Date.now(),
      ...extensionData,
      created_at: new Date().toISOString()
    };
  }
};

// Death Verification
export const verifyDeath = async (verificationData) => {
  try {
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

    if (error) {
      console.error('Failed to verify death:', error);
      return {
        id: 'demo_verification_' + Date.now(),
        ...verificationData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return {
      id: 'demo_verification_' + Date.now(),
      ...verificationData,
      created_at: new Date().toISOString()
    };
  }
};

// Digital Legacy
export const saveDigitalLegacy = async (legacyData) => {
  try {
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

    if (error) {
      console.error('Failed to save digital legacy:', error);
      // Save to localStorage as fallback
      localStorage.setItem(`legacy_${legacyData.userId}`, JSON.stringify(legacyData));
      return {
        id: 'demo_legacy_' + Date.now(),
        ...legacyData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    localStorage.setItem(`legacy_${legacyData.userId}`, JSON.stringify(legacyData));
    return {
      id: 'demo_legacy_' + Date.now(),
      ...legacyData,
      created_at: new Date().toISOString()
    };
  }
};

export const getDigitalLegacy = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('digital_legacies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get digital legacy:', error);
      // Try localStorage fallback
      const stored = localStorage.getItem(`legacy_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    const stored = localStorage.getItem(`legacy_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }
};

// Leaderboard with demo data fallback
export const getLeaderboard = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('death_leaderboard')
      .select('*')
      .order('confidence_percentage', { ascending: false })
      .order('total_pool', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get leaderboard:', error);
      return generateDemoLeaderboard();
    }
    return data || generateDemoLeaderboard();
  } catch (err) {
    console.error('Database error, using demo leaderboard:', err);
    return generateDemoLeaderboard();
  }
};

const generateDemoLeaderboard = () => {
  const demoUsers = [
    'death.defier@example.com',
    'mortal.mike@example.com', 
    'risky.rachel@example.com',
    'grim.gary@example.com',
    'lucky.lucy@example.com'
  ];

  return demoUsers.map((email, index) => ({
    id: `demo_${index}`,
    user_email: email,
    death_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 50).toISOString(),
    cause_of_death: ['Heart disease', 'Cancer', 'Accident', 'Old age', 'Unknown'][index],
    confidence_percentage: 95 - index * 5,
    days_remaining: Math.floor(Math.random() * 18250),
    total_pool: Math.floor(Math.random() * 100000),
    bet_count: Math.floor(Math.random() * 500),
    created_at: new Date().toISOString()
  }));
};

// User Subscriptions
export const saveUserSubscription = async (subscriptionData) => {
  try {
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

    if (error) {
      console.error('Failed to save subscription:', error);
      return {
        id: 'demo_sub_' + Date.now(),
        ...subscriptionData,
        created_at: new Date().toISOString()
      };
    }
    return data;
  } catch (err) {
    console.error('Database error:', err);
    return {
      id: 'demo_sub_' + Date.now(),
      ...subscriptionData,
      created_at: new Date().toISOString()
    };
  }
};

export const getUserSubscriptions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Failed to get user subscriptions:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Database error:', err);
    return [];
  }
};