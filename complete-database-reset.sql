-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS user_recommendations CASCADE;
DROP TABLE IF EXISTS punchcards CASCADE;
DROP TABLE IF EXISTS punch_cards CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS business_qr_codes CASCADE;
DROP TABLE IF EXISTS redemption_tokens CASCADE;
DROP TABLE IF EXISTS business_rewards CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create businesses table with ALL required fields
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  punches_required INTEGER DEFAULT 10,
  reward VARCHAR(255) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 4.5,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create punchcards table
CREATE TABLE punchcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  punches INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  last_punch_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Create business_qr_codes table
CREATE TABLE business_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  content TEXT,
  email_type VARCHAR(100),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample businesses that will show up for customers
INSERT INTO businesses (name, email, password_hash, business_type, location, description, punches_required, reward, rating, primary_color) VALUES
('Blue Mountain Coffee', 'coffee@bluemountain.com', 'cGFzc3dvcmQ=', 'cafe', '123 Main St, Downtown', 'Artisan coffee roasters serving the finest single-origin beans from around the world', 8, 'Free 12oz Coffee', 4.8, '#8B4513'),
('Sunrise Bakery', 'hello@sunrisebakery.com', 'cGFzc3dvcmQ=', 'bakery', '456 Oak Ave, Midtown', 'Fresh baked goods made daily with organic ingredients and traditional recipes', 10, 'Free Pastry', 4.6, '#D2691E'),
('Green Juice Bar', 'orders@greenjuice.com', 'cGFzc3dvcmQ=', 'juice', '789 Wellness Blvd, Health District', 'Cold-pressed juices and healthy smoothies made with organic fruits and vegetables', 6, 'Free 16oz Smoothie', 4.7, '#32CD32'),
('Corner Cafe', 'contact@cornercafe.com', 'cGFzc3dvcmQ=', 'cafe', '321 River St, Riverside', 'Cozy neighborhood cafe with homemade treats and friendly atmosphere', 12, 'Free Lunch Combo', 4.5, '#6B4423'),
('Fresh Market Deli', 'deli@freshmarket.com', 'cGFzc3dvcmQ=', 'coffee', '654 Market Square, Downtown', 'Farm-to-table deli with local ingredients and artisanal sandwiches', 9, 'Free Gourmet Sandwich', 4.4, '#228B22');

-- Create QR codes for each business
INSERT INTO business_qr_codes (business_id, qr_code, is_active)
SELECT id, 'business-' || id || '-' || extract(epoch from now()), true
FROM businesses;
