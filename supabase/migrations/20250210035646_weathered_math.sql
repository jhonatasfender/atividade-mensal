/*
  # Create activities table

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `project` (text)
      - `description` (text)
      - `hours` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activities` table
    - Add policies for authenticated users to:
      - Read their own activities
      - Create new activities
      - Update their own activities
*/

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  project text NOT NULL,
  description text NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);