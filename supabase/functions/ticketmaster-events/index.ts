
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  getCachedEvents, 
  isRecentCache, 
  formatCachedEventsAsTicketmaster, 
  cacheEvents 
} from './utils/cache.ts'
import { filterEventsByArtist, filterEventsForCaching } from './utils/filtering.ts'
import { fetchTicketmasterEvents } from './utils/api.ts'

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

// Simple in-memory rate limiting
    const rateLimitKey = `ticketmaster:${artistName.toLowerCase()}`
    const lastApiCall = globalThis.ticketmasterRateLimit?.get(rateLimitKey) || 0
    const timeSinceLastCall = Date.now() - lastApiCall
    
    // If we called this artist's API less than 30 seconds ago, skip API call
    if (timeSinceLastCall < 30000) {
      console.log(`⏰ Rate limiting API call for ${artistName} (${Math.floor(timeSinceLastCall/1000)}s ago)`)
      return new Response(
        JSON.stringify({ events: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize rate limit cache if it doesn't exist
    if (!globalThis.ticketmasterRateLimit) {
      globalThis.ticketmasterRateLimit = new Map()
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we have cached events for this artist
    const cachedEvents = await getCachedEvents(supabase, artistName)

    // If we have cached events less than 24 hours old, return them
    if (cachedEvents.length > 0 && isRecentCache(cachedEvents)) {
      const cacheAge = Date.now() - new Date(cachedEvents[0].updated_at).getTime()
      console.log(`Returning cached events for artist: ${artistName} (cached ${Math.floor(cacheAge / (60 * 60 * 1000))} hours ago)`)
      
      const formattedEvents = formatCachedEventsAsTicketmaster(cachedEvents)
      return new Response(
        JSON.stringify({ events: formattedEvents }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    try {
      const apiEvents = await fetchTicketmasterEvents(artistName, apiKey)
      
      // Filter events by artist
      let filteredEvents = filterEventsByArtist(apiEvents, artistName)
      
      // Use same filtering for caching and display to ensure consistency
      const eventsToCache = filterEventsForCaching(apiEvents, artistName)
      
      // Limit displayed events
      filteredEvents = filteredEvents.slice(0, 10)

      // Cache the filtered events
      await cacheEvents(supabase, artistName, eventsToCache)
      
      console.log(`Found ${filteredEvents.length} filtered events for artist: ${artistName}`)
      if (filteredEvents.length > 0) {
        console.log('Sample event names:', filteredEvents.slice(0, 3).map(e => e.name))
      }
      
      return new Response(
        JSON.stringify({ events: filteredEvents }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (apiError) {
      console.error(`API fetch failed: ${apiError}`)
      
      // If API fails, return cached events even if they're older
      if (cachedEvents.length > 0) {
        console.log(`API failed, returning ${cachedEvents.length} older cached events`)
        const formattedEvents = formatCachedEventsAsTicketmaster(cachedEvents)
        return new Response(
          JSON.stringify({ events: formattedEvents }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch events from Ticketmaster' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
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
