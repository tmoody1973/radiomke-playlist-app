
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // Use the artist name directly as the keyword for better artist-specific results
    searchUrl.searchParams.set('keyword', artistName.trim())
    searchUrl.searchParams.set('city', 'Chicago,Milwaukee,Madison')
    searchUrl.searchParams.set('classificationName', 'music')
    // Sort by date to get upcoming events first
    searchUrl.searchParams.set('sort', 'date,asc')
    searchUrl.searchParams.set('apikey', apiKey)
    searchUrl.searchParams.set('size', '10')

    console.log(`Searching Ticketmaster for artist: ${artistName}`)
    console.log(`Search URL: ${searchUrl.toString()}`)
    
    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      console.error(`Ticketmaster API error: ${response.status} ${response.statusText}`)
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
    
    // Filter events to be more artist-specific by checking if the artist name appears in the event name
    const artistWords = artistName.toLowerCase().split(' ').filter(word => word.length > 2)
    events = events.filter(event => {
      const eventName = event.name.toLowerCase()
      // Check if any significant word from the artist name appears in the event name
      return artistWords.some(word => eventName.includes(word))
    })
    
    console.log(`Found ${events.length} filtered events for artist: ${artistName}`)
    
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
