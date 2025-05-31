-- Create redemption_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS redemption_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    punchcard_id UUID REFERENCES punchcards(id) ON DELETE CASCADE,
    reward TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_token ON redemption_tokens(token);
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_user_id ON redemption_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_business_id ON redemption_tokens(business_id);
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_expires_at ON redemption_tokens(expires_at);

-- Enable RLS
ALTER TABLE redemption_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own redemption tokens" ON redemption_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemption tokens" ON redemption_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Businesses can view redemption tokens for their business" ON redemption_tokens
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Businesses can update redemption tokens for their business" ON redemption_tokens
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );
