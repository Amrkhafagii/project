/*
  # Body Metrics History Tracking

  1. New Tables
    - `body_metrics_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `log_date` (date)
      - `weight_kg` (numeric)
      - `body_fat_percentage` (numeric)
      - `waist_cm` (integer)
      - `chest_cm` (integer)
      - `hip_cm` (integer)
      - `arm_cm` (integer)
      - `thigh_cm` (integer)
      - `resting_heart_rate` (integer)
      - `blood_pressure_systolic` (integer)
      - `blood_pressure_diastolic` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `body_metrics_history` table
    - Add policy for users to manage their own metrics
*/

CREATE TABLE IF NOT EXISTS body_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  log_date date NOT NULL,
  weight_kg numeric(5,2),
  body_fat_percentage numeric(4,1),
  waist_cm integer,
  chest_cm integer,
  hip_cm integer,
  arm_cm integer,
  thigh_cm integer,
  resting_heart_rate integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_date UNIQUE (user_id, log_date),
  CONSTRAINT realistic_weight CHECK (weight_kg BETWEEN 20 AND 300),
  CONSTRAINT realistic_body_fat CHECK (body_fat_percentage BETWEEN 3 AND 60),
  CONSTRAINT realistic_measurements CHECK (
    (waist_cm IS NULL OR waist_cm BETWEEN 40 AND 200) AND
    (chest_cm IS NULL OR chest_cm BETWEEN 50 AND 200) AND
    (hip_cm IS NULL OR hip_cm BETWEEN 50 AND 200) AND
    (arm_cm IS NULL OR arm_cm BETWEEN 15 AND 60) AND
    (thigh_cm IS NULL OR thigh_cm BETWEEN 30 AND 100)
  ),
  CONSTRAINT realistic_heart_rate CHECK (resting_heart_rate IS NULL OR resting_heart_rate BETWEEN 40 AND 120),
  CONSTRAINT realistic_blood_pressure CHECK (
    (blood_pressure_systolic IS NULL OR blood_pressure_systolic BETWEEN 70 AND 200) AND
    (blood_pressure_diastolic IS NULL OR blood_pressure_diastolic BETWEEN 40 AND 130)
  )
);

ALTER TABLE body_metrics_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own body metrics"
  ON body_metrics_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_body_metrics_user_date ON body_metrics_history(user_id, log_date DESC);
