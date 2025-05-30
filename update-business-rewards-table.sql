-- Add image fields to business_rewards table
ALTER TABLE business_rewards 
ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'emoji',
ADD COLUMN IF NOT EXISTS image_value TEXT DEFAULT '🎁';

-- Create storage bucket for reward images (if using Supabase storage)
-- This would typically be done in the Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reward-images', 'reward-images', true);

-- Create policy for reward images (if using Supabase storage)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'reward-images');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reward-images' AND auth.role() = 'authenticated');
