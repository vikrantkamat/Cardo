-- Create businesses table with correct structure
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  business_type VARCHAR(100) DEFAULT 'restaurant',
  category VARCHAR(100) DEFAULT 'restaurant',
  location VARCHAR(255),
  address VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  punches_required INTEGER DEFAULT 10,
  punch_requirement INTEGER DEFAULT 10,
  reward VARCHAR(255) DEFAULT 'Free item',
  reward_description TEXT DEFAULT 'Get a free item when you complete your punch card!',
  rating DECIMAL(3,2) DEFAULT 4.5,
  loyalty_program_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create punchcards table (legacy name for compatibility)
CREATE TABLE IF NOT EXISTS punchcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  punches INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  last_punch_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Create punch_cards table (new name)
CREATE TABLE IF NOT EXISTS punch_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  punches INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  last_punch_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Create user_recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) DEFAULT 'location_based',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  content TEXT,
  email_type VARCHAR(100),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample businesses if none exist
INSERT INTO businesses (name, description, business_type, category, location, address, phone, email, punches_required, reward, reward_description, rating, primary_color)
SELECT * FROM (VALUES
  ('Blue Mountain Coffee', 'Artisan coffee roasters serving the finest single-origin beans', 'cafe', 'Coffee Shop', 'Downtown', '123 Main St, Downtown', '(555) 123-4567', 'info@bluemountain.com', 8, 'Free Coffee', 'Get a free 12oz coffee of your choice', 4.8, '#8B4513'),
  ('Sunrise Bakery', 'Fresh baked goods made daily with organic ingredients', 'bakery', 'Bakery', 'Midtown', '456 Oak Ave, Midtown', '(555) 234-5678', 'hello@sunrisebakery.com', 10, 'Free Pastry', 'Choose any pastry from our display case', 4.6, '#D2691E'),
  ('Green Juice Bar', 'Cold-pressed juices and healthy smoothies', 'juice', 'Juice Bar', 'Health District', '789 Wellness Blvd, Health District', '(555) 345-6789', 'orders@greenjuice.com', 6, 'Free Smoothie', 'Get a free 16oz smoothie of your choice', 4.7, '#32CD32'),
  ('Corner Cafe', 'Cozy neighborhood cafe with homemade treats', 'cafe', 'Cafe', 'Riverside', '321 River St, Riverside', '(555) 456-7890', 'contact@cornercafe.com', 12, 'Free Lunch', 'Get a free sandwich and drink combo', 4.5, '#6B4423'),
  ('Fresh Market Deli', 'Farm-to-table deli with local ingredients', 'deli', 'Deli', 'Market Square', '654 Market Square, Downtown', '(555) 567-8901', 'deli@freshmarket.com', 9, 'Free Sandwich', 'Choose any sandwich from our menu', 4.4, '#228B22')
) AS v(name, description, business_type, category, location, address, phone, email, punches_required, reward, reward_description, rating, primary_color)
WHERE NOT EXISTS (SELECT 1 FROM businesses LIMIT 1);

-- Update existing businesses to ensure they have all required fields
UPDATE businesses 
SET 
  category = COALESCE(category, business_type, 'restaurant'),
  address = COALESCE(address, location, 'Address not provided'),
  reward_description = COALESCE(reward_description, 'Get a free item when you complete your punch card!'),
  punch_requirement = COALESCE(punch_requirement, punches_required, 10),
  loyalty_program_active = COALESCE(loyalty_program_active, true),
  rating = COALESCE(rating, 4.5),
  primary_color = COALESCE(primary_color, '#3B82F6')
WHERE id IS NOT NULL;
