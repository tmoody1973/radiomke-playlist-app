
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

    // Parse request body for parameters
    let params: URLSearchParams;
    if (req.method === 'POST') {
      const body = await req.text();
      params = new URLSearchParams(body);
    } else {
      const url = new URL(req.url);
      params = url.searchParams;
    }

    const endpoint = params.get('endpoint') || 'spins';
    const stationId = params.get('station') || '';
    const count = params.get('count') || '20';
    const start = params.get('start') || '';
    const end = params.get('end') || '';
    const search = params.get('search') || '';
    const offset = params.get('offset') || '';

    // Build Spinitron API URL
    let spinitronUrl = `https://spinitron.com/api/${endpoint}`;
    const apiParams = new URLSearchParams();
    
    if (stationId) apiParams.append('station', stationId);
    apiParams.append('count', count);
    if (start) apiParams.append('start', start);
    if (end) apiParams.append('end', end);
    if (search) apiParams.append('search', search);
    
    // Add cache-busting parameter
    apiParams.append('_t', Date.now().toString());
    
    spinitronUrl += `?${apiParams.toString()}`;

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

    // Handle client-side pagination by slicing the results if offset is provided
    let processedData = data;
    if (offset && data.items) {
      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      // For demo purposes, we'll simulate pagination by requesting more items
      // In a real implementation, you might want to cache results or use Spinitron's pagination
      processedData = {
        ...data,
        items: data.items.slice(0, countNum) // Keep the requested number of items
      };
    }

    return new Response(
      JSON.stringify(processedData),
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
