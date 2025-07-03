
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

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

// Helper function to clean and normalize search terms
function cleanSearchTerm(term: string): string {
  return term
    .replace(/\(.*?\)/g, '') // Remove content in parentheses
    .replace(/\[.*?\]/g, '') // Remove content in brackets
    .replace(/feat\.|ft\.|featuring/gi, '') // Remove featuring indicators
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Generate multiple search variations to improve matching
function generateSearchQueries(artist: string, song: string): string[] {
  const cleanArtist = cleanSearchTerm(artist);
  const cleanSong = cleanSearchTerm(song);
  
  const queries = [
    `${cleanArtist} ${cleanSong}`, // Primary clean search
    `${artist} ${song}`, // Original search
    `${cleanSong} ${cleanArtist}`, // Reversed order
    `${cleanSong}`, // Song only
  ];
  
  // Remove duplicates and empty queries
  return [...new Set(queries)].filter(q => q.trim().length > 0);
}

// Check if a video title is a reasonable match
function isReasonableMatch(videoTitle: string, artist: string, song: string): boolean {
  const title = videoTitle.toLowerCase();
  const artistLower = artist.toLowerCase();
  const songLower = song.toLowerCase();
  
  // Check if both artist and song appear in title (flexible matching)
  const hasArtist = title.includes(artistLower) || 
                   artistLower.split(' ').some(word => word.length > 2 && title.includes(word));
  const hasSong = title.includes(songLower) || 
                 songLower.split(' ').some(word => word.length > 2 && title.includes(word));
  
  return hasArtist && hasSong;
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

    // Generate multiple search queries
    const searchQueries = generateSearchQueries(artist, song);
    console.log('Generated search queries:', searchQueries);

    let bestVideo = null;
    let searchAttempts = 0;

    // Try each search query until we find a good match
    for (const query of searchQueries) {
      if (bestVideo) break; // Found a good match, stop searching
      
      searchAttempts++;
      const searchQuery = encodeURIComponent(query);
      console.log(`Search attempt ${searchAttempts}: "${query}"`);
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=5&key=${youtubeApiKey}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        console.error('YouTube search failed:', await searchResponse.text());
        continue; // Try next query
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      console.log(`Search attempt ${searchAttempts} results:`, searchData.items?.length || 0, 'videos found');
      
      if (searchData.items && searchData.items.length > 0) {
        // Find the best matching video from the results
        for (const video of searchData.items) {
          if (isReasonableMatch(video.snippet.title, artist, song)) {
            console.log(`Found reasonable match: "${video.snippet.title}" by ${video.snippet.channelTitle}`);
            bestVideo = video;
            break;
          }
        }
        
        // If no reasonable match found but we have results, take the first one as fallback
        if (!bestVideo && searchAttempts === 1) {
          console.log('No perfect match found, using first result as fallback');
          bestVideo = searchData.items[0];
        }
      }
      
      // Add small delay between API calls to be respectful
      if (searchAttempts < searchQueries.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!bestVideo) {
      console.log('No videos found for any search query');
      
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

    const thumbnail = bestVideo.snippet.thumbnails.medium?.url || 
                     bestVideo.snippet.thumbnails.high?.url ||
                     bestVideo.snippet.thumbnails.default?.url || null;

    const embedUrl = `https://www.youtube.com/embed/${bestVideo.id.videoId}?autoplay=1&start=0`;

    console.log(`Best match found: "${bestVideo.snippet.title}" by ${bestVideo.snippet.channelTitle}`);
    console.log('Video ID:', bestVideo.id.videoId);

    // Cache the result
    const { error: insertError } = await supabase
      .from('youtube_cache')
      .insert({
        search_key: searchKey,
        artist,
        song,
        video_id: bestVideo.id.videoId,
        title: bestVideo.snippet.title,
        channel_title: bestVideo.snippet.channelTitle,
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
        videoId: bestVideo.id.videoId,
        title: bestVideo.snippet.title,
        channelTitle: bestVideo.snippet.channelTitle,
        thumbnail: thumbnail,
        embedUrl: embedUrl,
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
