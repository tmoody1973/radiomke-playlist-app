
-- Create a table to cache YouTube search results
CREATE TABLE public.youtube_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_key TEXT NOT NULL UNIQUE, -- normalized artist-song combination
  artist TEXT NOT NULL,
  song TEXT NOT NULL,
  video_id TEXT,
  title TEXT,
  channel_title TEXT,
  thumbnail TEXT,
  embed_url TEXT,
  found BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_youtube_cache_search_key ON public.youtube_cache (search_key);
CREATE INDEX idx_youtube_cache_artist_song ON public.youtube_cache (artist, song);

-- Enable RLS (make it public since it's just YouTube metadata)
ALTER TABLE public.youtube_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Anyone can view YouTube cache" 
  ON public.youtube_cache 
  FOR SELECT 
  USING (true);

-- Create policy to allow the app to insert/update YouTube cache
CREATE POLICY "App can manage YouTube cache" 
  ON public.youtube_cache 
  FOR ALL
  USING (true);
