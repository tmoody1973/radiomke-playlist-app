-- Create song_links cache table for Songlink/Odesli responses
CREATE TABLE IF NOT EXISTS public.song_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'songlink',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expire_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  last_status INTEGER,
  last_error TEXT
);

-- Enable RLS
ALTER TABLE public.song_links ENABLE ROW LEVEL SECURITY;

-- Policies: public read, only service role can modify
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'song_links' AND policyname = 'Public can select song links'
  ) THEN
    CREATE POLICY "Public can select song links"
      ON public.song_links
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'song_links' AND policyname = 'Service role can insert song links'
  ) THEN
    CREATE POLICY "Service role can insert song links"
      ON public.song_links
      FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'song_links' AND policyname = 'Service role can update song links'
  ) THEN
    CREATE POLICY "Service role can update song links"
      ON public.song_links
      FOR UPDATE
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'song_links' AND policyname = 'Service role can delete song links'
  ) THEN
    CREATE POLICY "Service role can delete song links"
      ON public.song_links
      FOR DELETE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS update_song_links_updated_at ON public.song_links;
CREATE TRIGGER update_song_links_updated_at
BEFORE UPDATE ON public.song_links
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Helpful index for expiration lookups
CREATE INDEX IF NOT EXISTS idx_song_links_expire_at ON public.song_links (expire_at);
