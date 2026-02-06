/*
  # Gigster App Database Schema

  ## Overview
  Complete database schema for Gigster - a video-first job marketplace for the restaurant and bar industry.
  
  ## New Tables
  
  ### 1. profiles
  Core user profile table for both employees and employers
  - `id` (uuid, primary key) - References auth.users
  - `user_type` (text) - Either 'employee' or 'employer'
  - `full_name` (text) - User's full name
  - `email` (text) - User's email
  - `phone` (text) - Contact phone number
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - User biography
  - `location` (text) - City/area location
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. employee_profiles
  Extended profile information for employees
  - `id` (uuid, primary key) - References profiles.id
  - `position_type` (text) - Job position (server, bartender, cook, manager, etc.)
  - `years_experience` (integer) - Years of experience
  - `availability` (text[]) - Available days/times
  - `hourly_rate_min` (integer) - Minimum desired hourly rate
  - `hourly_rate_max` (integer) - Maximum desired hourly rate
  - `skills` (text[]) - Array of skills
  - `certifications` (text[]) - Certifications (food handler, alcohol service, etc.)

  ### 3. employer_profiles
  Extended profile information for employers
  - `id` (uuid, primary key) - References profiles.id
  - `business_name` (text) - Name of restaurant/bar
  - `business_type` (text) - Type (restaurant, bar, cafe, etc.)
  - `website` (text) - Business website
  - `description` (text) - Business description

  ### 4. video_resumes
  Video resume content created by employees
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - References employee_profiles.id
  - `video_url` (text) - Storage path for video file
  - `thumbnail_url` (text) - Video thumbnail image
  - `duration` (integer) - Video duration in seconds
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `is_active` (boolean) - Whether video is active/visible
  - `views_count` (integer) - Number of views
  - `likes_count` (integer) - Number of likes
  - `created_at` (timestamptz) - Upload timestamp

  ### 5. likes
  Tracks employer interest in employee video resumes
  - `id` (uuid, primary key)
  - `employer_id` (uuid) - References employer_profiles.id
  - `video_resume_id` (uuid) - References video_resumes.id
  - `employee_id` (uuid) - References employee_profiles.id (denormalized for easier queries)
  - `created_at` (timestamptz) - Like timestamp

  ### 6. conversations
  Message threads between employers and employees
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - References employee_profiles.id
  - `employer_id` (uuid) - References employer_profiles.id
  - `last_message_at` (timestamptz) - Timestamp of last message
  - `last_message_preview` (text) - Preview of last message
  - `created_at` (timestamptz) - Conversation start timestamp

  ### 7. messages
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid) - References conversations.id
  - `sender_id` (uuid) - References profiles.id
  - `content` (text) - Message content
  - `read_at` (timestamptz) - When message was read
  - `created_at` (timestamptz) - Message timestamp

  ### 8. interviews
  Scheduled interviews between employers and employees
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - References employee_profiles.id
  - `employer_id` (uuid) - References employer_profiles.id
  - `scheduled_at` (timestamptz) - Interview date/time
  - `location` (text) - Interview location
  - `notes` (text) - Additional notes
  - `status` (text) - Status: pending, confirmed, cancelled, completed
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read and update their own profiles
  - Employees can manage their own video resumes
  - Employers can view all active video resumes
  - Both parties can manage their own messages and conversations
  - Interview scheduling requires mutual access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('employee', 'employer')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employee_profiles table
CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  position_type text NOT NULL,
  years_experience integer DEFAULT 0,
  availability text[] DEFAULT '{}',
  hourly_rate_min integer,
  hourly_rate_max integer,
  skills text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}'
);

-- Create employer_profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL,
  website text,
  description text
);

-- Create video_resumes table
CREATE TABLE IF NOT EXISTS video_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  video_resume_id uuid NOT NULL REFERENCES video_resumes(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employer_id, video_resume_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, employer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  location text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Employee profiles policies
CREATE POLICY "Anyone can view employee profiles"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees can insert their own profile"
  ON employee_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employees can update their own profile"
  ON employee_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Employer profiles policies
CREATE POLICY "Anyone can view employer profiles"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can insert their own profile"
  ON employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can update their own profile"
  ON employer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Video resumes policies
CREATE POLICY "Anyone can view active video resumes"
  ON video_resumes FOR SELECT
  TO authenticated
  USING (is_active = true OR employee_id IN (
    SELECT id FROM employee_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Employees can insert their own video resumes"
  ON video_resumes FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their own video resumes"
  ON video_resumes FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can delete their own video resumes"
  ON video_resumes FOR DELETE
  TO authenticated
  USING (employee_id = auth.uid());

-- Likes policies
CREATE POLICY "Employers can view their own likes"
  ON likes FOR SELECT
  TO authenticated
  USING (employer_id = auth.uid());

CREATE POLICY "Employees can view likes on their videos"
  ON likes FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employers can insert likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can delete their own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (employer_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR employer_id = auth.uid()
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id = auth.uid() OR employer_id = auth.uid()
  );

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    employee_id = auth.uid() OR employer_id = auth.uid()
  )
  WITH CHECK (
    employee_id = auth.uid() OR employer_id = auth.uid()
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE employee_id = auth.uid() OR employer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE employee_id = auth.uid() OR employer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Interviews policies
CREATE POLICY "Users can view their own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR employer_id = auth.uid()
  );

CREATE POLICY "Employers can create interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Users can update their own interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (
    employee_id = auth.uid() OR employer_id = auth.uid()
  )
  WITH CHECK (
    employee_id = auth.uid() OR employer_id = auth.uid()
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_video_resumes_employee ON video_resumes(employee_id);
CREATE INDEX IF NOT EXISTS idx_video_resumes_active ON video_resumes(is_active);
CREATE INDEX IF NOT EXISTS idx_likes_employer ON likes(employer_id);
CREATE INDEX IF NOT EXISTS idx_likes_video ON likes(video_resume_id);
CREATE INDEX IF NOT EXISTS idx_conversations_employee ON conversations(employee_id);
CREATE INDEX IF NOT EXISTS idx_conversations_employer ON conversations(employer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_employee ON interviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_interviews_employer ON interviews(employer_id);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-resumes', 'video-resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for video-resumes bucket
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'video-resumes');

CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'video-resumes');

CREATE POLICY "Users can update their own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);