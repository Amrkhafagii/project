/*
  # Link meal plans to workout sessions

  1. Changes
    - Add `workout_session_id` column to meal_plans table
    - Create foreign key relationship to workout_sessions

  2. Purpose
    - Enable workout-nutrition pairing
    - Allow meal plans to be associated with specific workouts
*/

-- Add workout_session_id column to meal_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_plans' AND column_name = 'workout_session_id'
  ) THEN
    ALTER TABLE meal_plans 
    ADD COLUMN workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_plans_workout_session ON meal_plans(workout_session_id);
