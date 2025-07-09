
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
    .replace(/[^\w\s]/g, ' ') // Remove special characters except word chars and spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Helper function to create abbreviated artist names
function getArtistVariations(artist: string): string[] {
  const variations = [artist];
  const cleanArtist = cleanSearchTerm(artist);
  
  if (cleanArtist !== artist) {
    variations.push(cleanArtist);
  }
  
  // Try abbreviated versions (J. Cole -> J Cole, The Beatles -> Beatles)
  const abbreviated = artist.replace(/\./g, '').replace(/^The\s+/i, '');
  if (abbreviated !== artist) {
    variations.push(abbreviated);
  }
  
  return [...new Set(variations)];
}

// Generate multiple search variations to improve matching
function generateSearchQueries(artist: string, song: string): string[] {
  const cleanArtist = cleanSearchTerm(artist);
  const cleanSong = cleanSearchTerm(song);
  const artistVariations = getArtistVariations(artist);
  
  const queries = [
    // Primary searches with original and clean versions
    `${cleanArtist} ${cleanSong}`,
    `${artist} ${song}`,
    `${cleanSong} ${cleanArtist}`,
    
    // Enhanced searches with YouTube-specific terms
    `${cleanArtist} ${cleanSong} official`,
    `${cleanArtist} ${cleanSong} music video`,
    `${cleanArtist} ${cleanSong} audio`,
    `${cleanArtist} ${cleanSong} lyrics`,
    `${cleanArtist} ${cleanSong} live`,
    
    // Try different artist variations
    ...artistVariations.map(artistVar => `${artistVar} ${cleanSong}`),
    
    // Song-only searches with modifiers
    `${cleanSong} official audio`,
    `${cleanSong} music video`,
    `${cleanSong}`,
    
    // Reversed order attempts
    `${cleanSong} by ${cleanArtist}`,
    `${cleanSong} ${cleanArtist} official`
  ];
  
  // Remove duplicates and empty queries
  return [...new Set(queries)].filter(q => q.trim().length > 0);
}

// Check if a channel is likely an official music channel
function isOfficialMusicChannel(channelTitle: string): boolean {
  const channel = channelTitle.toLowerCase();
  return channel.includes('vevo') || 
         channel.includes('records') || 
         channel.includes('music') ||
         channel.includes('official') ||
         channel.endsWith(' - topic') ||
         channel.includes('label');
}

// Calculate a score for video quality/relevance
function calculateVideoScore(videoTitle: string, channelTitle: string, artist: string, song: string): number {
  const title = videoTitle.toLowerCase();
  const channel = channelTitle.toLowerCase();
  const artistLower = cleanSearchTerm(artist).toLowerCase();
  const songLower = cleanSearchTerm(song).toLowerCase();
  
  let score = 0;
  
  // Base points for content matching
  if (title.includes(artistLower)) score += 3;
  if (title.includes(songLower)) score += 3;
  
  // Bonus for exact matches
  if (title.includes(`${artistLower} ${songLower}`) || title.includes(`${songLower} ${artistLower}`)) score += 2;
  
  // Official channel bonuses
  if (isOfficialMusicChannel(channelTitle)) score += 3;
  if (channel.includes('vevo')) score += 2;
  if (channel.endsWith(' - topic')) score += 2;
  
  // Content quality indicators
  if (title.includes('official')) score += 2;
  if (title.includes('music video')) score += 1;
  if (title.includes('audio')) score += 1;
  if (title.includes('hd') || title.includes('high quality')) score += 1;
  
  // Penalties for less desirable content
  if (title.includes('cover') && !title.includes('official')) score -= 2;
  if (title.includes('remix') && !title.includes('official')) score -= 1;
  if (title.includes('karaoke')) score -= 3;
  if (title.includes('instrumental')) score -= 2;
  if (title.includes('lyrics') && !title.includes('official')) score -= 1;
  
  return Math.max(0, score);
}

// Enhanced matching with fuzzy logic and multiple criteria
function isReasonableMatch(videoTitle: string, artist: string, song: string, channelTitle?: string): boolean {
  const title = videoTitle.toLowerCase();
  const artistLower = cleanSearchTerm(artist).toLowerCase();
  const songLower = cleanSearchTerm(song).toLowerCase();
  
  // Helper function for fuzzy word matching
  const fuzzyMatch = (text: string, word: string): boolean => {
    if (text.includes(word)) return true;
    // Check for partial matches (minimum 3 characters)
    if (word.length >= 3) {
      const words = text.split(/\s+/);
      return words.some(w => w.includes(word) || word.includes(w));
    }
    return false;
  };

  // Check artist presence with variations
  const artistWords = artistLower.split(' ').filter(w => w.length > 1);
  const hasArtist = fuzzyMatch(title, artistLower) || 
                   artistWords.some(word => fuzzyMatch(title, word)) ||
                   getArtistVariations(artist).some(variation => 
                     fuzzyMatch(title, variation.toLowerCase()));

  // Check song presence with variations  
  const songWords = songLower.split(' ').filter(w => w.length > 1);
  const hasSong = fuzzyMatch(title, songLower) ||
                 songWords.some(word => fuzzyMatch(title, word));

  // Basic match requirement
  if (!hasArtist && !hasSong) return false;

  // Enhanced scoring system
  let score = 0;
  if (hasArtist) score += 3;
  if (hasSong) score += 3;
  
  // Bonus points for official indicators
  if (title.includes('official')) score += 2;
  if (title.includes('music video')) score += 1;
  if (title.includes('audio')) score += 1;
  if (channelTitle && isOfficialMusicChannel(channelTitle)) score += 2;
  
  // Penalty for likely covers/remixes unless no better options
  if (title.includes('cover') || title.includes('remix')) score -= 1;
  if (title.includes('karaoke') || title.includes('instrumental')) score -= 2;
  
  // Accept if we have reasonable confidence (score >= 4)
  // or if we have both artist and song (even with lower score)
  return score >= 4 || (hasArtist && hasSong);
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
    console.log(`Generated ${searchQueries.length} search queries:`, searchQueries.slice(0, 5));

    let bestVideo = null;
    let bestScore = 0;
    let searchAttempts = 0;
    let candidateVideos = [];

    // Try each search query to find the best match
    for (const query of searchQueries) {
      searchAttempts++;
      const searchQuery = encodeURIComponent(query);
      console.log(`Search attempt ${searchAttempts}/${Math.min(searchQueries.length, 8)}: "${query}"`);
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=15&videoDuration=medium&order=relevance&key=${youtubeApiKey}`,
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
        // Evaluate all videos and keep track of candidates
        for (const video of searchData.items) {
          if (isReasonableMatch(video.snippet.title, artist, song, video.snippet.channelTitle)) {
            const isOfficial = isOfficialMusicChannel(video.snippet.channelTitle);
            const score = calculateVideoScore(video.snippet.title, video.snippet.channelTitle, artist, song);
            
            candidateVideos.push({
              video,
              score,
              isOfficial,
              query,
              searchAttempt: searchAttempts
            });

            console.log(`Found candidate: "${video.snippet.title}" by ${video.snippet.channelTitle} (score: ${score}, official: ${isOfficial})`);
            
            // If this is a high-quality match, consider it as best
            if (score > bestScore) {
              bestVideo = video;
              bestScore = score;
            }
          }
        }
        
        // Stop early if we found an excellent match (high score + official channel)
        if (bestScore >= 8 && candidateVideos.some(c => c.isOfficial && c.score >= 8)) {
          console.log('Found excellent official match, stopping search early');
          break;
        }
      }
      
      // Limit search attempts to avoid hitting API limits
      if (searchAttempts >= 8) {
        console.log('Reached maximum search attempts, stopping');
        break;
      }
      
      // Add small delay between API calls to be respectful
      if (searchAttempts < searchQueries.length) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    // If we have candidates but no bestVideo, pick the best scoring candidate
    if (!bestVideo && candidateVideos.length > 0) {
      // Sort by score descending, then by official channel preference
      candidateVideos.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.isOfficial !== a.isOfficial) return b.isOfficial ? 1 : -1;
        return 0;
      });
      
      bestVideo = candidateVideos[0].video;
      bestScore = candidateVideos[0].score;
      console.log(`Selected best candidate with score ${bestScore}`);
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
