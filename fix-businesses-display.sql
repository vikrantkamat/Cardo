-- Drop and recreate businesses table with correct structure
DROP TABLE IF EXISTS businesses CASCADE;

CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  business_type VARCHAR(100) DEFAULT 'restaurant',
  location VARCHAR(255),
  address VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  punches_required INTEGER DEFAULT 10,
  reward VARCHAR(255) DEFAULT 'Free item',
  rating DECIMAL(3,2) DEFAULT 4.5,
  loyalty_program_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample businesses
INSERT INTO businesses (name, description, business_type, location, address, phone, email, punches_required, reward, rating, primary_color) VALUES
('Blue Mountain Coffee', 'Artisan coffee roasters serving the finest single-origin beans', 'cafe', 'Downtown', '123 Main St, Downtown', '(555) 123-4567', 'info@bluemountain.com', 8, 'Free Coffee', 4.8, '#8B4513'),
('Sunrise Bakery', 'Fresh baked goods made daily with organic ingredients', 'bakery', 'Midtown', '456 Oak Ave, Midtown', '(555) 234-5678', 'hello@sunrisebakery.com', 10, 'Free Pastry', 4.6, '#D2691E'),
('Green Juice Bar', 'Cold-pressed juices and healthy smoothies', 'juice', 'Health District', '789 Wellness Blvd, Health District', '(555) 345-6789', 'orders@greenjuice.com', 6, 'Free Smoothie', 4.7, '#32CD32'),
('Corner Cafe', 'Cozy neighborhood cafe with homemade treats', 'cafe', 'Riverside', '321 River St, Riverside', '(555) 456-7890', 'contact@cornercafe.com', 12, 'Free Lunch', 4.5, '#6B4423'),
('Fresh Market Deli', 'Farm-to-table deli with local ingredients', 'deli', 'Market Square', '654 Market Square, Downtown', '(555) 567-8901', 'deli@freshmarket.com', 9, 'Free Sandwich', 4.4, '#228B22');

-- Recreate punchcards table
DROP TABLE IF EXISTS punchcards CASCADE;

CREATE TABLE punchcards (
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

-- Recreate user_recommendations table
DROP TABLE IF EXISTS user_recommendations CASCADE;

CREATE TABLE user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) DEFAULT 'location_based',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
