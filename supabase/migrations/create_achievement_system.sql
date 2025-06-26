/*
  # Achievement System with Tiers

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `icon` (text)
      - `criteria` (jsonb) - Conditions to unlock
      - `points` (integer)
      - `created_at` (timestamptz)

    - `achievement_levels`
      - `id` (uuid, primary key)
      - `achievement_id` (uuid, references achievements)
      - `level` (text) - bronze, silver, gold, platinum
      - `threshold` (integer) - Value needed for this level
      - `bonus_points` (integer)

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `achievement_id` (uuid, references achievements)
      - `level` (text)
      - `progress` (integer)
      - `unlocked_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only view and manage their own achievements
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  points integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_achievement_category CHECK (category IN ('fitness', 'nutrition', 'consistency', 'social', 'milestone'))
);

-- Create achievement levels table
CREATE TABLE IF NOT EXISTS achievement_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id uuid REFERENCES achievements NOT NULL,
  level text NOT NULL,
  threshold integer NOT NULL,
  bonus_points integer NOT NULL DEFAULT 0,
  CONSTRAINT valid_level CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  CONSTRAINT unique_achievement_level UNIQUE (achievement_id, level)
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id uuid REFERENCES achievements NOT NULL,
  level text,
  progress integer DEFAULT 0,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_user_level CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for achievement_levels (public read)
CREATE POLICY "Anyone can view achievement levels"
  ON achievement_levels
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create user achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user achievements"
  ON user_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at) WHERE unlocked_at IS NOT NULL;
