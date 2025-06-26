/*
  # Achievement System Expansion

  1. New Tables
    - `achievement_levels` - Tiered achievements (bronze/silver/gold)
    - `user_achievements` - Track user achievement progress
    - `social_fitness_challenges` - Friend challenges

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create achievement levels table
CREATE TABLE IF NOT EXISTS achievement_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  category varchar(50),
  bronze_threshold integer,
  silver_threshold integer,
  gold_threshold integer,
  unit varchar(50),
  icon varchar(50),
  created_at timestamptz DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievement_levels(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  level_achieved varchar(20), -- 'bronze', 'silver', 'gold'
  bronze_achieved_at timestamptz,
  silver_achieved_at timestamptz,
  gold_achieved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create social fitness challenges table
CREATE TABLE IF NOT EXISTS social_fitness_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  description text,
  challenge_type varchar(50),
  target_value integer,
  unit varchar(50),
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES social_fitness_challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);

-- Enable RLS
ALTER TABLE achievement_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_fitness_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policies for achievement_levels (public read)
CREATE POLICY "Anyone can view achievements"
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
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for social_fitness_challenges
CREATE POLICY "Users can view active challenges"
  ON social_fitness_challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true OR creator_id = auth.uid());

CREATE POLICY "Users can create challenges"
  ON social_fitness_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own challenges"
  ON social_fitness_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Policies for challenge_participants
CREATE POLICY "Users can view challenge participants"
  ON challenge_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievement_levels (name, description, category, bronze_threshold, silver_threshold, gold_threshold, unit, icon) VALUES
  ('Hydration Hero', 'Stay hydrated consistently', 'hydration', 7, 30, 90, 'days', 'water'),
  ('Calorie Counter', 'Log your meals regularly', 'nutrition', 7, 30, 90, 'days', 'food'),
  ('Workout Warrior', 'Complete workout sessions', 'fitness', 10, 50, 100, 'workouts', 'dumbbell'),
  ('Streak Master', 'Maintain daily logging streak', 'consistency', 7, 30, 100, 'days', 'fire'),
  ('Weight Loss Champion', 'Achieve weight loss goals', 'goals', 2, 5, 10, 'kg', 'scale')
ON CONFLICT DO NOTHING;
