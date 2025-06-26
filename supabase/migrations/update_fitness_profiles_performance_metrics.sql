/*
  # Update fitness profiles with performance metrics

  1. Changes
    - Add `performance_metrics` (jsonb) column to store performance data
    - Add `daily_calorie_goal` (integer) column
    - Add `daily_protein_goal` (integer) column
    - Add `daily_water_goal_ml` (integer) column

  2. Purpose
    - Track performance trends and adaptive recommendations
    - Store calculated daily goals for quick access
*/

-- Add new columns to fitness_profiles
DO $$
BEGIN
  -- Add performance_metrics column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN performance_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add daily_calorie_goal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'daily_calorie_goal'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN daily_calorie_goal integer DEFAULT 2000;
  END IF;

  -- Add daily_protein_goal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'daily_protein_goal'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN daily_protein_goal integer DEFAULT 50;
  END IF;

  -- Add daily_water_goal_ml column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'daily_water_goal_ml'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN daily_water_goal_ml integer DEFAULT 2000;
  END IF;
END $$;
