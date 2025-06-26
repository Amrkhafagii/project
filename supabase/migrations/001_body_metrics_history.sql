/*
  # Body Metrics History Tracking

  1. New Tables
    - `body_metrics_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `log_date` (date)
      - `weight_kg` (numeric)
      - `body_fat_percentage` (numeric)
      - `waist_cm` (integer)
      - `chest_cm` (integer)
      - `hip_cm` (integer)
      - `arm_cm` (integer)
      - `thigh_cm` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `body_metrics_history` table
    - Add policies for users to manage their own metrics
*/

CREATE TABLE IF NOT EXISTS body_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL,
  weight_kg numeric(5,2),
  body_fat_percentage numeric(4,1),
  waist_cm integer,
  chest_cm integer,
  hip_cm integer,
  arm_cm integer,
  thigh_cm integer,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics_history(user_id, log_date DESC);

-- Enable RLS
ALTER TABLE body_metrics_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own body metrics"
  ON body_metrics_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own body metrics"
  ON body_metrics_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body metrics"
  ON body_metrics_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own body metrics"
  ON body_metrics_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
