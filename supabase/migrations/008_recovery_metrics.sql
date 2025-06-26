/*
  # Recovery Metrics & Additional Tracking

  1. New Tables
    - `recovery_metrics` - Track sleep, heart rate, stress
    - `fasting_sessions` - Intermittent fasting tracking
    - `micronutrients_log` - Vitamin/mineral tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create recovery metrics table
CREATE TABLE IF NOT EXISTS recovery_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  sleep_hours numeric(3,1),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  resting_heart_rate integer,
  hrv integer, -- Heart Rate Variability
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  recovery_score integer CHECK (recovery_score BETWEEN 0 AND 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Create fasting sessions table
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  target_hours integer,
  fasting_type varchar(50), -- '16:8', '18:6', '24h', 'custom'
  completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create micronutrients log table
CREATE TABLE IF NOT EXISTS micronutrients_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  vitamin_a_mcg numeric(8,2),
  vitamin_c_mg numeric(8,2),
  vitamin_d_mcg numeric(8,2),
  vitamin_e_mg numeric(8,2),
  vitamin_k_mcg numeric(8,2),
  calcium_mg numeric(8,2),
  iron_mg numeric(8,2),
  magnesium_mg numeric(8,2),
  zinc_mg numeric(8,2),
  omega3_g numeric(8,2),
  fiber_g numeric(8,2),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recovery_metrics_user_date ON recovery_metrics(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_active ON fasting_sessions(user_id, completed) WHERE completed = false;
CREATE INDEX IF NOT EXISTS idx_micronutrients_user_date ON micronutrients_log(user_id, log_date DESC);

-- Enable RLS
ALTER TABLE recovery_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micronutrients_log ENABLE ROW LEVEL SECURITY;

-- Policies for recovery_metrics
CREATE POLICY "Users can manage own recovery metrics"
  ON recovery_metrics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for fasting_sessions
CREATE POLICY "Users can manage own fasting sessions"
  ON fasting_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for micronutrients_log
CREATE POLICY "Users can manage own micronutrients"
  ON micronutrients_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
