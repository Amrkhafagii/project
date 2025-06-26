/*
  # Add hydration logs table

  1. New Tables
    - `hydration_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `amount_ml` (integer)
      - `time` (time)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hydration_logs` table
    - Add policies for users to manage their own hydration logs
*/

-- Create hydration_logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  amount_ml integer NOT NULL DEFAULT 0,
  time time NOT NULL DEFAULT CURRENT_TIME,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_hydration_logs_user_date ON hydration_logs(user_id, date DESC);

-- Enable RLS
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

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
