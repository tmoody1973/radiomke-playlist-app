
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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

    // Initialize Supabase client for database operations
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
    const offset = params.get('offset') || '0';
    const useCache = params.get('use_cache') === 'true';

    // If search is provided or we want to use cache, try database first
    if (search || useCache) {
      console.log('Searching in database for:', search || 'cached songs');
      
      let query = supabase
        .from('songs')
        .select('*')
        .order('start_time', { ascending: false });

      // Apply filters
      if (stationId) {
        query = query.eq('station_id', stationId);
      }
      
      if (start) {
        query = query.gte('start_time', start);
      }
      
      if (end) {
        query = query.lte('start_time', end);
      }
      
      if (search) {
        // Use full-text search for better performance
        query = query.or(`
          to_tsvector('english', song).@@.websearch_to_tsquery('english', '${search}'),
          to_tsvector('english', artist).@@.websearch_to_tsquery('english', '${search}'),
          to_tsvector('english', release).@@.websearch_to_tsquery('english', '${search}')
        `);
      }

      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      query = query.range(offsetNum, offsetNum + countNum - 1);

      const { data: cachedSongs, error: dbError } = await query;

      if (!dbError && cachedSongs && cachedSongs.length > 0) {
        console.log('Found cached songs:', cachedSongs.length);
        
        // Transform database format to API format
        const transformedSongs = cachedSongs.map(song => ({
          id: song.spinitron_id,
          start: song.start_time,
          duration: song.duration || 180,
          song: song.song,
          artist: song.artist,
          release: song.release,
          label: song.label,
          image: song.image,
          episode: song.episode_title ? { title: song.episode_title } : undefined
        }));

        return new Response(
          JSON.stringify({ items: transformedSongs }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }
        );
      }
    }

    // Fetch from Spinitron API if not found in cache or no search
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
    console.log('Successfully fetched data from API:', data.items?.length || 0, 'items');

    // Store new songs in database (upsert to avoid duplicates)
    if (data.items && data.items.length > 0) {
      const songsToStore = data.items.map((item: any) => ({
        spinitron_id: item.id,
        song: item.song,
        artist: item.artist,
        release: item.release,
        label: item.label,
        image: item.image,
        start_time: item.start,
        duration: item.duration || 180,
        episode_title: item.episode?.title,
        station_id: stationId || null
      }));

      const { error: insertError } = await supabase
        .from('songs')
        .upsert(songsToStore, { 
          onConflict: 'spinitron_id',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('Error storing songs in database:', insertError);
      } else {
        console.log('Stored', songsToStore.length, 'songs in database');
      }
    }

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
