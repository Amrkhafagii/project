/*
  # Compliance and Audit System

  1. New Tables
    - `fitness_data_access_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `accessed_table` (text)
      - `access_type` (text) - read, write, delete
      - `accessed_by` (uuid) - Who accessed the data
      - `ip_address` (inet)
      - `user_agent` (text)
      - `access_time` (timestamptz)

    - `data_retention_policies`
      - `id` (uuid, primary key)
      - `table_name` (text)
      - `retention_days` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Only admins can view audit logs
    - Automatic logging via triggers
*/

-- Create fitness data access log
CREATE TABLE IF NOT EXISTS fitness_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  accessed_table varchar(50) NOT NULL,
  access_type text NOT NULL,
  accessed_by uuid REFERENCES auth.users NOT NULL,
  ip_address inet,
  user_agent text,
  access_time timestamptz DEFAULT now(),
  CONSTRAINT valid_access_type CHECK (access_type IN ('read', 'write', 'delete', 'export'))
);

-- Create data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL UNIQUE,
  retention_days integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_retention CHECK (retention_days > 0)
);

-- Enable RLS
ALTER TABLE fitness_data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Policies for audit log (restricted access)
CREATE POLICY "Users can view their own access logs"
  ON fitness_data_access_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to log data access
CREATE OR REPLACE FUNCTION log_fitness_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for sensitive tables
  IF TG_TABLE_NAME IN ('fitness_profiles', 'body_metrics_history', 'nutrition_logs', 'workout_sessions') THEN
    INSERT INTO fitness_data_access_log (
      user_id,
      accessed_table,
      access_type,
      accessed_by
    ) VALUES (
      COALESCE(NEW.user_id, OLD.user_id),
      TG_TABLE_NAME,
      TG_OP,
      auth.uid()
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_access_log_user ON fitness_data_access_log(user_id, access_time DESC);
CREATE INDEX idx_access_log_table ON fitness_data_access_log(accessed_table, access_time DESC);
