
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
  
  // For live playlist, be more lenient about "now playing"
  // Only show as currently playing if:
  // 1. It's the most recent song (index 0)
  // 2. It started within a reasonable time window
  // 3. The start time is not in the future
  if (index === 0) {
    // Don't show songs that haven't started yet (more than 2 minutes in future to account for clock drift)
    const twoMinutesInMs = 2 * 60 * 1000;
    if (timeSinceStart < -twoMinutesInMs) {
      return false;
    }
    
    // If we have duration info, use it with some padding
    if (spin.duration && spin.duration > 0) {
      const songDurationMs = spin.duration * 1000;
      const paddingMs = 30 * 1000; // 30 seconds padding for transitions
      const maxTimeWindow = songDurationMs + paddingMs;
      
      // Show as playing if within the song duration + padding
      return timeSinceStart >= -twoMinutesInMs && timeSinceStart <= maxTimeWindow;
    }
    
    // If no duration info, use a generous window (most songs are under 8 minutes)
    const defaultMaxDurationMs = 8 * 60 * 1000; // 8 minutes
    return timeSinceStart >= -twoMinutesInMs && timeSinceStart <= defaultMaxDurationMs;
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
