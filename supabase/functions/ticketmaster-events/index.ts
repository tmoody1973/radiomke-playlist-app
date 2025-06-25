
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { artistName } = await req.json()
    
    if (!artistName?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Artist name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we have cached events for this artist
    const { data: cachedEvents, error: cacheError } = await supabase
      .from('ticketmaster_events_cache')
      .select('*')
      .eq('artist_name', artistName)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })

    if (cacheError) {
      console.error('Cache lookup error:', cacheError)
    }

    // If we have cached events less than 24 hours old, return them
    if (cachedEvents && cachedEvents.length > 0) {
      const mostRecentCache = cachedEvents.reduce((latest, event) => 
        new Date(event.updated_at) > new Date(latest.updated_at) ? event : latest
      )
      
      const cacheAge = Date.now() - new Date(mostRecentCache.updated_at).getTime()
      const isRecentCache = cacheAge < (24 * 60 * 60 * 1000) // 24 hours

      if (isRecentCache) {
        console.log(`Returning cached events for artist: ${artistName} (cached ${Math.floor(cacheAge / (60 * 60 * 1000))} hours ago)`)
        // Convert cached events to match Ticketmaster format
        const formattedEvents = cachedEvents.map(event => ({
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

        return new Response(
          JSON.stringify({ events: formattedEvents }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Only fetch from API if we don't have recent cache
    const apiKey = Deno.env.get('TICKETMASTER_API_KEY')
    if (!apiKey) {
      console.error('TICKETMASTER_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const searchUrl = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    searchUrl.searchParams.set('keyword', artistName.trim())
    searchUrl.searchParams.set('city', 'Chicago,Milwaukee,Madison')
    searchUrl.searchParams.set('classificationName', 'music')
    searchUrl.searchParams.set('sort', 'date,asc')
    searchUrl.searchParams.set('apikey', apiKey)
    searchUrl.searchParams.set('size', '20')

    console.log(`Making fresh API call to Ticketmaster for artist: ${artistName}`)
    
    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      console.error(`Ticketmaster API error: ${response.status} ${response.statusText}`)
      
      // If API fails, return cached events even if they're older
      if (cachedEvents && cachedEvents.length > 0) {
        console.log(`API failed, returning ${cachedEvents.length} older cached events`)
        const formattedEvents = cachedEvents.map(event => ({
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

        return new Response(
          JSON.stringify({ events: formattedEvents }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch events from Ticketmaster' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    let events = data._embedded?.events || []
    
    // Filter events for the artist
    const cleanArtistName = artistName.toLowerCase().trim()
    events = events.filter(event => {
      const eventName = event.name.toLowerCase()
      const attractions = event._embedded?.attractions || []
      
      const matchesAttraction = attractions.some(attraction => {
        const attractionName = attraction.name.toLowerCase()
        return attractionName === cleanArtistName || 
               attractionName.includes(cleanArtistName) ||
               cleanArtistName.includes(attractionName)
      })
      
      if (matchesAttraction) return true
      
      const artistInTitle = (
        eventName.startsWith(cleanArtistName + ' ') ||
        eventName.startsWith(cleanArtistName + ':') ||
        eventName.startsWith(cleanArtistName + '-') ||
        eventName.includes(' ' + cleanArtistName + ' ') ||
        eventName.includes(' ' + cleanArtistName + ':') ||
        eventName.includes(' ' + cleanArtistName + '-') ||
        eventName.includes('(' + cleanArtistName + ')') ||
        eventName.endsWith(' ' + cleanArtistName) ||
        eventName === cleanArtistName
      )
      
      return artistInTitle
    })
    
    events = events.slice(0, 10)

    // Cache the new events in the database
    if (events.length > 0) {
      console.log(`Caching ${events.length} events for artist: ${artistName}`)
      
      // First, deactivate old cached events for this artist
      await supabase
        .from('ticketmaster_events_cache')
        .update({ is_active: false })
        .eq('artist_name', artistName)

      // Insert new events into cache
      const eventsToCache = events.map(event => {
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
        .insert(eventsToCache)

      if (insertError) {
        console.error('Error caching events:', insertError)
      } else {
        console.log(`Successfully cached ${eventsToCache.length} events for ${artistName}`)
      }
    } else {
      // Even if no events found, cache that fact to avoid repeated API calls
      console.log(`No events found for ${artistName}, caching negative result`)
      
      // Deactivate old cached events
      await supabase
        .from('ticketmaster_events_cache')
        .update({ is_active: false })
        .eq('artist_name', artistName)
    }
    
    console.log(`Found ${events.length} filtered events for artist: ${artistName}`)
    if (events.length > 0) {
      console.log('Sample event names:', events.slice(0, 3).map(e => e.name))
    }
    
    return new Response(
      JSON.stringify({ events }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in ticketmaster-events function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
