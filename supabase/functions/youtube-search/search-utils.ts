// Helper function to clean and normalize search terms
export function cleanSearchTerm(term: string): string {
  return term
    .replace(/\(.*?\)/g, '') // Remove content in parentheses
    .replace(/\[.*?\]/g, '') // Remove content in brackets
    .replace(/feat\.|ft\.|featuring/gi, '') // Remove featuring indicators
    .replace(/[^\w\s]/g, ' ') // Remove special characters except word chars and spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Helper function to create abbreviated artist names
export function getArtistVariations(artist: string): string[] {
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
export function generateSearchQueries(artist: string, song: string): string[] {
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