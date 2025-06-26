/*
  # Workout Templates System

  1. New Tables
    - `workout_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text) - strength, cardio, flexibility, etc.
      - `difficulty` (text) - beginner, intermediate, advanced
      - `duration_minutes` (integer)
      - `exercises` (jsonb) - Array of exercise details
      - `created_by` (uuid) - User who created it
      - `is_public` (boolean) - Available to all users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view public templates and their own
    - Users can only edit their own templates
*/

CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text NOT NULL,
  duration_minutes integer NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('strength', 'cardio', 'flexibility', 'sports', 'mixed')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT realistic_duration CHECK (duration_minutes BETWEEN 5 AND 300)
);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates and their own"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates"
  ON workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates"
  ON workout_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create index for performance
CREATE INDEX idx_workout_templates_public ON workout_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_workout_templates_user ON workout_templates(created_by);
