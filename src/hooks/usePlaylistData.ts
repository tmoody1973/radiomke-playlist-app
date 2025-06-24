import React from 'react';
import { useSpinData } from '@/hooks/useSpinData';
import { usePlaylistState } from '@/hooks/usePlaylistState';

interface UsePlaylistDataProps {
  stationId: string;
  autoUpdate: boolean;
  maxItems: number;
  initialStartDate: string;
  initialEndDate: string;
}

export const usePlaylistData = ({
  stationId,
  autoUpdate,
  maxItems,
  initialStartDate,
  initialEndDate
}: UsePlaylistDataProps) => {
  const playlistState = usePlaylistState({ 
    spins: [], 
    hasActiveFilters: false, 
    initialStartDate, 
    initialEndDate 
  });

  const effectiveStartDate = playlistState.dateSearchEnabled ? playlistState.startDate : '';
  const effectiveEndDate = playlistState.dateSearchEnabled ? playlistState.endDate : '';
  
  // Calculate hasActiveFilters more accurately
  const hasActiveFilters = Boolean(
    playlistState.debouncedSearchTerm.trim() || 
    (playlistState.dateSearchEnabled && (effectiveStartDate || effectiveEndDate))
  );

  console.log('Active filters check:', {
    searchTerm: playlistState.debouncedSearchTerm,
    dateSearchEnabled: playlistState.dateSearchEnabled,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    hasActiveFilters
  });

  const { data: spins = [], isLoading, error, refetch, dataUpdatedAt } = useSpinData({
    stationId,
    maxItems,
    debouncedSearchTerm: playlistState.debouncedSearchTerm,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    dateSearchEnabled: playlistState.dateSearchEnabled,
    autoUpdate,
    hasActiveFilters
  });

  // Track the last update time for better debugging
  const lastUpdateRef = React.useRef<number>(0);
  
  // Update playlist state when new data comes in - using dataUpdatedAt for better tracking
  React.useEffect(() => {
    if (spins && spins.length > 0 && dataUpdatedAt !== lastUpdateRef.current) {
      console.log(`🔄 Fresh data received for station ${stationId}:`, {
        songsCount: spins.length,
        hasActiveFilters,
        lastSong: spins[0]?.artist + ' - ' + spins[0]?.song,
        updateTime: new Date(dataUpdatedAt).toISOString(),
        currentDisplayCount: playlistState.displayCount
      });
      
      lastUpdateRef.current = dataUpdatedAt;
      
      // Always update with fresh data, ensuring component re-renders
      playlistState.setAllSpins([...spins]); // Create new array reference to trigger re-render
      
      // Only reset display count for live data if it's currently at the default (15)
      // This preserves "Load More" state when new live data comes in
      if (!hasActiveFilters && playlistState.displayCount === 15) {
        console.log('🔄 Keeping display count at 15 for fresh live data');
        playlistState.setDisplayCount(15);
      } else if (!hasActiveFilters && playlistState.displayCount > 15) {
        console.log('🔄 Preserving display count', playlistState.displayCount, 'for load more state');
        // Don't reset - user has clicked "Load More" so keep their current view
      }
    } else if (!isLoading && !hasActiveFilters && spins.length === 0) {
      // If no spins and not loading and no filters, clear the state
      console.log(`🧹 Clearing playlist state for station ${stationId} - no spins received`);
      playlistState.setAllSpins([]);
    }
  }, [spins, hasActiveFilters, isLoading, dataUpdatedAt, playlistState.setAllSpins, playlistState.setDisplayCount, playlistState.displayCount, stationId]);

  return {
    playlistState,
    spins,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
    hasActiveFilters
  };
};
