
import React from 'react';
import { PlaylistContainer } from './playlist/PlaylistContainer';
import { usePlaylistData } from '@/hooks/usePlaylistData';
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
}

const SpinitinonPlaylist = ({ 
  stationId = 'hyfin',
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate = '',
  endDate = '',
  layout = 'list'
}: SpinitinonPlaylistProps) => {
  console.log(`🎵 SpinitinonPlaylist rendering for station: ${stationId}, showSearch: ${showSearch}`);

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
  } = usePlaylistData({
    stationId,
    autoUpdate,
    maxItems,
    initialStartDate: startDate,
    initialEndDate: endDate
  });

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
