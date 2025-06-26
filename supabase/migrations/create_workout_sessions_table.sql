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

-- Check if table exists and handle accordingly
DO $$
BEGIN
  -- Check if workout_sessions table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_sessions') THEN
    -- Create new table
    CREATE TABLE workout_sessions (
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
  ELSE
    -- Table exists, check if it has 'date' column and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'date'
    ) THEN
      ALTER TABLE workout_sessions RENAME COLUMN date TO workout_date;
    END IF;
    
    -- Add any missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'workout_date'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN workout_date date NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'workout_type'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN workout_type workout_type NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'duration_minutes'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN duration_minutes integer NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'calories_burned'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN calories_burned integer NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'exercises'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN exercises jsonb DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'notes'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN notes text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'workout_sessions' AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE workout_sessions ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- Create index for faster queries (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_workout_sessions_user_date'
  ) THEN
    CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date DESC);
  END IF;
END $$;

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
