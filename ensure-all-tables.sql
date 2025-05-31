-- Create redemption_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS redemption_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  business_id UUID NOT NULL,
  punchcard_id UUID NOT NULL,
  reward TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create business_rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  punches_required INTEGER NOT NULL DEFAULT 10,
  image_type TEXT,
  image_value TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create redemption_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS redemption_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL,
  punchcard_id UUID NOT NULL,
  reward TEXT NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to create redemption_tokens table
CREATE OR REPLACE FUNCTION create_redemption_tokens_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS redemption_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    business_id UUID NOT NULL,
    punchcard_id UUID NOT NULL,
    reward TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to create business_rewards table
CREATE OR REPLACE FUNCTION create_business_rewards_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS business_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    punches_required INTEGER NOT NULL DEFAULT 10,
    image_type TEXT,
    image_value TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
