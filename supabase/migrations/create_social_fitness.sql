/*
  # Social Fitness Features

  1. New Tables
    - `social_fitness_challenges`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `challenge_type` (text)
      - `target_value` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `created_by` (uuid)
      - `is_public` (boolean)
      - `created_at` (timestamptz)

    - `challenge_participants`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, references social_fitness_challenges)
      - `user_id` (uuid, references auth.users)
      - `progress` (integer)
      - `joined_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view public challenges and ones they participate in
    - Users can join public challenges
*/

-- Create social fitness challenges table
CREATE TABLE IF NOT EXISTS social_fitness_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  target_value integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  is_public boolean DEFAULT true,
  max_participants integer,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_challenge_type CHECK (challenge_type IN ('steps', 'calories_burned', 'workouts', 'hydration', 'streak')),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT realistic_target CHECK (target_value > 0 AND target_value < 1000000)
);

-- Create challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES social_fitness_challenges NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  progress integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT unique_participant UNIQUE (challenge_id, user_id),
  CONSTRAINT non_negative_progress CHECK (progress >= 0)
);

-- Enable RLS
ALTER TABLE social_fitness_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Policies for challenges
CREATE POLICY "Users can view public challenges and ones they participate in"
  ON social_fitness_challenges
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE challenge_participants.challenge_id = social_fitness_challenges.id
      AND challenge_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create challenges"
  ON social_fitness_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own challenges"
  ON social_fitness_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for participants
CREATE POLICY "Users can view participants of challenges they're in"
  ON challenge_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM challenge_participants cp2
      WHERE cp2.challenge_id = challenge_participants.challenge_id
      AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public challenges"
  ON challenge_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM social_fitness_challenges
      WHERE id = challenge_id AND is_public = true
    )
  );

CREATE POLICY "Users can update their own progress"
  ON challenge_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_challenges_public ON social_fitness_challenges(is_public, start_date, end_date);
CREATE INDEX idx_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_participants_user ON challenge_participants(user_id);
