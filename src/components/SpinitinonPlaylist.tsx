
import React from 'react';
import { PlaylistContainer } from './playlist/PlaylistContainer';
import { usePlaylistData } from '@/hooks/usePlaylistData';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePostHogTracking } from '@/hooks/usePostHogTracking';
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

  const { playlistState, spins, isLoading, error, refetch, hasActiveFilters } = usePlaylistData({
    stationId,
    autoUpdate,
    maxItems,
    initialStartDate: startDate,
    initialEndDate: endDate
  });

  const audioPlayer = useAudioPlayer();
  const handlers = createPlaylistHandlers(playlistState, refetch);

  // Initialize PostHog tracking
  const tracking = usePostHogTracking({
    stationId,
    theme: new URLSearchParams(window.location.search).get('theme') || 'light',
    layout,
    compact
  });

  // Calculate displayed spins
  const displayedSpins = playlistState.allSpins.slice(0, playlistState.displayCount);
  
  // Check if there are more spins to load
  const hasMoreSpins = playlistState.displayCount < playlistState.allSpins.length;

  // Helper functions
  const isCurrentlyPlaying = (spin: any, index: number) => {
    return audioPlayer.currentlyPlaying === `${spin.artist}-${spin.song}-${index}`;
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
      audioPlayer={audioPlayer}
      hasMoreSpins={hasMoreSpins}
      loadingMore={playlistState.loadingMore}
      onLoadMore={() => {
        tracking.trackLoadMore(playlistState.displayCount, playlistState.displayCount + 10);
        handlers.handleLoadMore();
      }}
      playlistState={playlistState}
      tracking={tracking}
    />
  );
};

export default SpinitinonPlaylist;
