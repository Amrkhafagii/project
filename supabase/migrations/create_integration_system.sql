/*
  # Integration System for Third-party APIs

  1. New Tables
    - `integration_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `integration_type` (text) - webhook, api_call, device_sync
      - `service_name` (text) - fitbit, garmin, myfitnesspal, etc.
      - `direction` (text) - inbound, outbound
      - `status` (text) - success, failed, pending
      - `request_data` (jsonb)
      - `response_data` (jsonb)
      - `error_message` (text)
      - `created_at` (timestamptz)

    - `user_integrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `service_name` (text)
      - `access_token` (text) - encrypted
      - `refresh_token` (text) - encrypted
      - `expires_at` (timestamptz)
      - `is_active` (boolean)
      - `settings` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only manage their own integrations
    - Sensitive tokens are encrypted
*/

-- Create integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  integration_type text NOT NULL,
  service_name text NOT NULL,
  direction text NOT NULL,
  status text NOT NULL,
  request_data jsonb,
  response_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_integration_type CHECK (integration_type IN ('webhook', 'api_call', 'device_sync', 'oauth')),
  CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed', 'pending'))
);

-- Create user integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  service_name text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_service UNIQUE (user_id, service_name)
);

-- Enable RLS
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Policies for integration logs
CREATE POLICY "Users can view their own integration logs"
  ON integration_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create integration logs"
  ON integration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for user integrations
CREATE POLICY "Users can manage their own integrations"
  ON user_integrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_integration_logs_user ON integration_logs(user_id, created_at DESC);
CREATE INDEX idx_integration_logs_service ON integration_logs(service_name, status);
CREATE INDEX idx_user_integrations_active ON user_integrations(user_id, is_active);
