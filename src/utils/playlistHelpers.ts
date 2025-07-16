
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
  
  // Enhanced logic: Check multiple recent songs (first 3) for "now playing"
  if (index < 3) {
    // Increased tolerance: 5 minutes in future for clock drift
    const fiveMinutesInMs = 5 * 60 * 1000;
    if (timeSinceStart < -fiveMinutesInMs) {
      return false;
    }
    
    // If we have duration info, use it with enhanced padding
    if (spin.duration && spin.duration > 0) {
      const songDurationMs = spin.duration * 1000;
      const paddingMs = 60 * 1000; // 1 minute padding for transitions
      const maxTimeWindow = songDurationMs + paddingMs;
      
      // Show as playing if within the song duration + padding
      const isWithinWindow = timeSinceStart >= -fiveMinutesInMs && timeSinceStart <= maxTimeWindow;
      
      // For non-first songs, only show as playing if they started recently (within last 30 seconds)
      if (index > 0) {
        return isWithinWindow && timeSinceStart >= 0 && timeSinceStart <= 30 * 1000;
      }
      
      return isWithinWindow;
    }
    
    // If no duration info, use a generous window (most songs are under 10 minutes)
    const defaultMaxDurationMs = 10 * 60 * 1000; // 10 minutes
    const isWithinWindow = timeSinceStart >= -fiveMinutesInMs && timeSinceStart <= defaultMaxDurationMs;
    
    // For non-first songs, be more restrictive
    if (index > 0) {
      return isWithinWindow && timeSinceStart >= 0 && timeSinceStart <= 30 * 1000;
    }
    
    return isWithinWindow;
  }
  
  return false;
};

export const getSongProgress = (spin: Spin, currentTime: Date): { progress: number; timeRemaining: number } => {
  if (!spin.duration || spin.duration <= 0) {
    return { progress: 0, timeRemaining: 0 };
  }
  
  const startTime = new Date(spin.start);
  const timeSinceStart = currentTime.getTime() - startTime.getTime();
  const songDurationMs = spin.duration * 1000;
  
  const progress = Math.max(0, Math.min(1, timeSinceStart / songDurationMs));
  const timeRemaining = Math.max(0, songDurationMs - timeSinceStart);
  
  return { progress, timeRemaining };
};

export const shouldUpdateSoon = (spin: Spin, currentTime: Date): boolean => {
  if (!spin.duration || spin.duration <= 0) return false;
  
  const { progress } = getSongProgress(spin, currentTime);
  return progress > 0.8; // Update more frequently when song is 80% complete
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
