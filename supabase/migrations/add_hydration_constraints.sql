/*
  # Add Hydration Validation Constraints

  1. Changes
    - Add realistic amount constraints to hydration_logs
    - Ensure date column exists
    - Add time column if missing
*/

-- Add constraints to hydration_logs
DO $$
BEGIN
  -- Add date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'date'
  ) THEN
    ALTER TABLE hydration_logs ADD COLUMN date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add time column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'time'
  ) THEN
    ALTER TABLE hydration_logs ADD COLUMN time time NOT NULL DEFAULT CURRENT_TIME;
  END IF;

  -- Rename columns if they have different names
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'log_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'date'
  ) THEN
    ALTER TABLE hydration_logs RENAME COLUMN log_date TO date;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'log_time'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hydration_logs' AND column_name = 'time'
  ) THEN
    ALTER TABLE hydration_logs RENAME COLUMN log_time TO time;
  END IF;
END $$;

-- Add validation constraint
ALTER TABLE hydration_logs DROP CONSTRAINT IF EXISTS realistic_amount;
ALTER TABLE hydration_logs ADD CONSTRAINT realistic_amount CHECK (amount_ml BETWEEN 50 AND 5000);
