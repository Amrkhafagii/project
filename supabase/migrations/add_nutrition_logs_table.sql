/*
  # Add nutrition logs table

  1. New Tables
    - `nutrition_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `log_date` (date)
      - `meal_type` (enum: breakfast, lunch, dinner, snack)
      - `calories` (integer)
      - `protein_g` (numeric)
      - `carbs_g` (numeric)
      - `fat_g` (numeric)
      - `food_items` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `nutrition_logs` table
    - Add policies for users to manage their own nutrition logs
*/

-- Create meal type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_type') THEN
    CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
  END IF;
END $$;

-- Check if table exists and handle accordingly
DO $$
BEGIN
  -- Check if nutrition_logs table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutrition_logs') THEN
    -- Create new table
    CREATE TABLE nutrition_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      log_date date NOT NULL,
      meal_type meal_type NOT NULL,
      calories integer NOT NULL DEFAULT 0,
      protein_g numeric(5,1) DEFAULT 0,
      carbs_g numeric(5,1) DEFAULT 0,
      fat_g numeric(5,1) DEFAULT 0,
      food_items jsonb DEFAULT '[]'::jsonb,
      created_at timestamptz DEFAULT now()
    );
  ELSE
    -- Table exists, check if it has 'date' column and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'date'
    ) THEN
      ALTER TABLE nutrition_logs RENAME COLUMN date TO log_date;
    END IF;
    
    -- Add any missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'id'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'log_date'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN log_date date NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'meal_type'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN meal_type meal_type NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'calories'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN calories integer NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'protein_g'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN protein_g numeric(5,1) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'carbs_g'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN carbs_g numeric(5,1) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'fat_g'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN fat_g numeric(5,1) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'food_items'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN food_items jsonb DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nutrition_logs' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE nutrition_logs ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- Create index for faster queries (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_nutrition_logs_user_date'
  ) THEN
    CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can create own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can update own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can delete own nutrition logs" ON nutrition_logs;

-- Create policies
CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own nutrition logs"
  ON nutrition_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs"
  ON nutrition_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
