-- Create business_rewards table with image support
CREATE TABLE IF NOT EXISTS business_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  punches_required INTEGER NOT NULL DEFAULT 10,
  image_type VARCHAR(20) DEFAULT 'emoji',
  image_value TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_rewards_business_id ON business_rewards(business_id);
CREATE INDEX IF NOT EXISTS idx_business_rewards_active ON business_rewards(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_business_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_rewards_updated_at 
    BEFORE UPDATE ON business_rewards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_business_rewards_updated_at();
