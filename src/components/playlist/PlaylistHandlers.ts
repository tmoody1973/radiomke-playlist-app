export const createPlaylistHandlers = (
  playlistState: any,
  refetch: () => void,
  loadMore?: () => void,
  checkForPrefetch?: (index: number) => void
) => {
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    playlistState.setStartDate(newStartDate);
    playlistState.setEndDate(newEndDate);
  };

  const handleDateClear = () => {
    playlistState.setStartDate('');
    playlistState.setEndDate('');
  };

  const handleDateSearchToggle = (enabled: boolean) => {
    console.log('Date search toggled:', enabled);
    playlistState.setDateSearchEnabled(enabled);
    if (!enabled) {
      // Clear date filters when disabling date search
      playlistState.setStartDate('');
      playlistState.setEndDate('');
      // Reset display count and clear cached spins to force fresh data
      playlistState.setDisplayCount(15);
      playlistState.setAllSpins([]);
      // Trigger a refetch to get live data immediately
      setTimeout(() => {
        refetch();
      }, 100);
    }
  };

  const handleLoadMore = () => {
    console.log('🔄 Load more clicked, current display count:', playlistState.displayCount, 'total spins:', playlistState.allSpins.length);
    
    // Check if we have more cached spins to display
    if (playlistState.displayCount < playlistState.allSpins.length) {
      // Display more from cached data
      const newCount = Math.min(playlistState.displayCount + 15, playlistState.allSpins.length);
      console.log('🔄 Showing more cached spins from', playlistState.displayCount, 'to', newCount);
      playlistState.setDisplayCount(newCount);
      
      // Trigger prefetch check for intelligent loading
      if (checkForPrefetch) {
        checkForPrefetch(newCount - 1);
      }
    } else if (loadMore) {
      // Load more data from server
      console.log('🔄 Loading more data from server');
      loadMore();
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  return {
    handleDateChange,
    handleDateClear,
    handleDateSearchToggle,
    handleLoadMore,
    handleManualRefresh
  };
};
