
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
  const endTime = new Date(startTime.getTime() + (spin.duration || 180) * 1000);
  
  // Check if current time is within the song's play window
  const isWithinTimeWindow = currentTime >= startTime && currentTime <= endTime;
  
  // For live playlist, the currently playing song should be the most recent one that's within its time window
  if (index === 0 && isWithinTimeWindow) {
    return true;
  }
  
  // Check if this song is playing now (useful for historical data that might be current)
  return isWithinTimeWindow;
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
