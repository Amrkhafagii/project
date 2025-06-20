/*
  # Fix handle_new_user function for profiles table

  1. Changes
    - Create or replace the handle_new_user function to properly insert into profiles table
    - Fix the function to use user_id instead of trying to access full_name in users table
    - Ensure new users have their profiles created correctly

  2. Purpose
    - Resolves the "column full_name of relation users does not exist" error
    - Correctly handles user creation by creating a profile record
*/

-- Replace the handle_new_user function to correctly use the profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into the profiles table
  INSERT INTO public.profiles (user_id, full_name, role, phone, onboarded)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULL,
    NULL,
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists (should already exist based on your triggers list)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;