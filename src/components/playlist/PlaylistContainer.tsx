
import React from 'react';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistContent } from './PlaylistContent';
import { LoadMoreButton } from './LoadMoreButton';
import { PlaylistDebugInfo } from './PlaylistDebugInfo';

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
  station_id?: string;
}

interface YouTubePlayer {
  currentlyPlaying: string | null;
  isLoading: string | null;
  playVideo: (embedUrl: string, trackId: string) => void;
  stopVideo: () => void;
}

interface PlaylistState {
  searchTerm: string;
  dateSearchEnabled: boolean;
  startDate: string;
  endDate: string;
  displayCount: number;
  allSpins: Spin[];
  filteredSpins: Spin[];
  lastUpdate: Date;
  setSearchTerm: (term: string) => void;
  setDateSearchEnabled: (enabled: boolean) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

interface PlaylistContainerProps {
  displayedSpins: Spin[];
  hasActiveFilters: boolean;
  layout: 'list' | 'grid';
  compact: boolean;
  stationId: string;
  showSearch: boolean;
  isCurrentlyPlaying: (spin: any, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  youtubePlayer: YouTubePlayer;
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  playlistState: PlaylistState;
  onDateChange: (start: string, end: string) => void;
  onDateClear: () => void;
  onDateSearchToggle: (enabled: boolean) => void;
  onManualRefresh: () => void;
  lastUpdated?: Date;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const PlaylistContainer = ({
  displayedSpins,
  hasActiveFilters,
  layout,
  compact,
  stationId,
  showSearch,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  youtubePlayer,
  hasMoreSpins,
  loadingMore,
  onLoadMore,
  playlistState,
  onDateChange,
  onDateClear,
  onDateSearchToggle,
  onManualRefresh,
  lastUpdated,
  onRefresh,
  isLoading
}: PlaylistContainerProps) => {
  return (
    <div className="space-y-4">
      <PlaylistHeader
        title={`${stationId.toUpperCase()} Recent Spins`}
        compact={compact}
        isLoading={isLoading || false}
        showSearch={showSearch}
        searchTerm={playlistState.searchTerm}
        setSearchTerm={playlistState.setSearchTerm}
        dateSearchEnabled={playlistState.dateSearchEnabled}
        setDateSearchEnabled={onDateSearchToggle}
        startDate={playlistState.startDate}
        endDate={playlistState.endDate}
        onDateChange={onDateChange}
        onDateClear={onDateClear}
        formatDate={formatDate}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        hasActiveFilters={hasActiveFilters}
      />

      <PlaylistContent
        displayedSpins={displayedSpins}
        layout={layout}
        compact={compact}
        stationId={stationId}
        isCurrentlyPlaying={isCurrentlyPlaying}
        formatTime={formatTime}
        formatDate={formatDate}
        youtubePlayer={youtubePlayer}
      />

      <LoadMoreButton
        hasMoreSpins={hasMoreSpins}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
      />

      <PlaylistDebugInfo
        hasActiveFilters={hasActiveFilters}
        dataUpdatedAt={playlistState.lastUpdate.getTime()}
        onManualRefresh={onManualRefresh}
      />
    </div>
  );
};
