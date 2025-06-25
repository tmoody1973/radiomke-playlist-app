
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface CachedEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_state: string | null;
  ticket_url: string | null;
  price_min: number | null;
  price_max: number | null;
  updated_at: string;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: { name: string };
      state: { name: string; stateCode: string };
    }>;
    attractions?: Array<{
      name: string;
    }>;
  };
  url: string;
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
}

export const getCachedEvents = async (supabase: any, artistName: string): Promise<CachedEvent[]> => {
  const { data: cachedEvents, error: cacheError } = await supabase
    .from('ticketmaster_events_cache')
    .select('*')
    .eq('artist_name', artistName)
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (cacheError) {
    console.error('Cache lookup error:', cacheError)
    return []
  }

  return cachedEvents || []
}

export const isRecentCache = (cachedEvents: CachedEvent[]): boolean => {
  if (!cachedEvents || cachedEvents.length === 0) return false

  const mostRecentCache = cachedEvents.reduce((latest, event) => 
    new Date(event.updated_at) > new Date(latest.updated_at) ? event : latest
  )
  
  const cacheAge = Date.now() - new Date(mostRecentCache.updated_at).getTime()
  return cacheAge < (24 * 60 * 60 * 1000) // 24 hours
}

export const formatCachedEventsAsTicketmaster = (cachedEvents: CachedEvent[]): TicketmasterEvent[] => {
  return cachedEvents.map(event => ({
    id: event.event_id,
    name: event.event_name,
    dates: {
      start: {
        localDate: event.event_date,
        localTime: event.event_time
      }
    },
    _embedded: {
      venues: event.venue_name ? [{
        name: event.venue_name,
        city: { name: event.venue_city || '' },
        state: { name: event.venue_state || '', stateCode: event.venue_state || '' }
      }] : []
    },
    url: event.ticket_url || '',
    priceRanges: (event.price_min || event.price_max) ? [{
      min: event.price_min || 0,
      max: event.price_max || 999,
      currency: 'USD'
    }] : []
  }))
}

export const cacheEvents = async (supabase: any, artistName: string, events: TicketmasterEvent[]): Promise<void> => {
  if (events.length === 0) {
    console.log(`No exact matches found for ${artistName}, caching negative result`)
    
    // Deactivate old cached events
    await supabase
      .from('ticketmaster_events_cache')
      .update({ is_active: false })
      .eq('artist_name', artistName)
    
    return
  }

  console.log(`Caching ${events.length} exact-match events for artist: ${artistName}`)
  
  // First, deactivate old cached events for this artist
  await supabase
    .from('ticketmaster_events_cache')
    .update({ is_active: false })
    .eq('artist_name', artistName)

  // Insert new events into cache
  const cacheData = events.map(event => {
    const venue = event._embedded?.venues?.[0]
    const priceRange = event.priceRanges?.[0]
    
    return {
      artist_name: artistName,
      event_id: event.id,
      event_name: event.name,
      event_date: event.dates.start.localDate,
      event_time: event.dates.start.localTime || null,
      venue_name: venue?.name || null,
      venue_city: venue?.city?.name || null,
      venue_state: venue?.state?.stateCode || null,
      ticket_url: event.url || null,
      price_min: priceRange?.min || null,
      price_max: priceRange?.max || null,
      event_data: event, // Store full event data as JSON
      is_active: true
    }
  })

  const { error: insertError } = await supabase
    .from('ticketmaster_events_cache')
    .insert(cacheData)

  if (insertError) {
    console.error('Error caching events:', insertError)
  } else {
    console.log(`Successfully cached ${cacheData.length} exact-match events for ${artistName}`)
  }
}
