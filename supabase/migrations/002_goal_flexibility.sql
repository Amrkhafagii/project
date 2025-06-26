/*
  # Goal Flexibility Enhancement

  1. Changes
    - Add `weekly_goal_override` to fitness_profiles
    - Add `goal_schedule` for day-specific goals
    - Add `dynamic_hydration_factor` for adaptive hydration

  2. Purpose
    - Allow flexible weekly patterns
    - Support different goals for different days
    - Enable context-aware hydration goals
*/

-- Add weekly goal override
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'weekly_goal_override'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN weekly_goal_override jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add goal schedule for day-specific targets
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'goal_schedule'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN goal_schedule jsonb DEFAULT '{
      "monday": {},
      "tuesday": {},
      "wednesday": {},
      "thursday": {},
      "friday": {},
      "saturday": {},
      "sunday": {}
    }'::jsonb;
  END IF;

  -- Add dynamic hydration factor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fitness_profiles' AND column_name = 'dynamic_hydration_factor'
  ) THEN
    ALTER TABLE fitness_profiles ADD COLUMN dynamic_hydration_factor boolean DEFAULT true;
  END IF;
END $$;
