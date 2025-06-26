/*
  # Add hydration logs table

  1. New Tables
    - `hydration_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `log_date` (date)
      - `amount_ml` (integer)
      - `log_time` (time)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hydration_logs` table
    - Add policies for users to manage their own hydration logs
*/

-- Check if table exists and handle accordingly
DO $$
BEGIN
  -- Check if hydration_logs table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hydration_logs') THEN
    -- Create new table
    CREATE TABLE hydration_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      log_date date NOT NULL,
      amount_ml integer NOT NULL DEFAULT 0,
      log_time time NOT NULL DEFAULT CURRENT_TIME,
      created_at timestamptz DEFAULT now()
    );
  ELSE
    -- Table exists, check if it has 'date' column and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'date'
    ) THEN
      ALTER TABLE hydration_logs RENAME COLUMN date TO log_date;
    END IF;
    
    -- Check if it has 'time' column and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'time'
    ) THEN
      ALTER TABLE hydration_logs RENAME COLUMN time TO log_time;
    END IF;
    
    -- Add any missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'id'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'log_date'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN log_date date NOT NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'amount_ml'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN amount_ml integer NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'log_time'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN log_time time NOT NULL DEFAULT CURRENT_TIME;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'hydration_logs' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE hydration_logs ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- Create index for faster queries (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_hydration_logs_user_date'
  ) THEN
    CREATE INDEX idx_hydration_logs_user_date ON hydration_logs(user_id, log_date DESC);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Users can create own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Users can update own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Users can delete own hydration logs" ON hydration_logs;

-- Create policies
CREATE POLICY "Users can view own hydration logs"
  ON hydration_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hydration logs"
  ON hydration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration logs"
  ON hydration_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration logs"
  ON hydration_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
