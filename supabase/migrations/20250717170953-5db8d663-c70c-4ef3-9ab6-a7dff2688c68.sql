-- Add fields to support manually added songs
ALTER TABLE public.songs 
ADD COLUMN is_manual BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN added_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN manual_added_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN spotify_track_id TEXT,
ADD COLUMN spotify_artist_id TEXT,
ADD COLUMN spotify_album_id TEXT,
ADD COLUMN enhanced_metadata JSONB;

-- Create index for manual songs
CREATE INDEX idx_songs_is_manual ON public.songs (is_manual);
CREATE INDEX idx_songs_manual_added_at ON public.songs (manual_added_at);

-- Update RLS policies to allow authenticated users to insert manual songs
CREATE POLICY "Authenticated users can insert manual songs" 
ON public.songs 
FOR INSERT 
TO authenticated
WITH CHECK (is_manual = true AND added_by_user_id = auth.uid());

-- Allow authenticated users to update their own manual songs
CREATE POLICY "Users can update their own manual songs" 
ON public.songs 
FOR UPDATE 
TO authenticated
USING (is_manual = true AND added_by_user_id = auth.uid());

-- Create a function to check for time conflicts
CREATE OR REPLACE FUNCTION public.check_song_time_conflict(
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_duration INTEGER,
  p_station_id TEXT,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.songs
  WHERE station_id = p_station_id
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND (
      -- Check if new song overlaps with existing songs
      (start_time <= p_start_time AND start_time + INTERVAL '1 second' * COALESCE(duration, 180) > p_start_time)
      OR
      (start_time < p_start_time + INTERVAL '1 second' * p_duration AND start_time >= p_start_time)
      OR
      (start_time >= p_start_time AND start_time <= p_start_time + INTERVAL '1 second' * p_duration)
    );
  
  RETURN conflict_count > 0;
END;
$$;