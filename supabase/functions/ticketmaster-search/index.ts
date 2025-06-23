
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales?: {
    public?: {
      startDateTime: string;
      endDateTime: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime?: string;
      dateTime: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      type: string;
      id: string;
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
    }>;
    attractions?: Array<{
      name: string;
      type: string;
      id: string;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { artistName, markets = ['30', '3', '16'] } = await req.json()
    
    if (!artistName || artistName.trim().length < 2) {
      return Response.json(
        { events: [] },
        { headers: corsHeaders }
      )
    }

    const apiKey = Deno.env.get('TICKETMASTER_API_KEY')
    if (!apiKey) {
      console.error('TICKETMASTER_API_KEY not configured')
      return Response.json(
        { events: [] },
        { headers: corsHeaders }
      )
    }

    console.log('Searching Ticketmaster for:', artistName, 'in markets:', markets)

    // Search for events in all specified markets
    const eventPromises = markets.map(async (marketId: string) => {
      const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
      url.searchParams.set('keyword', artistName.trim())
      url.searchParams.set('marketId', marketId)
      url.searchParams.set('size', '20')
      url.searchParams.set('sort', 'date,asc')
      url.searchParams.set('apikey', apiKey)

      try {
        const response = await fetch(url.toString())
        
        if (!response.ok) {
          console.error(`Ticketmaster API error for market ${marketId}:`, response.status, response.statusText)
          return []
        }

        const data = await response.json()
        return data._embedded?.events || []
      } catch (error) {
        console.error(`Error fetching events for market ${marketId}:`, error)
        return []
      }
    })

    const allResults = await Promise.all(eventPromises)
    const allEvents: TicketmasterEvent[] = allResults.flat()

    // Remove duplicates by event ID
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex((e: TicketmasterEvent) => e.id === event.id)
    )

    // Sort by date
    uniqueEvents.sort((a, b) => 
      new Date(a.dates.start.dateTime).getTime() - new Date(b.dates.start.dateTime).getTime()
    )

    // Filter events to only include future dates
    const now = new Date()
    const futureEvents = uniqueEvents.filter(event => 
      new Date(event.dates.start.dateTime) > now
    )

    console.log(`Found ${futureEvents.length} future events for ${artistName}`)

    return Response.json(
      { events: futureEvents },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error in ticketmaster-search function:', error)
    return Response.json(
      { error: 'Internal server error', events: [] },
      { status: 500, headers: corsHeaders }
    )
  }
})
