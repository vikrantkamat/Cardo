-- Create redemption tokens table for one-time use QR codes
CREATE TABLE IF NOT EXISTS redemption_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  punchcard_id UUID NOT NULL REFERENCES punchcards(id) ON DELETE CASCADE,
  reward TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_token ON redemption_tokens(token);
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_punchcard ON redemption_tokens(punchcard_id);
