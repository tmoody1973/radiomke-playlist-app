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
    
    // Simple rate limiting - track per-artist requests in memory
    const rateLimitKey = `youtube:${artist.toLowerCase()}-${song.toLowerCase()}`
    if (!globalThis.youtubeRateLimit) {
      globalThis.youtubeRateLimit = new Map()
    }
    
    const lastRequest = globalThis.youtubeRateLimit.get(rateLimitKey) || 0
    const timeSinceLastRequest = Date.now() - lastRequest
    
    // If we've searched this exact song recently (within 1 hour), skip API call
    if (timeSinceLastRequest < 3600000) { // 1 hour
      console.log(`Rate limited YouTube search for ${artist} - ${song} (${Math.floor(timeSinceLastRequest/60000)} minutes ago)`)
      
      // Return cached result if available, otherwise return "not found"
      const cachedResult = await checkCache(supabase, searchKey);
      if (cachedResult) {
        return new Response(
          JSON.stringify({
            ...(cachedResult.found ? {
              found: true,
              videoId: cachedResult.video_id,
              title: cachedResult.title,
              channelTitle: cachedResult.channel_title,
              thumbnail: cachedResult.thumbnail,
              embedUrl: cachedResult.embed_url,
            } : { found: false }),
            fromCache: true,
            rateLimited: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ found: false, rateLimited: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record this search attempt
    globalThis.youtubeRateLimit.set(rateLimitKey, Date.now())

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