// Setup script to create Supabase database tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aloinmadrxbjfywagtgg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2lubWFkcnhiamZ5d2FndGdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU5OTgwNywiZXhwIjoyMDY1MTc1ODA3fQ.O6a209fOwHEI3qchzywKbTZ5p7CuAEb2XjhUww8zrVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up DeathCast database...');

  try {
    // Create death_predictions table
    const { error: predictionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS death_predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT,
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
      `
    });

    if (predictionsError) {
      console.log('Predictions table might already exist:', predictionsError.message);
    } else {
      console.log('✅ Created death_predictions table');
    }

    // Create death_markets table
    const { error: marketsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS death_markets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          prediction_id UUID,
          algorand_market_id TEXT,
          total_pool DECIMAL(10,2) DEFAULT 0,
          bet_count INTEGER DEFAULT 0,
          odds JSONB DEFAULT '{"before": 2.5, "exact": 50.0, "after": 1.8}',
          status VARCHAR DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (marketsError) {
      console.log('Markets table might already exist:', marketsError.message);
    } else {
      console.log('✅ Created death_markets table');
    }

    // Create death_bets table
    const { error: betsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS death_bets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          market_id UUID,
          user_id TEXT,
          bet_type VARCHAR,
          amount DECIMAL(10,2),
          potential_payout DECIMAL(10,2),
          algorand_tx_id TEXT,
          status VARCHAR DEFAULT 'active',
          placed_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (betsError) {
      console.log('Bets table might already exist:', betsError.message);
    } else {
      console.log('✅ Created death_bets table');
    }

    console.log('🎉 Database setup complete!');
    console.log('📱 Your DeathCast app is now connected to real Supabase database');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('💡 You can manually run the SQL from supabase-schema.sql in your Supabase dashboard');
  }
}

setupDatabase();
