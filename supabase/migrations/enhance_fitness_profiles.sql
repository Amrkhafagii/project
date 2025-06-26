/*
  # Enhance Fitness Profiles with Flexible Goals

  1. Changes
    - Add weekly goal override capability
    - Add dynamic hydration factor
    - Add compliance flags
    - Add performance metrics JSONB
    - Add goal scheduling support

  2. New Columns
    - `weekly_goal_override` (jsonb) - Custom goals per day of week
    - `dynamic_hydration_factor` (boolean) - Enable smart hydration
    - `gdpr_compliant` (boolean) - GDPR compliance flag
    - `hipaa_compliant` (boolean) - HIPAA compliance flag
    - `performance_metrics` (jsonb) - Adaptive performance data
    - `goal_schedule` (jsonb) - Scheduled goal variations
*/

DO $$
BEGIN
  -- Add weekly goal override
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'weekly_goal_override'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN weekly_goal_override jsonb DEFAULT '{
      "monday": null,
      "tuesday": null,
      "wednesday": null,
      "thursday": null,
      "friday": null,
      "saturday": null,
      "sunday": null
    }'::jsonb;
  END IF;

  -- Add dynamic hydration factor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'dynamic_hydration_factor'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN dynamic_hydration_factor boolean DEFAULT true;
  END IF;

  -- Add compliance flags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'gdpr_compliant'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN gdpr_compliant boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'hipaa_compliant'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN hipaa_compliant boolean DEFAULT false;
  END IF;

  -- Add performance metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN performance_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add goal schedule
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'goal_schedule'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN goal_schedule jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add daily calorie goal if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'daily_calorie_goal'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN daily_calorie_goal integer;
  END IF;

  -- Add daily water goal if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'daily_water_goal_ml'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN daily_water_goal_ml integer DEFAULT 2000;
  END IF;
END $$;
