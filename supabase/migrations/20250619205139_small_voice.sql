/*
  # Fix users table INSERT policy

  1. Security Changes
    - Drop existing restrictive INSERT policy if it exists
    - Add new INSERT policy that allows authenticated users to create their own user records
    - Ensure users can only insert records where the user ID matches their auth ID

  2. Notes
    - This resolves the "new row violates row-level security policy" error
    - Users will be able to create their profile during signup/onboarding
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Create new INSERT policy that allows authenticated users to create their own records
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure we have a SELECT policy as well for users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
