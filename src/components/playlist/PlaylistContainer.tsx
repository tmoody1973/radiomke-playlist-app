
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radio } from 'lucide-react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { usePlaylistData } from '@/hooks/usePlaylistData';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistContent } from './PlaylistContent';
import { PlaylistDebugInfo } from './PlaylistDebugInfo';
import { LoadMoreButton } from './LoadMoreButton';
import { createPlaylistHandlers } from './PlaylistHandlers';
import { isCurrentlyPlaying, formatTime, formatDate, getPlaylistTitle } from '@/utils/playlistHelpers';

interface PlaylistContainerProps {
  stationId: string;
  autoUpdate: boolean;
  showSearch: boolean;
  maxItems: number;
  compact: boolean;
  startDate: string;
  endDate: string;
  layout: 'list' | 'grid';
}

export const PlaylistContainer = ({ 
  stationId,
  autoUpdate, 
  showSearch, 
  maxItems,
  compact,
  startDate: initialStartDate,
  endDate: initialEndDate,
  layout
}: PlaylistContainerProps) => {
  const audioPlayer = useYouTubePlayer();
  
  const {
    playlistState,
    spins,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
    hasActiveFilters
  } = usePlaylistData({
    stationId,
    autoUpdate,
    maxItems,
    initialStartDate,
    initialEndDate
  });

  const handlers = createPlaylistHandlers(playlistState, refetch);

  // Force a re-render when live data comes in by tracking the latest song
  const latestSong = React.useMemo(() => {
    if (!hasActiveFilters && playlistState.allSpins.length > 0) {
      const latest = playlistState.allSpins[0];
      console.log(`🎵 Latest song for station ${stationId}:`, latest?.artist, '-', latest?.song, 'at', latest?.start);
      return latest;
    }
    return null;
  }, [playlistState.allSpins, hasActiveFilters, stationId]);

  const displayedSpins = playlistState.allSpins.slice(0, playlistState.displayCount);
  const hasMoreSpins = playlistState.displayCount < playlistState.allSpins.length;

  console.log(`🎵 Displayed spins for station ${stationId}:`, displayedSpins.length, 'out of', playlistState.allSpins.length);

  const isEmbedMode = window.location.pathname === '/embed';
  const hasDateFilter = playlistState.dateSearchEnabled && Boolean(playlistState.startDate || playlistState.endDate);

  if (error) {
    return (
      <Card className={`w-full ${isEmbedMode ? 'h-full flex flex-col' : ''}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <Radio className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load playlist data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your connection and try again
            </p>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={handlers.handleManualRefresh}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Manual Refresh
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const title = getPlaylistTitle(hasDateFilter, playlistState.debouncedSearchTerm);

  return (
    <Card className={`w-full ${isEmbedMode ? 'h-full flex flex-col' : ''}`}>
      <PlaylistHeader
        title={title}
        compact={compact}
        isLoading={isLoading}
        showSearch={showSearch}
        searchTerm={playlistState.searchTerm}
        setSearchTerm={playlistState.setSearchTerm}
        dateSearchEnabled={playlistState.dateSearchEnabled}
        setDateSearchEnabled={handlers.handleDateSearchToggle}
        startDate={playlistState.startDate}
        endDate={playlistState.endDate}
        onDateChange={handlers.handleDateChange}
        onDateClear={handlers.handleDateClear}
        formatDate={formatDate}
      />
      
      <CardContent className={`${compact ? "pt-0" : ""} ${isEmbedMode ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        <PlaylistDebugInfo
          hasActiveFilters={hasActiveFilters}
          dataUpdatedAt={dataUpdatedAt}
          onManualRefresh={handlers.handleManualRefresh}
        />
        
        <PlaylistContent
          displayedSpins={displayedSpins}
          hasActiveFilters={hasActiveFilters}
          layout={layout}
          compact={compact}
          isEmbedMode={isEmbedMode}
          isCurrentlyPlaying={(spin, index) => isCurrentlyPlaying(spin, index, playlistState.currentTime, hasActiveFilters)}
          formatTime={formatTime}
          formatDate={formatDate}
          audioPlayer={audioPlayer}
          stationId={stationId}
        />
        
        <LoadMoreButton
          hasMoreSpins={hasMoreSpins}
          loadingMore={playlistState.loadingMore}
          onLoadMore={handlers.handleLoadMore}
        />
      </CardContent>
    </Card>
  );
};
