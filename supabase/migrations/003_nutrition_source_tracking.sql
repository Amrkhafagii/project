/*
  # Nutrition Source Tracking

  1. Changes
    - Add source tracking to nutrition_logs
    - Add barcode and external_id for API integrations

  2. Purpose
    - Track where nutrition data comes from
    - Enable barcode scanning and API integrations
*/

-- Create source enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nutrition_source') THEN
    CREATE TYPE nutrition_source AS ENUM ('manual', 'order', 'barcode_scan', 'api_import');
  END IF;
END $$;

-- Add columns to nutrition_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'source'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN source nutrition_source DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN barcode varchar(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN external_id varchar(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nutrition_logs' AND column_name = 'external_source'
  ) THEN
    ALTER TABLE nutrition_logs ADD COLUMN external_source varchar(50);
  END IF;
END $$;

-- Add index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_barcode ON nutrition_logs(barcode) WHERE barcode IS NOT NULL;
