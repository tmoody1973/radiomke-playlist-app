
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music } from 'lucide-react';
import { GridItem } from './GridItem';
import { ListItem } from './ListItem';
import { LoadMoreButton } from './LoadMoreButton';
import { SearchFilters } from './SearchFilters';

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
}

interface AudioPlayer {
  currentlyPlaying: string | null;
  isLoading: string | null;
  playVideo: (embedUrl: string, trackId: string) => void;
  stopVideo: () => void;
}

interface PlaylistContentProps {
  displayedSpins?: Spin[];
  hasActiveFilters: boolean;
  layout: 'list' | 'grid';
  compact: boolean;
  isEmbedMode: boolean;
  showSearch: boolean;
  isCurrentlyPlaying: (spin: Spin, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: AudioPlayer;
  stationId?: string;
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  playlistState: any;
}

export const PlaylistContent = ({
  displayedSpins = [],
  hasActiveFilters,
  layout,
  compact,
  isEmbedMode,
  showSearch,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  audioPlayer,
  stationId,
  hasMoreSpins,
  loadingMore,
  onLoadMore,
  playlistState
}: PlaylistContentProps) => {
  const safeDisplayedSpins = displayedSpins || [];

  // Calculate scroll area height - use full available height
  const getScrollAreaHeight = () => {
    if (isEmbedMode) {
      return "h-full";
    }
    return compact ? "h-64" : "h-96";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search filters - render outside of ScrollArea */}
      {showSearch && (
        <div className="p-4 border-b">
          <SearchFilters
            searchTerm={playlistState.searchTerm || ''}
            setSearchTerm={playlistState.setSearchTerm || (() => {})}
            dateSearchEnabled={playlistState.dateSearchEnabled || false}
            setDateSearchEnabled={playlistState.setDateSearchEnabled || (() => {})}
            startDate={playlistState.startDate || ''}
            endDate={playlistState.endDate || ''}
            onDateChange={(start, end) => {
              if (playlistState.setStartDate) playlistState.setStartDate(start);
              if (playlistState.setEndDate) playlistState.setEndDate(end);
            }}
            onDateClear={() => {
              if (playlistState.setStartDate) playlistState.setStartDate('');
              if (playlistState.setEndDate) playlistState.setEndDate('');
            }}
            formatDate={formatDate}
          />
        </div>
      )}

      {/* Scrollable content area */}
      <ScrollArea className={getScrollAreaHeight()}>
        <div className="min-h-full flex flex-col">
          {safeDisplayedSpins.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'No matching songs found' : 'No songs playing right now'}
              </p>
            </div>
          ) : (
            <>
              {layout === 'grid' ? (
                <div className={`grid gap-4 p-4 ${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                  {safeDisplayedSpins.map((spin, index) => (
                    <GridItem 
                      key={`${spin.id}-${index}`} 
                      spin={spin} 
                      index={index}
                      isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
                      formatTime={formatTime}
                      audioPlayer={audioPlayer}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {safeDisplayedSpins.map((spin, index) => (
                    <ListItem
                      key={`${spin.id}-${index}`}
                      spin={spin}
                      index={index}
                      isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
                      compact={compact}
                      formatTime={formatTime}
                      formatDate={formatDate}
                      audioPlayer={audioPlayer}
                      stationId={stationId}
                    />
                  ))}
                </div>
              )}
              
              {/* Load More button inside the scroll area */}
              <LoadMoreButton
                hasMoreSpins={hasMoreSpins}
                loadingMore={loadingMore}
                onLoadMore={onLoadMore}
              />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
