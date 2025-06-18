
-- Create a table to store songs from Spinitron API
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spinitron_id INTEGER UNIQUE NOT NULL,
  song TEXT NOT NULL,
  artist TEXT NOT NULL,
  release TEXT,
  label TEXT,
  image TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  episode_title TEXT,
  station_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_songs_artist ON public.songs USING gin(to_tsvector('english', artist));
CREATE INDEX idx_songs_song ON public.songs USING gin(to_tsvector('english', song));
CREATE INDEX idx_songs_release ON public.songs USING gin(to_tsvector('english', release));
CREATE INDEX idx_songs_start_time ON public.songs (start_time DESC);
CREATE INDEX idx_songs_station_id ON public.songs (station_id);

-- Enable Row Level Security (making it public for now since it's playlist data)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to songs
CREATE POLICY "Anyone can view songs" 
  ON public.songs 
  FOR SELECT 
  USING (true);

-- Create policy to allow the app to insert songs (you might want to restrict this later)
CREATE POLICY "App can insert songs" 
  ON public.songs 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow the app to update songs
CREATE POLICY "App can update songs" 
  ON public.songs 
  FOR UPDATE 
  USING (true);
