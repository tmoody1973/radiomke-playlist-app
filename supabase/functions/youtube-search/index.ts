
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
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
    const searchKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check cache first
    console.log('Checking cache for:', searchKey);
    const { data: cachedResult, error: cacheError } = await supabase
      .from('youtube_cache')
      .select('*')
      .eq('search_key', searchKey)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache lookup error:', cacheError);
    }

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
      await supabase
        .from('youtube_cache')
        .insert({
          search_key: searchKey,
          artist,
          song,
          found: false
        });

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

    // Search YouTube API
    const searchQuery = encodeURIComponent(`${artist} ${song}`);
    console.log('Making YouTube API request for:', searchQuery);
    
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${youtubeApiKey}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('YouTube search failed:', await searchResponse.text());
      
      // Cache as "not found" to avoid repeated failed requests
      await supabase
        .from('youtube_cache')
        .insert({
          search_key: searchKey,
          artist,
          song,
          found: false
        });

      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Failed to search YouTube' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();
    console.log('YouTube search results:', searchData.items?.length || 0, 'videos found');
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos found for query');
      
      // Cache as "not found"
      await supabase
        .from('youtube_cache')
        .insert({
          search_key: searchKey,
          artist,
          song,
          found: false
        });

      return new Response(
        JSON.stringify({ found: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const video = searchData.items[0];
    const thumbnail = video.snippet.thumbnails.medium?.url || 
                     video.snippet.thumbnails.high?.url ||
                     video.snippet.thumbnails.default?.url || null;

    const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&start=0`;

    console.log('Video found:', video.snippet.title, 'by', video.snippet.channelTitle);
    console.log('Video ID:', video.id.videoId);

    // Cache the result
    const { error: insertError } = await supabase
      .from('youtube_cache')
      .insert({
        search_key: searchKey,
        artist,
        song,
        video_id: video.id.videoId,
        title: video.snippet.title,
        channel_title: video.snippet.channelTitle,
        thumbnail,
        embed_url: embedUrl,
        found: true
      });

    if (insertError) {
      console.error('Failed to cache result:', insertError);
    } else {
      console.log('Cached result for:', searchKey);
    }

    return new Response(
      JSON.stringify({
        found: true,
        videoId: video.id.videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        thumbnail: thumbnail,
        embedUrl: embedUrl,
        fromCache: false
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
