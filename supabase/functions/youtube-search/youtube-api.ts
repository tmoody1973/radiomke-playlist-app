import { YouTubeSearchResponse, YouTubeSearchItem, VideoCandidate } from './types.ts';
import { generateSearchQueries } from './search-utils.ts';
import { isReasonableMatch, calculateVideoScore } from './scoring.ts';
import { isOfficialMusicChannel } from './channel-utils.ts';

export async function searchYouTubeForBestMatch(
  artist: string, 
  song: string, 
  youtubeApiKey: string
): Promise<{ bestVideo: YouTubeSearchItem | null; searchAttempts: number }> {
  const searchQueries = generateSearchQueries(artist, song);
  console.log(`Generated ${searchQueries.length} search queries:`, searchQueries.slice(0, 5));

  let bestVideo = null;
  let bestScore = 0;
  let searchAttempts = 0;
  let candidateVideos: VideoCandidate[] = [];

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

  return { bestVideo, searchAttempts };
}

export function formatVideoResult(video: YouTubeSearchItem) {
  const thumbnail = video.snippet.thumbnails.medium?.url || 
                   video.snippet.thumbnails.high?.url ||
                   video.snippet.thumbnails.default?.url || null;

  const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&start=0`;

  console.log(`Best match found: "${video.snippet.title}" by ${video.snippet.channelTitle}`);
  console.log('Video ID:', video.id.videoId);

  return {
    found: true,
    videoId: video.id.videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    thumbnail: thumbnail,
    embedUrl: embedUrl
  };
}
