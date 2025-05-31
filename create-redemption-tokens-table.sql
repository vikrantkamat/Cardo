-- Create redemption tokens table if it doesn't exist
CREATE OR REPLACE FUNCTION create_redemption_tokens_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'redemption_tokens'
    ) THEN
        CREATE TABLE public.redemption_tokens (
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
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create redemption history table if it doesn't exist
CREATE OR REPLACE FUNCTION create_redemption_history_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'redemption_history'
    ) THEN
        CREATE TABLE public.redemption_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            business_id UUID NOT NULL,
            punchcard_id UUID NOT NULL,
            reward TEXT NOT NULL,
            redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the functions
SELECT create_redemption_tokens_table();
SELECT create_redemption_history_table();
