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
  console.log(`🎵 SpinitinonPlaylist rendering for station: ${stationId}`);

  const playlistState = usePlaylistState({ 
    spins: [], 
    hasActiveFilters: false, 
    initialStartDate, 
    initialEndDate 
  });

  const audioPlayer = useYouTubePlayer();

  const effectiveStartDate = playlistState.dateSearchEnabled ? playlistState.startDate : '';
  const effectiveEndDate = playlistState.dateSearchEnabled ? playlistState.endDate : '';
  
  // Calculate hasActiveFilters more accurately
  const hasActiveFilters = Boolean(
    playlistState.debouncedSearchTerm.trim() || 
    (playlistState.dateSearchEnabled && (effectiveStartDate || effectiveEndDate))
  );

  console.log('Active filters check:', {
    searchTerm: playlistState.debouncedSearchTerm,
    dateSearchEnabled: playlistState.dateSearchEnabled,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    hasActiveFilters
  });

  const { data: spins = [], isLoading, error, refetch, dataUpdatedAt } = useSpinData({
    stationId,
    maxItems,
    debouncedSearchTerm: playlistState.debouncedSearchTerm,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    dateSearchEnabled: playlistState.dateSearchEnabled,
    autoUpdate,
    hasActiveFilters
  });

  // Track the last update time for better debugging
  const lastUpdateRef = React.useRef<number>(0);
  
  // Update playlist state when new data comes in - using dataUpdatedAt for better tracking
  React.useEffect(() => {
    if (spins && spins.length > 0 && dataUpdatedAt !== lastUpdateRef.current) {
      console.log(`🔄 Fresh data received for station ${stationId}:`, {
        songsCount: spins.length,
        hasActiveFilters,
        lastSong: spins[0]?.artist + ' - ' + spins[0]?.song,
        updateTime: new Date(dataUpdatedAt).toISOString()
      });
      
      lastUpdateRef.current = dataUpdatedAt;
      
      // Always update with fresh data, ensuring component re-renders
      playlistState.setAllSpins([...spins]); // Create new array reference to trigger re-render
      
      // Reset display count for live data to show latest songs
      if (!hasActiveFilters) {
        playlistState.setDisplayCount(15);
      }
    } else if (!isLoading && !hasActiveFilters && spins.length === 0) {
      // If no spins and not loading and no filters, clear the state
      console.log(`🧹 Clearing playlist state for station ${stationId} - no spins received`);
      playlistState.setAllSpins([]);
    }
  }, [spins, hasActiveFilters, isLoading, dataUpdatedAt, playlistState.setAllSpins, playlistState.setDisplayCount, stationId]);

  // Add a manual refresh button for debugging in development
  const handleManualRefresh = React.useCallback(() => {
    console.log('🔄 Manual refresh triggered for station:', stationId);
    refetch();
  }, [refetch, stationId]);

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
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={handleManualRefresh}
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
        setDateSearchEnabled={handleDateSearchToggle}
        startDate={playlistState.startDate}
        endDate={playlistState.endDate}
        onDateChange={handleDateChange}
        onDateClear={handleDateClear}
        formatDate={formatDate}
      />
      
      <CardContent className={`${compact ? "pt-0" : ""} ${isEmbedMode ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        <div className={isEmbedMode ? "flex-1 flex flex-col min-h-0" : ""}>
          {/* Show last update time in development */}
          {process.env.NODE_ENV === 'development' && !hasActiveFilters && (
            <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
              <span>Last update: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
              <button 
                onClick={handleManualRefresh}
                className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
          )}
          
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
