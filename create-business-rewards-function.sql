-- Create function to ensure business_rewards table exists
CREATE OR REPLACE FUNCTION create_business_rewards_table()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'business_rewards'
    ) THEN
        CREATE TABLE public.business_rewards (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            business_id UUID NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            punches_required INTEGER NOT NULL DEFAULT 10,
            image_type TEXT DEFAULT 'emoji',
            image_value TEXT DEFAULT '🎁',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_business_rewards_business_id ON business_rewards(business_id);
        CREATE INDEX idx_business_rewards_active ON business_rewards(is_active);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_business_rewards_table();
