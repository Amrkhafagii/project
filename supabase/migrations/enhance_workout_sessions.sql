/*
  # Enhance Workout Sessions with Performance Tracking

  1. Changes
    - Add performance metrics for progressive overload
    - Add exercises detail tracking
    - Add perceived exertion and mood

  2. New Columns
    - `performance_metrics` (jsonb) - Detailed performance data
    - `perceived_exertion` (integer) - RPE scale 1-10
    - `mood_before` (integer) - Mood scale 1-10
    - `mood_after` (integer) - Mood scale 1-10
*/

DO $$
BEGIN
  -- Add performance metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN performance_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add perceived exertion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'perceived_exertion'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN perceived_exertion integer;
  END IF;

  -- Add mood tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'mood_before'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN mood_before integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workout_sessions' AND column_name = 'mood_after'
  ) THEN
    ALTER TABLE workout_sessions ADD COLUMN mood_after integer;
  END IF;
END $$;

-- Add validation constraints
ALTER TABLE workout_sessions DROP CONSTRAINT IF EXISTS realistic_workout_metrics;
ALTER TABLE workout_sessions ADD CONSTRAINT realistic_workout_metrics CHECK (
  (perceived_exertion IS NULL OR perceived_exertion BETWEEN 1 AND 10) AND
  (mood_before IS NULL OR mood_before BETWEEN 1 AND 10) AND
  (mood_after IS NULL OR mood_after BETWEEN 1 AND 10)
);
