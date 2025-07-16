
import React from 'react';
import { PlaylistContainer } from './playlist/PlaylistContainer';
import { MostPlayedChart } from './playlist/MostPlayedChart';
import { usePlaylistData } from '@/hooks/usePlaylistData';
import { usePreviewSpinData } from '@/hooks/usePreviewSpinData';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { createPlaylistHandlers } from './playlist/PlaylistHandlers';

interface SpinitinonPlaylistProps {
  stationId?: string;
  autoUpdate?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  compact?: boolean;
  startDate?: string;
  endDate?: string;
  layout?: 'list' | 'grid';
  previewMode?: boolean;
  embedMode?: string;
  mostPlayedPeriod?: string;
}

const SpinitinonPlaylist = ({ 
  stationId = 'hyfin',
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate = '',
  endDate = '',
  layout = 'list',
  previewMode = false,
  embedMode = 'live',
  mostPlayedPeriod = '7d'
}: SpinitinonPlaylistProps) => {
  console.log(`🎵 SpinitinonPlaylist rendering for station: ${stationId}, showSearch: ${showSearch}, embedMode: ${embedMode}`);

  // Handle most played mode
  if (embedMode === 'most-played') {
    return (
      <div className="p-4">
        <MostPlayedChart 
          stationId={stationId} 
          showStationFilter={false}
        />
      </div>
    );
  }

  // Use preview data for fast loading in demo mode
  const previewData = usePreviewSpinData({
    stationId,
    maxItems: previewMode ? Math.min(maxItems, 10) : 0,
  });

  const playlistDataHook = usePlaylistData({
    stationId,
    autoUpdate: previewMode ? false : autoUpdate,
    maxItems,
    initialStartDate: startDate,
    initialEndDate: endDate
  });

  // Choose data source based on mode
  const { 
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
  } = previewMode ? 
    // Transform preview data to match expected structure
    {
      playlistState: {
        allSpins: previewData.spins,
        displayCount: previewData.spins.length,
        searchTerm: '',
        dateSearchEnabled: false,
        startDate: '',
        endDate: '',
        setSearchTerm: () => {},
        setDateSearchEnabled: () => {},
        setStartDate: () => {},
        setEndDate: () => {},
        debouncedSearchTerm: '',
        setDisplayCount: () => {},
        filteredSpins: previewData.spins,
        lastUpdate: new Date()
      },
      spins: previewData.spins,
      isLoading: previewData.isLoading,
      error: previewData.error ? { message: previewData.error } : null,
      refetch: () => Promise.resolve(),
      hasActiveFilters: false,
      hasMore: false,
      loadMore: () => Promise.resolve(),
      isLoadingMore: false,
      checkForPrefetch: () => {}
    } : playlistDataHook;

  const youtubePlayer = useYouTubePlayer();
  const handlers = createPlaylistHandlers(playlistState, refetch, loadMore, checkForPrefetch);

  // Calculate displayed spins
  const displayedSpins = playlistState.allSpins.slice(0, playlistState.displayCount);
  
  // Check if there are more spins to load (either cached or from server)
  const hasMoreSpins = playlistState.displayCount < playlistState.allSpins.length || hasMore;

  // Helper functions
  const isCurrentlyPlaying = (spin: any, index: number) => {
    return youtubePlayer.currentlyPlaying === `${spin.artist}-${spin.song}-${index}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Create extended playlist state with missing properties
  const extendedPlaylistState = {
    ...playlistState,
    filteredSpins: playlistState.allSpins,
    lastUpdate: new Date()
  };

  console.log('🎵 SpinitinonPlaylist about to render, isLoading:', isLoading, 'error:', error, 'spins:', displayedSpins.length);
  
  if (isLoading) {
    return <div className="text-center p-8">Loading playlist...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <PlaylistContainer
      displayedSpins={displayedSpins}
      hasActiveFilters={hasActiveFilters}
      layout={layout}
      compact={compact}
      stationId={stationId}
      showSearch={showSearch}
      isCurrentlyPlaying={isCurrentlyPlaying}
      formatTime={formatTime}
      formatDate={formatDate}
      youtubePlayer={youtubePlayer}
      hasMoreSpins={hasMoreSpins}
      loadingMore={isLoadingMore}
      onLoadMore={handlers.handleLoadMore}
      playlistState={extendedPlaylistState}
      onDateChange={handlers.handleDateChange}
      onDateClear={handlers.handleDateClear}
      onDateSearchToggle={handlers.handleDateSearchToggle}
      onManualRefresh={handlers.handleManualRefresh}
      lastUpdated={extendedPlaylistState.lastUpdate}
      onRefresh={refetch}
      isLoading={isLoading}
    />
  );
};

export default SpinitinonPlaylist;
