
-- Create a table to cache Ticketmaster events
CREATE TABLE public.ticketmaster_events_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  venue_name TEXT,
  venue_city TEXT,
  venue_state TEXT,
  ticket_url TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  event_data JSONB, -- Store full event data for reference
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_ticketmaster_cache_artist ON public.ticketmaster_events_cache(artist_name);
CREATE INDEX idx_ticketmaster_cache_event_date ON public.ticketmaster_events_cache(event_date);
CREATE INDEX idx_ticketmaster_cache_active ON public.ticketmaster_events_cache(is_active);
CREATE UNIQUE INDEX idx_ticketmaster_cache_unique_event ON public.ticketmaster_events_cache(artist_name, event_id);

-- Enable RLS
ALTER TABLE public.ticketmaster_events_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active events
CREATE POLICY "Anyone can view active cached events" 
  ON public.ticketmaster_events_cache 
  FOR SELECT 
  USING (is_active = true);

-- Policy for inserting/updating cached events (for the edge function)
CREATE POLICY "Service role can manage cached events" 
  ON public.ticketmaster_events_cache 
  FOR ALL
  USING (true)
  WITH CHECK (true);
