
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPINITRON_API_KEY');
    if (!apiKey) {
      console.error('SPINITRON_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'spins';
    const stationId = url.searchParams.get('station') || '';
    const count = url.searchParams.get('count') || '20';
    const start = url.searchParams.get('start') || '';
    const end = url.searchParams.get('end') || '';
    const search = url.searchParams.get('search') || '';

    // Build Spinitron API URL
    let spinitronUrl = `https://spinitron.com/api/${endpoint}`;
    const params = new URLSearchParams();
    
    if (stationId) params.append('station', stationId);
    params.append('count', count);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (search) params.append('search', search);
    
    // Add cache-busting parameter
    params.append('_t', Date.now().toString());
    
    spinitronUrl += `?${params.toString()}`;

    console.log('Fetching from Spinitron:', spinitronUrl);

    const response = await fetch(spinitronUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Spinitron API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch from Spinitron API',
          status: response.status 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched data:', data.items?.length || 0, 'items');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
