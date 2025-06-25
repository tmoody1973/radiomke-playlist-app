
export const createPlaylistHandlers = (
  playlistState: any,
  refetch: () => void
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
    
    // Don't do anything if already loading or no more spins
    if (playlistState.loadingMore || playlistState.displayCount >= playlistState.allSpins.length) {
      return;
    }
    
    // Set loading state
    playlistState.setLoadingMore(true);
    
    // Calculate new count after a short delay to show loading state
    setTimeout(() => {
      const newCount = Math.min(playlistState.displayCount + 15, playlistState.allSpins.length);
      console.log('🔄 Setting new display count to:', newCount);
      playlistState.setDisplayCount(newCount);
      playlistState.setLoadingMore(false);
    }, 300);
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
