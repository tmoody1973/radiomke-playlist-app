import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { checkCache, cacheResult, createSearchKey } from './cache-manager.ts';
import { searchYouTubeForBestMatch, formatVideoResult } from './youtube-api.ts';

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
    const { artist, song } = await req.json();
    console.log(`Searching YouTube for: "${song}" by "${artist}"`);

    if (!artist || !song) {
      console.error('Missing artist or song parameter');
      return new Response(
        JSON.stringify({ error: 'Artist and song are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create search key for caching
    const searchKey = createSearchKey(artist, song);
    
    // Check cache first
    const cachedResult = await checkCache(supabase, searchKey);

    if (cachedResult) {
      console.log('Found cached result for:', searchKey);
      if (cachedResult.found && cachedResult.video_id) {
        return new Response(
          JSON.stringify({
            found: true,
            videoId: cachedResult.video_id,
            title: cachedResult.title,
            channelTitle: cachedResult.channel_title,
            thumbnail: cachedResult.thumbnail,
            embedUrl: cachedResult.embed_url,
            fromCache: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Cached as "not found"
        return new Response(
          JSON.stringify({ found: false, fromCache: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Not in cache, need to search YouTube API
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!youtubeApiKey) {
      console.error('Missing YouTube API key');
      // Still cache this as "not found" to avoid repeated requests
      await cacheResult(supabase, searchKey, artist, song);

      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'YouTube API key not configured' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Search YouTube for the best match
    const { bestVideo, searchAttempts } = await searchYouTubeForBestMatch(artist, song, youtubeApiKey);

    if (!bestVideo) {
      console.log('No videos found for any search query');
      
      // Cache as "not found"
      await cacheResult(supabase, searchKey, artist, song);

      return new Response(
        JSON.stringify({ found: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Format the successful result
    const result = formatVideoResult(bestVideo);

    // Cache the result
    await cacheResult(supabase, searchKey, artist, song, result);

    return new Response(
      JSON.stringify({
        ...result,
        fromCache: false,
        searchAttempts
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('YouTube search error:', error);
    return new Response(
      JSON.stringify({ 
        found: false,
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});