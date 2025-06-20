
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Initialize Supabase client for database operations
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Parse request body for parameters
    let body;
    if (req.method === 'POST') {
      body = await req.json();
    } else {
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams);
    }

    const endpoint = body.endpoint || 'spins';
    const stationId = body.station || 'hyfin'; // Default to HYFIN
    const count = body.count || '20';
    const start = body.start || '';
    const end = body.end || '';
    const search = body.search || '';
    const offset = body.offset || '0';
    const useCache = body.use_cache === 'true';

    console.log('Search parameters:', { search, useCache, offset, count, start, end, stationId });

    // Get the station info and API key
    const { data: stationData, error: stationError } = await supabase
      .from('stations')
      .select('*')
      .eq('id', stationId)
      .single();

    if (stationError || !stationData) {
      console.error('Station not found:', stationId, stationError);
      return new Response(
        JSON.stringify({ error: 'Station not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the appropriate API key for this station
    const apiKey = Deno.env.get(stationData.api_key_secret_name);
    
    if (!apiKey) {
      console.error(`API key not found for station ${stationId}:`, stationData.api_key_secret_name);
      return new Response(
        JSON.stringify({ error: 'API key not configured for this station' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If search is provided, search the database first
    if (search) {
      console.log('Searching in database for:', search, 'station:', stationId);
      
      let query = supabase
        .from('songs')
        .select('*')
        .eq('station_id', stationId)
        .order('start_time', { ascending: false });

      // Apply date filters
      if (start) {
        query = query.gte('start_time', start);
      }
      
      if (end) {
        query = query.lte('start_time', end);
      }
      
      // Use simpler ILIKE search for song, artist, and release
      const searchTerm = `%${search}%`;
      query = query.or(`song.ilike.${searchTerm},artist.ilike.${searchTerm},release.ilike.${searchTerm}`);

      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      query = query.range(offsetNum, offsetNum + countNum - 1);

      const { data: cachedSongs, error: dbError } = await query;

      console.log('Database search result:', { 
        foundSongs: cachedSongs?.length || 0, 
        error: dbError?.message || 'none',
        station: stationId
      });

      if (!dbError && cachedSongs && cachedSongs.length > 0) {
        console.log('Found cached songs:', cachedSongs.length);
        
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

      // If no results found in database, fall back to API search
      console.log('No results found in database, searching Spinitron API');
    }

    // If using cache and no search term, try database first
    if (useCache && !search) {
      console.log('Fetching from database cache for station:', stationId);
      
      let query = supabase
        .from('songs')
        .select('*')
        .eq('station_id', stationId)
        .order('start_time', { ascending: false });

      // Apply date filters
      if (start) {
        query = query.gte('start_time', start);
      }
      
      if (end) {
        query = query.lte('start_time', end);
      }

      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      query = query.range(offsetNum, offsetNum + countNum - 1);

      const { data: cachedSongs, error: dbError } = await query;

      console.log('Database cache result:', { 
        foundSongs: cachedSongs?.length || 0, 
        error: dbError?.message || 'none',
        dateFilter: { start, end },
        station: stationId
      });

      if (!dbError && cachedSongs && cachedSongs.length > 0) {
        console.log('Found cached songs:', cachedSongs.length);
        
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

    // Fetch from Spinitron API
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

    console.log('Fetching from Spinitron API:', spinitronUrl, 'for station:', stationId);

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
    console.log('Successfully fetched data from API:', data.items?.length || 0, 'items for station:', stationId);

    // Always store new songs in database (upsert to avoid duplicates)
    if (data.items && data.items.length > 0) {
      console.log('Storing songs in database for station:', stationId);
      
      const songsToStore = data.items.map((item: any) => ({
        spinitron_id: item.id,
        song: item.song || 'Unknown Song',
        artist: item.artist || 'Unknown Artist',
        release: item.release || null,
        label: item.label || null,
        image: item.image || null,
        start_time: item.start,
        duration: item.duration || 180,
        episode_title: item.episode?.title || null,
        station_id: stationId
      }));

      console.log('Songs to store:', songsToStore.length, 'songs for station:', stationId);

      const { data: insertedData, error: insertError } = await supabase
        .from('songs')
        .upsert(songsToStore, { 
          onConflict: 'spinitron_id',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        console.error('Error storing songs in database:', insertError);
      } else {
        console.log('Successfully stored', insertedData?.length || songsToStore.length, 'songs in database for station:', stationId);
      }
    } else {
      console.log('No songs received from API to store for station:', stationId);
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
