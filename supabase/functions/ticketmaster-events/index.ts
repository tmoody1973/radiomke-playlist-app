
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
    searchUrl.searchParams.set('keyword', artistName)
    searchUrl.searchParams.set('city', 'Chicago,Milwaukee,Madison')
    searchUrl.searchParams.set('classificationName', 'music')
    searchUrl.searchParams.set('apikey', apiKey)
    searchUrl.searchParams.set('size', '5')

    console.log(`Searching Ticketmaster for: ${artistName}`)
    
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
    const events = data._embedded?.events || []
    
    console.log(`Found ${events.length} events for ${artistName}`)
    
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
