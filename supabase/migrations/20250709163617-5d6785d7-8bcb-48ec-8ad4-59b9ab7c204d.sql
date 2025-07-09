-- Reactivate upcoming Ticketmaster events that were incorrectly deactivated
-- This fixes events like NXworries that disappeared from the playlist

UPDATE ticketmaster_events_cache 
SET is_active = true, updated_at = now()
WHERE is_active = false 
  AND event_date >= CURRENT_DATE
  AND event_date <= CURRENT_DATE + INTERVAL '6 months';

-- Log the reactivated events
SELECT 
  artist_name,
  event_name,
  event_date,
  venue_name,
  venue_city
FROM ticketmaster_events_cache 
WHERE is_active = true 
  AND event_date >= CURRENT_DATE
  AND updated_at >= now() - INTERVAL '1 minute'
ORDER BY artist_name, event_date;