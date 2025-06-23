
interface Spin {
  id: number;
  artist: string;
  song: string;
  start: string;
  duration: number;
  composer?: string;
  label?: string;
  release?: string;
  image?: string;
}

export const isCurrentlyPlaying = (spin: Spin, index: number, currentTime: Date, hasActiveFilters: boolean) => {
  // Only show "now playing" for live data (no active filters)
  if (hasActiveFilters) return false;
  
  const startTime = new Date(spin.start);
  const timeSinceStart = currentTime.getTime() - startTime.getTime();
  const millisecondsInSecond = 1000;
  
  // For live playlist, be more strict about "now playing"
  // Only show as currently playing if:
  // 1. It's the most recent song (index 0)
  // 2. It started within the last 15 minutes (to account for longer songs)
  // 3. The start time is not in the future
  if (index === 0) {
    const fifteenMinutesInMs = 15 * 60 * 1000;
    const isRecentlyStarted = timeSinceStart >= 0 && timeSinceStart <= fifteenMinutesInMs;
    
    if (isRecentlyStarted) {
      // Additional check: if we have duration info, verify we're within the song's duration
      if (spin.duration && spin.duration > 0) {
        const songDurationMs = spin.duration * millisecondsInSecond;
        const endTime = new Date(startTime.getTime() + songDurationMs);
        return currentTime >= startTime && currentTime <= endTime;
      }
      
      // If no duration info, just check if it started recently (within 6 minutes max for most songs)
      const sixMinutesInMs = 6 * 60 * 1000;
      return timeSinceStart <= sixMinutesInMs;
    }
  }
  
  return false;
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const getPlaylistTitle = (hasDateFilter: boolean, searchTerm: string) => {
  if (hasDateFilter && searchTerm) {
    return 'Filtered Results';
  } else if (hasDateFilter) {
    return 'Date Range Results';
  } else if (searchTerm) {
    return 'Search Results';
  }
  return 'Live Playlist';
};
