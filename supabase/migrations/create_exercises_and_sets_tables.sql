/*
  # Create exercises and workout sets tables

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (enum: chest, back, shoulders, arms, legs, core, cardio, full_body)
      - `equipment` (enum: barbell, dumbbell, machine, cable, bodyweight, cardio_machine, other)
      - `muscle_groups` (text array)
      - `instructions` (text)
      - `created_at` (timestamp)
    
    - `workout_sets`
      - `id` (uuid, primary key)
      - `workout_session_id` (uuid, foreign key)
      - `exercise_id` (uuid, foreign key)
      - `set_number` (integer)
      - `reps` (integer)
      - `weight_kg` (decimal)
      - `distance_km` (decimal)
      - `duration_seconds` (integer)
      - `rest_seconds` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `exercise_personal_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `exercise_id` (uuid, foreign key)
      - `record_type` (enum: max_weight, max_reps, max_volume, fastest_time, longest_distance)
      - `value` (decimal)
      - `achieved_date` (date)
      - `workout_session_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Create exercise category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_category') THEN
    CREATE TYPE exercise_category AS ENUM ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body');
  END IF;
END $$;

-- Create equipment type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
    CREATE TYPE equipment_type AS ENUM ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'cardio_machine', 'other');
  END IF;
END $$;

-- Create record type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'record_type') THEN
    CREATE TYPE record_type AS ENUM ('max_weight', 'max_reps', 'max_volume', 'fastest_time', 'longest_distance');
  END IF;
END $$;

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category exercise_category NOT NULL,
  equipment equipment_type NOT NULL,
  muscle_groups text[] DEFAULT '{}',
  instructions text,
  created_at timestamptz DEFAULT now()
);

-- Create workout_sets table
CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  set_number integer NOT NULL DEFAULT 1,
  reps integer,
  weight_kg decimal(6,2),
  distance_km decimal(6,2),
  duration_seconds integer,
  rest_seconds integer DEFAULT 60,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create exercise_personal_records table
CREATE TABLE IF NOT EXISTS exercise_personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  record_type record_type NOT NULL,
  value decimal(10,2) NOT NULL,
  achieved_date date NOT NULL,
  workout_session_id uuid REFERENCES workout_sessions(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON exercise_personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_personal_records ENABLE ROW LEVEL SECURITY;

-- Policies for exercises (public read)
CREATE POLICY "Anyone can view exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for workout_sets
CREATE POLICY "Users can view own workout sets"
  ON workout_sets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own workout sets"
  ON workout_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout sets"
  ON workout_sets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout sets"
  ON workout_sets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Policies for exercise_personal_records
CREATE POLICY "Users can view own personal records"
  ON exercise_personal_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal records"
  ON exercise_personal_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal records"
  ON exercise_personal_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default exercises
INSERT INTO exercises (name, category, equipment, muscle_groups, instructions) VALUES
  -- Chest exercises
  ('Bench Press', 'chest', 'barbell', ARRAY['chest', 'triceps', 'shoulders'], 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up'),
  ('Dumbbell Chest Press', 'chest', 'dumbbell', ARRAY['chest', 'triceps'], 'Lie on bench with dumbbells, press up and together'),
  ('Push-ups', 'chest', 'bodyweight', ARRAY['chest', 'triceps', 'core'], 'Start in plank position, lower body until chest nearly touches floor, push up'),
  
  -- Back exercises
  ('Deadlift', 'back', 'barbell', ARRAY['back', 'glutes', 'hamstrings'], 'Stand with feet hip-width, grip bar, lift by extending hips and knees'),
  ('Pull-ups', 'back', 'bodyweight', ARRAY['back', 'biceps'], 'Hang from bar, pull body up until chin over bar'),
  ('Bent Over Row', 'back', 'barbell', ARRAY['back', 'biceps'], 'Hinge at hips, row bar to stomach'),
  
  -- Legs exercises
  ('Squat', 'legs', 'barbell', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'Bar on shoulders, squat down until thighs parallel, stand up'),
  ('Leg Press', 'legs', 'machine', ARRAY['quadriceps', 'glutes'], 'Sit in machine, press weight up with legs'),
  ('Romanian Deadlift', 'legs', 'barbell', ARRAY['hamstrings', 'glutes'], 'Hold bar at hips, hinge forward keeping legs slightly bent'),
  
  -- Shoulders exercises
  ('Overhead Press', 'shoulders', 'barbell', ARRAY['shoulders', 'triceps'], 'Press bar from shoulders overhead'),
  ('Lateral Raise', 'shoulders', 'dumbbell', ARRAY['shoulders'], 'Raise dumbbells to sides until arms parallel to floor'),
  
  -- Arms exercises
  ('Bicep Curl', 'arms', 'dumbbell', ARRAY['biceps'], 'Curl dumbbells up, rotating palms to face shoulders'),
  ('Tricep Extension', 'arms', 'dumbbell', ARRAY['triceps'], 'Hold dumbbell overhead, lower behind head, extend up'),
  
  -- Core exercises
  ('Plank', 'core', 'bodyweight', ARRAY['core'], 'Hold body straight in push-up position on forearms'),
  ('Crunches', 'core', 'bodyweight', ARRAY['abs'], 'Lie on back, curl shoulders towards pelvis'),
  
  -- Cardio exercises
  ('Treadmill Run', 'cardio', 'cardio_machine', ARRAY['cardiovascular'], 'Run or walk on treadmill at desired pace'),
  ('Cycling', 'cardio', 'cardio_machine', ARRAY['cardiovascular', 'legs'], 'Pedal on stationary bike at desired resistance')
ON CONFLICT (name) DO NOTHING;
