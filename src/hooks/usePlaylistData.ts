import React from 'react';
import { usePaginatedSpins } from '@/hooks/usePaginatedSpins';
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

  const { 
    data: spins = [], 
    isLoading, 
    error, 
    hasMore, 
    loadMore, 
    isLoadingMore,
    refetch, 
    checkForPrefetch 
  } = usePaginatedSpins({
    stationId,
    initialMaxItems: maxItems,
    debouncedSearchTerm: playlistState.debouncedSearchTerm,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    dateSearchEnabled: playlistState.dateSearchEnabled,
    autoUpdate,
    hasActiveFilters
  });

  // Update playlist state when new data comes in
  React.useEffect(() => {
    if (spins && spins.length > 0) {
      console.log(`🔄 Fresh data received for station ${stationId}:`, {
        songsCount: spins.length,
        hasActiveFilters,
        lastSong: spins[0]?.artist + ' - ' + spins[0]?.song,
        currentDisplayCount: playlistState.displayCount
      });
      
      // Always update with fresh data, ensuring component re-renders
      playlistState.setAllSpins([...spins]); // Create new array reference to trigger re-render
      
      // For paginated data, we want to show all loaded data by default
      // Only limit display count for the initial view
      if (playlistState.displayCount === 15 && spins.length > 15) {
        playlistState.setDisplayCount(15); // Keep initial limit
      } else if (spins.length <= playlistState.displayCount) {
        playlistState.setDisplayCount(spins.length); // Show all available data
      }
    } else if (!isLoading && !hasActiveFilters && spins.length === 0) {
      // If no spins and not loading and no filters, clear the state
      console.log(`🧹 Clearing playlist state for station ${stationId} - no spins received`);
      playlistState.setAllSpins([]);
    }
  }, [spins, hasActiveFilters, isLoading, playlistState.setAllSpins, playlistState.setDisplayCount, playlistState.displayCount, stationId]);

  return {
    playlistState,
    spins,
    isLoading,
    error,
    refetch,
    hasActiveFilters,
    hasMore,
    loadMore,
    isLoadingMore,
    checkForPrefetch
  };
};
