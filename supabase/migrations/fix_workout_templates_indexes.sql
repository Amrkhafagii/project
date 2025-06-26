/*
  # Fix Workout Templates Indexes

  1. Changes
    - Safely create indexes only if they don't exist
    - Uses DO blocks to check for existing indexes
*/

-- Create index for public templates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_workout_templates_public'
  ) THEN
    CREATE INDEX idx_workout_templates_public ON workout_templates(is_public) WHERE is_public = true;
  END IF;
END $$;

-- Create index for user templates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_workout_templates_user'
  ) THEN
    CREATE INDEX idx_workout_templates_user ON workout_templates(created_by);
  END IF;
END $$;
