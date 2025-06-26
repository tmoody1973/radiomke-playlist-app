
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

interface AudioPlayer {
  currentlyPlaying: string | null;
  isLoading: string | null;
  playVideo: (embedUrl: string, trackId: string) => void;
  stopVideo: () => void;
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
  loadingMore: boolean;
  lastUpdate: Date;
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
  audioPlayer: AudioPlayer;
  youtubePlayer: YouTubePlayer;
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  playlistState: PlaylistState;
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
  audioPlayer,
  youtubePlayer,
  hasMoreSpins,
  loadingMore,
  onLoadMore,
  playlistState
}: PlaylistContainerProps) => {
  return (
    <div className="space-y-4">
      <PlaylistHeader
        stationId={stationId}
        showSearch={showSearch}
        layout={layout}
        compact={compact}
        playlistState={playlistState}
      />

      <PlaylistContent
        displayedSpins={displayedSpins}
        layout={layout}
        compact={compact}
        stationId={stationId}
        isCurrentlyPlaying={isCurrentlyPlaying}
        formatTime={formatTime}
        formatDate={formatDate}
        audioPlayer={audioPlayer}
        youtubePlayer={youtubePlayer}
      />

      {hasMoreSpins && (
        <LoadMoreButton
          onLoadMore={onLoadMore}
          loadingMore={loadingMore}
        />
      )}

      <PlaylistDebugInfo
        displayedSpins={displayedSpins}
        hasActiveFilters={hasActiveFilters}
        playlistState={playlistState}
      />
    </div>
  );
};
