
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!youtubeApiKey) {
      console.error('Missing YouTube API key');
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

    // Search for the track on YouTube
    const searchQuery = encodeURIComponent(`${artist} ${song}`);
    console.log('YouTube search query:', searchQuery);
    
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

    console.log('Video found:', video.snippet.title, 'by', video.snippet.channelTitle);
    console.log('Video ID:', video.id.videoId);

    return new Response(
      JSON.stringify({
        found: true,
        videoId: video.id.videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        thumbnail: thumbnail,
        // YouTube doesn't provide direct audio URLs due to copyright, 
        // but we can use the video ID for embedding
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&start=0`
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
