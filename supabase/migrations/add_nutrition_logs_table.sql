/*
  # Add nutrition logs table

  1. New Tables
    - `nutrition_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
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

-- Create meal type enum
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  meal_type meal_type NOT NULL,
  calories integer NOT NULL DEFAULT 0,
  protein_g numeric(5,1) DEFAULT 0,
  carbs_g numeric(5,1) DEFAULT 0,
  fat_g numeric(5,1) DEFAULT 0,
  food_items jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date DESC);

-- Enable RLS
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

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
