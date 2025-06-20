/*
  # Authentication Enhancement Tables - Final Corrected Version
*/

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  attempts integer DEFAULT 0,
  last_attempt timestamptz,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  device_info jsonb,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  device_name text,
  platform text,
  os_version text,
  app_version text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Add new columns to users table with more robust error handling
DO $$
BEGIN
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column last_login_at already exists or could not be added';
  END;
  
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column email_verified already exists or could not be added';
  END;
  
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column phone_verified already exists or could not be added';
  END;
  
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column preferences already exists or could not be added';
  END;
  
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column metadata already exists or could not be added';
  END;
  
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Column deleted_at already exists or could not be added';
  END;
END $$;

-- Create standard indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until ON login_attempts(locked_until);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);

-- Special handling for deleted_at index with proper existence checks
DO $$
BEGIN
  -- First, ensure the column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'deleted_at'
  ) THEN
    BEGIN
      ALTER TABLE users ADD COLUMN deleted_at timestamptz;
      RAISE NOTICE 'Added deleted_at column to users table';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not add deleted_at column to users table';
      RETURN;
    END;
  END IF;

  -- Then create the index if needed
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'idx_users_deleted_at'
  ) THEN
    BEGIN
      EXECUTE 'CREATE INDEX idx_users_deleted_at ON users(deleted_at)';
      RAISE NOTICE 'Created idx_users_deleted_at index';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create idx_users_deleted_at index';
    END;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_attempts
DROP POLICY IF EXISTS "Service role can manage login attempts" ON login_attempts;
CREATE POLICY "Service role can manage login attempts"
  ON login_attempts
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON user_sessions;

CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_devices
DROP POLICY IF EXISTS "Users can view own devices" ON user_devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON user_devices;
DROP POLICY IF EXISTS "Service role can manage devices" ON user_devices;

CREATE POLICY "Users can view own devices"
  ON user_devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON user_devices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage devices"
  ON user_devices
  FOR ALL
  TO service_role
  USING (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for login_attempts
DROP TRIGGER IF EXISTS update_login_attempts_updated_at ON login_attempts;
CREATE TRIGGER update_login_attempts_updated_at
  BEFORE UPDATE ON login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_devices last_active_at
CREATE OR REPLACE FUNCTION update_last_active_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_devices_last_active ON user_devices;
CREATE TRIGGER update_user_devices_last_active
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active_at();