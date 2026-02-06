/*
  # Add Like Counter Functions

  ## Overview
  Create database functions to safely increment and decrement like counts on video resumes.

  ## Functions
  - `increment_likes(video_id)` - Safely increment likes_count for a video
  - `decrement_likes(video_id)` - Safely decrement likes_count for a video (minimum 0)
*/

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE video_resumes
  SET likes_count = likes_count + 1
  WHERE id = video_id;
END;
$$;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE video_resumes
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = video_id;
END;
$$;