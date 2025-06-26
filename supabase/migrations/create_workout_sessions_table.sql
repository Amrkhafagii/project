/*
  # Create workout sessions table

  1. New Tables
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `workout_date` (date)
      - `workout_type` (enum: strength, cardio, flexibility, sports, mixed)
      - `duration_minutes` (integer)
      - `calories_burned` (integer)
      - `exercises` (jsonb - array of exercise details)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workout_sessions` table
    - Add policy for users to manage their own workout sessions
*/

-- Create workout type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workout_type') THEN
    CREATE TYPE workout_type AS ENUM ('strength', 'cardio', 'flexibility', 'sports', 'mixed');
  END IF;
END $$;

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_date date NOT NULL,
  workout_type workout_type NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  calories_burned integer NOT NULL DEFAULT 0,
  exercises jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date DESC);

-- Enable RLS
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete own workout sessions" ON workout_sessions;

-- Create policies
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout sessions"
  ON workout_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_workout_sessions_updated_at ON workout_sessions;

-- Create trigger
CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
