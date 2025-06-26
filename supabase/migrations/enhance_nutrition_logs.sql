/*
  # Enhance Nutrition Logs with Source Tracking

  1. Changes
    - Add source column to track data origin
    - Add micronutrients tracking
    - Add barcode and external API data

  2. New Columns
    - `source` (enum) - Data source tracking
    - `micronutrients` (jsonb) - Vitamins and minerals
    - `barcode` (text) - Product barcode if scanned
    - `external_food_id` (text) - ID from external food database
*/

-- Create source enum type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nutrition_source') THEN
    CREATE TYPE nutrition_source AS ENUM ('manual', 'order', 'barcode_scan', 'api_import', 'voice_log');
  END IF;
END $$;

-- Add columns to nutrition_logs
DO $$
BEGIN
  -- Add source column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'source'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN source nutrition_source DEFAULT 'manual';
  END IF;

  -- Add micronutrients
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'micronutrients'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN micronutrients jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add barcode
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN barcode text;
  END IF;

  -- Add external food ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'external_food_id'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN external_food_id text;
  END IF;

  -- Add date column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'date'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add validation constraints
ALTER TABLE nutrition_logs DROP CONSTRAINT IF EXISTS realistic_nutrition;
ALTER TABLE nutrition_logs ADD CONSTRAINT realistic_nutrition CHECK (
  calories BETWEEN 0 AND 5000 AND
  protein_g BETWEEN 0 AND 500 AND
  carbs_g BETWEEN 0 AND 1000 AND
  fat_g BETWEEN 0 AND 500
);
