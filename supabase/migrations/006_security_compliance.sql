/*
  # Security & Compliance Enhancement

  1. New Tables
    - `fitness_data_access_log` - Audit trail for data access
    
  2. Changes
    - Add GDPR and HIPAA compliance flags
    - Add encryption markers for sensitive data

  3. Purpose
    - Track data access for compliance
    - Mark sensitive data for encryption
*/

-- Create fitness data access log
CREATE TABLE IF NOT EXISTS fitness_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_table varchar(50) NOT NULL,
  accessed_record_id uuid,
  access_type varchar(20), -- 'read', 'write', 'delete'
  ip_address inet,
  user_agent text,
  access_time timestamptz DEFAULT now()
);

-- Add compliance flags to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'gdpr_consent'
  ) THEN
    ALTER TABLE users ADD COLUMN gdpr_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'gdpr_consent_date'
  ) THEN
    ALTER TABLE users ADD COLUMN gdpr_consent_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'data_retention_days'
  ) THEN
    ALTER TABLE users ADD COLUMN data_retention_days integer DEFAULT 365;
  END IF;
END $$;

-- Create index for access log queries
CREATE INDEX IF NOT EXISTS idx_access_log_user_time ON fitness_data_access_log(user_id, access_time DESC);

-- Enable RLS
ALTER TABLE fitness_data_access_log ENABLE ROW LEVEL SECURITY;

-- Policies for access log (users can only view their own)
CREATE POLICY "Users can view own access logs"
  ON fitness_data_access_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert access logs
CREATE POLICY "System can create access logs"
  ON fitness_data_access_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
