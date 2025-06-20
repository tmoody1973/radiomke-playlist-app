
-- Add a stations table to manage different radio stations
CREATE TABLE public.stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_secret_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the existing HYFIN station and new 88Nine station
INSERT INTO public.stations (id, name, api_key_secret_name) VALUES 
  ('hyfin', 'HYFIN', 'SPINITRON_API_KEY'),
  ('88nine', '88Nine Radio Milwaukee', 'SPINITRON_88NINE_API_KEY');

-- Update the songs table to better reference stations
-- First, update existing songs to reference HYFIN
UPDATE public.songs SET station_id = 'hyfin' WHERE station_id IS NULL OR station_id = '';

-- Make station_id required and add foreign key constraint
ALTER TABLE public.songs 
  ALTER COLUMN station_id SET NOT NULL,
  ADD CONSTRAINT fk_songs_station 
    FOREIGN KEY (station_id) REFERENCES public.stations(id);

-- Add index for better performance when filtering by station
CREATE INDEX IF NOT EXISTS idx_songs_station_start_time ON public.songs (station_id, start_time DESC);

-- Enable RLS on stations table
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to stations
CREATE POLICY "Anyone can view stations" 
  ON public.stations 
  FOR SELECT 
  USING (true);
