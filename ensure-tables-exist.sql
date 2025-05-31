-- Check if all required tables exist and create missing ones

-- Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT,
  email_type VARCHAR(100) DEFAULT 'general',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_qr_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  qr_type VARCHAR(100) DEFAULT 'punch',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all foreign key constraints are properly set up
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_business_id ON business_qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_punch_history_business_id ON punch_history(business_id);
CREATE INDEX IF NOT EXISTS idx_punchcards_business_id ON punchcards(business_id);
CREATE INDEX IF NOT EXISTS idx_business_rewards_business_id ON business_rewards(business_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_business_id ON user_recommendations(business_id);
