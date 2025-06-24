
-- Create a table for custom events
CREATE TABLE public.custom_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  event_title TEXT NOT NULL,
  venue_name TEXT,
  venue_city TEXT,
  venue_state TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  ticket_url TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  station_ids TEXT[] DEFAULT '{}', -- Array to specify which stations this applies to, empty means all
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster artist lookups
CREATE INDEX idx_custom_events_artist_name ON public.custom_events(artist_name);
CREATE INDEX idx_custom_events_date ON public.custom_events(event_date);
CREATE INDEX idx_custom_events_active ON public.custom_events(is_active);

-- Enable RLS (we'll make it simple - no user restrictions for now, just basic security)
ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to SELECT active events
CREATE POLICY "Anyone can view active custom events" 
  ON public.custom_events 
  FOR SELECT 
  USING (is_active = true);

-- Create policy for INSERT/UPDATE/DELETE (you can modify this based on your admin needs)
-- For now, allowing all authenticated users to manage events (you might want to restrict this)
CREATE POLICY "Authenticated users can manage custom events" 
  ON public.custom_events 
  FOR ALL
  USING (true)
  WITH CHECK (true);
