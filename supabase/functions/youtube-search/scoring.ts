import { cleanSearchTerm, getArtistVariations } from './search-utils.ts';
import { isOfficialMusicChannel } from './channel-utils.ts';

// Calculate a score for video quality/relevance
export function calculateVideoScore(videoTitle: string, channelTitle: string, artist: string, song: string): number {
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
export function isReasonableMatch(videoTitle: string, artist: string, song: string, channelTitle?: string): boolean {
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