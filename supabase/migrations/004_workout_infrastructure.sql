/*
  # Workout Infrastructure Enhancement

  1. New Tables
    - `workout_templates` - Preset workout routines
    - `workout_exercises` - Exercise details within workouts

  2. Changes
    - Add `performance_metrics` to workout_sessions
    - Add progressive overload tracking

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create workout templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  description text,
  category varchar(50),
  difficulty_level varchar(20),
  duration_minutes integer,
  exercises jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout exercises table for detailed tracking
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name varchar(100) NOT NULL,
  sets integer,
  reps integer[],
  weight_kg numeric[],
  distance_km numeric,
  duration_seconds integer,
  rest_seconds integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add performance metrics to workout_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN performance_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN template_id uuid REFERENCES workout_templates(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session ON workout_exercises(workout_session_id);

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for workout_templates
CREATE POLICY "Users can view own and public templates"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own templates"
  ON workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON workout_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for workout_exercises
CREATE POLICY "Users can view own exercises"
  ON workout_exercises
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_exercises.workout_session_id
    AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create exercises for own workouts"
  ON workout_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_exercises.workout_session_id
    AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own exercises"
  ON workout_exercises
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_exercises.workout_session_id
    AND workout_sessions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_exercises.workout_session_id
    AND workout_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own exercises"
  ON workout_exercises
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workout_sessions
    WHERE workout_sessions.id = workout_exercises.workout_session_id
    AND workout_sessions.user_id = auth.uid()
  ));
