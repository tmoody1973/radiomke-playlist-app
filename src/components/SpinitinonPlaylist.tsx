
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radio } from 'lucide-react';
import { useSpinData } from '@/hooks/useSpinData';
import { usePlaylistState } from '@/hooks/usePlaylistState';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { PlaylistHeader } from './playlist/PlaylistHeader';
import { PlaylistContent } from './playlist/PlaylistContent';
import { LoadMoreButton } from './playlist/LoadMoreButton';
import { isCurrentlyPlaying, formatTime, formatDate, getPlaylistTitle } from '@/utils/playlistHelpers';

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
  startDate: initialStartDate = '',
  endDate: initialEndDate = '',
  layout = 'list'
}: SpinitinonPlaylistProps) => {
  const playlistState = usePlaylistState({ 
    spins: [], 
    hasActiveFilters: false, 
    initialStartDate, 
    initialEndDate 
  });

  const audioPlayer = useYouTubePlayer();

  const effectiveStartDate = playlistState.dateSearchEnabled ? playlistState.startDate : '';
  const effectiveEndDate = playlistState.dateSearchEnabled ? playlistState.endDate : '';
  const hasActiveFilters = Boolean(playlistState.debouncedSearchTerm || effectiveStartDate || effectiveEndDate);

  const { data: spins = [], isLoading, error, refetch } = useSpinData({
    stationId,
    maxItems,
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
      console.log('Updating playlist with', spins.length, 'spins, hasActiveFilters:', hasActiveFilters);
      // Always update with fresh data
      playlistState.setAllSpins(spins);
      // Reset display count for live data to show latest songs
      if (!hasActiveFilters) {
        playlistState.setDisplayCount(15);
      }
    } else if (!isLoading && !hasActiveFilters) {
      // If no spins and not loading and no filters, clear the state
      console.log('Clearing playlist state - no spins received');
      playlistState.setAllSpins([]);
    }
  }, [spins, hasActiveFilters, isLoading]);

  const displayedSpins = playlistState.allSpins.slice(0, playlistState.displayCount);
  const hasMoreSpins = playlistState.displayCount < playlistState.allSpins.length;

  const handleLoadMore = async () => {
    playlistState.setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      playlistState.setDisplayCount(prev => Math.min(prev + 15, playlistState.allSpins.length));
      playlistState.setLoadingMore(false);
    }, 500);
  };

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
        setDateSearchEnabled={handleDateSearchToggle}
        startDate={playlistState.startDate}
        endDate={playlistState.endDate}
        onDateChange={handleDateChange}
        onDateClear={handleDateClear}
        formatDate={formatDate}
      />
      
      <CardContent className={`${compact ? "pt-0" : ""} ${isEmbedMode ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        <div className={isEmbedMode ? "flex-1 flex flex-col min-h-0" : ""}>
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
          />
          
          <LoadMoreButton
            hasMoreSpins={hasMoreSpins}
            loadingMore={playlistState.loadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinitinonPlaylist;
