-- Create redemption history table
CREATE TABLE IF NOT EXISTS redemption_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  punchcard_id UUID REFERENCES punchcards(id) ON DELETE CASCADE,
  reward_redeemed VARCHAR(255) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_redemption_history_business_id ON redemption_history(business_id);
CREATE INDEX IF NOT EXISTS idx_redemption_history_user_id ON redemption_history(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_history_redeemed_at ON redemption_history(redeemed_at);
