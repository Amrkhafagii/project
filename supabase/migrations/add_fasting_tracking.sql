/*
  # Fasting Tracking System

  1. New Tables
    - `fasting_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `target_hours` (integer)
      - `fasting_type` (text) - 16:8, 18:6, 20:4, OMAD, custom
      - `notes` (text)
      - `completed` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only manage their own fasting sessions
*/

CREATE TABLE IF NOT EXISTS fasting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  target_hours integer NOT NULL,
  fasting_type text NOT NULL,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_fasting_type CHECK (fasting_type IN ('16:8', '18:6', '20:4', 'OMAD', 'custom')),
  CONSTRAINT valid_target_hours CHECK (target_hours BETWEEN 1 AND 72),
  CONSTRAINT valid_times CHECK (end_time IS NULL OR end_time > start_time)
);

ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fasting sessions"
  ON fasting_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_fasting_user_active ON fasting_sessions(user_id, start_time DESC) 
WHERE end_time IS NULL;

CREATE INDEX idx_fasting_user_completed ON fasting_sessions(user_id, end_time DESC) 
WHERE completed = true;
