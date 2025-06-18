
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
    let body;
    if (req.method === 'POST') {
      body = await req.json();
    } else {
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams);
    }

    const endpoint = body.endpoint || 'spins';
    const stationId = body.station || '';
    const count = body.count || '20';
    const start = body.start || '';
    const end = body.end || '';
    const search = body.search || '';
    const offset = body.offset || '0';
    const useCache = body.use_cache === 'true';

    console.log('Search parameters:', { search, useCache, offset, count, start, end });

    // If search is provided, search the database first
    if (search) {
      console.log('Searching in database for:', search);
      
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
      
      // Use simpler ILIKE search for song, artist, and release
      const searchTerm = `%${search}%`;
      query = query.or(`song.ilike.${searchTerm},artist.ilike.${searchTerm},release.ilike.${searchTerm}`);

      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      query = query.range(offsetNum, offsetNum + countNum - 1);

      const { data: cachedSongs, error: dbError } = await query;

      console.log('Database search result:', { 
        foundSongs: cachedSongs?.length || 0, 
        error: dbError?.message || 'none' 
      });

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

      // If no results found in database, fall back to API search
      console.log('No results found in database, searching Spinitron API');
    }

    // If using cache and no search term, try database first (including date filtering)
    if (useCache && !search) {
      console.log('Fetching from database cache');
      
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

      const offsetNum = parseInt(offset);
      const countNum = parseInt(count);
      
      query = query.range(offsetNum, offsetNum + countNum - 1);

      const { data: cachedSongs, error: dbError } = await query;

      console.log('Database cache result:', { 
        foundSongs: cachedSongs?.length || 0, 
        error: dbError?.message || 'none',
        dateFilter: { start, end }
      });

      if (!dbError && cachedSongs && cachedSongs.length > 0) {
        console.log('Found cached songs:', cachedSongs.length);
        
        // Check if we should also fetch fresh data from API for live updates
        const shouldFetchFresh = !hasActiveFilters && cachedSongs.length > 0;
        
        if (shouldFetchFresh) {
          // Check the timestamp of the most recent cached song
          const mostRecentSong = cachedSongs[0];
          const songAge = Date.now() - new Date(mostRecentSong.start_time).getTime();
          
          // If the most recent song is older than 10 minutes, fetch fresh data
          if (songAge > 600000) { // 10 minutes
            console.log('Most recent cached song is old, fetching fresh data from API...');
            // Continue to API fetch below
          } else {
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

            // Still fetch fresh data in background but return cached data immediately
            fetchFreshDataInBackground();

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
        } else {
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

    console.log('Fetching from Spinitron API:', spinitronUrl);

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

    // Always store new songs in database (upsert to avoid duplicates)
    if (data.items && data.items.length > 0) {
      console.log('Storing songs in database...');
      
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
        station_id: stationId || null
      }));

      console.log('Songs to store:', songsToStore.length, 'songs');

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
        console.log('Successfully stored', insertedData?.length || songsToStore.length, 'songs in database');
      }
    } else {
      console.log('No songs received from API to store');
    }

    // Background function to fetch fresh data
    async function fetchFreshDataInBackground() {
      try {
        console.log('Background: Fetching fresh data from Spinitron API...');
        
        const bgResponse = await fetch(spinitronUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        });

        if (bgResponse.ok) {
          const bgData = await bgResponse.json();
          
          if (bgData.items && bgData.items.length > 0) {
            const bgSongsToStore = bgData.items.map((item: any) => ({
              spinitron_id: item.id,
              song: item.song || 'Unknown Song',
              artist: item.artist || 'Unknown Artist',
              release: item.release || null,
              label: item.label || null,
              image: item.image || null,
              start_time: item.start,
              duration: item.duration || 180,
              episode_title: item.episode?.title || null,
              station_id: stationId || null
            }));

            const { error: bgInsertError } = await supabase
              .from('songs')
              .upsert(bgSongsToStore, { 
                onConflict: 'spinitron_id',
                ignoreDuplicates: false 
              });

            if (bgInsertError) {
              console.error('Background: Error storing songs:', bgInsertError);
            } else {
              console.log('Background: Stored', bgSongsToStore.length, 'fresh songs');
            }
          }
        }
      } catch (error) {
        console.error('Background fetch error:', error);
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
