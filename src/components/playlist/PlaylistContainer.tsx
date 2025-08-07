import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistContent } from './PlaylistContent';
import { LoadMoreButton } from './LoadMoreButton';
import { PlaylistDebugInfo } from './PlaylistDebugInfo';
import { TopSongsList } from './TopSongsList';
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
  enableYouTube?: boolean;
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
  enableYouTube = true
}: PlaylistContainerProps) => {
  const [viewMode, setViewMode] = useState<'recent' | 'top'>('recent');
  const effectiveShowSearch = showSearch && viewMode === 'recent';
  return <div className="space-y-4">
      <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'recent' | 'top')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="top">Top 20 Songs
        </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <PlaylistHeader title={`${stationId.toUpperCase()} Recent Spins`} compact={compact} isLoading={false} showSearch={effectiveShowSearch} searchTerm={playlistState.searchTerm} setSearchTerm={playlistState.setSearchTerm} dateSearchEnabled={playlistState.dateSearchEnabled} setDateSearchEnabled={onDateSearchToggle} startDate={playlistState.startDate} endDate={playlistState.endDate} onDateChange={onDateChange} onDateClear={onDateClear} formatDate={formatDate} />

          <PlaylistContent displayedSpins={displayedSpins} layout={layout} compact={compact} stationId={stationId} isCurrentlyPlaying={isCurrentlyPlaying} formatTime={formatTime} formatDate={formatDate} youtubePlayer={youtubePlayer} enableYouTube={enableYouTube} />

          <LoadMoreButton hasMoreSpins={hasMoreSpins} onLoadMore={onLoadMore} loadingMore={loadingMore} />
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <PlaylistHeader title={`${stationId.toUpperCase()} Top 20 (7 days)`} compact={compact} isLoading={false} showSearch={false} searchTerm={playlistState.searchTerm} setSearchTerm={playlistState.setSearchTerm} dateSearchEnabled={playlistState.dateSearchEnabled} setDateSearchEnabled={onDateSearchToggle} startDate={playlistState.startDate} endDate={playlistState.endDate} onDateChange={onDateChange} onDateClear={onDateClear} formatDate={formatDate} />

          <TopSongsList stationId={stationId} days={7} limit={20} />
        </TabsContent>
      </Tabs>

      <PlaylistDebugInfo hasActiveFilters={hasActiveFilters} dataUpdatedAt={playlistState.lastUpdate.getTime()} onManualRefresh={onManualRefresh} />
    </div>;
};