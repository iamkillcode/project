/*
  # Initial Schema for ChaleCheck

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Stores first_name, last_name, and avatar_url
    
    - `businesses`
      - Core business listings
      - Stores name, description, contact info, location, etc.
    
    - `categories`
      - Business categories (e.g., Restaurants, Hotels)
      - Allows for organized browsing
    
    - `business_categories`
      - Junction table for businesses and categories
      - Enables businesses to have multiple categories
    
    - `reviews`
      - User reviews for businesses
      - Includes rating, content, and timestamps
    
    - `business_hours`
      - Operating hours for businesses
      - Stores opening/closing times for each day
    
  2. Security
    - Enable RLS on all tables
    - Set up access policies for each table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  phone text,
  email text,
  website text,
  address text,
  city text,
  region text,
  postal_code text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create business_categories junction table
CREATE TABLE IF NOT EXISTS business_categories (
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at time,
  closes_at time,
  is_closed boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Businesses are viewable by everyone"
  ON businesses FOR SELECT
  USING (true);

CREATE POLICY "Business owners can update their businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Business categories policies
CREATE POLICY "Business categories are viewable by everyone"
  ON business_categories FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage categories"
  ON business_categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM businesses WHERE id = business_categories.business_id
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Business hours policies
CREATE POLICY "Business hours are viewable by everyone"
  ON business_hours FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage business hours"
  ON business_hours FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM businesses WHERE id = business_hours.business_id
    )
  );

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Restaurants', 'Places to eat and drink'),
  ('Hotels', 'Places to stay'),
  ('Shopping', 'Retail stores and markets'),
  ('Services', 'Professional and personal services'),
  ('Beauty & Spa', 'Beauty salons, spas, and wellness centers'),
  ('Automotive', 'Car dealerships, repair shops, and services'),
  ('Health', 'Medical facilities and healthcare services'),
  ('Entertainment', 'Movie theaters, clubs, and recreation')
ON CONFLICT (name) DO NOTHING;