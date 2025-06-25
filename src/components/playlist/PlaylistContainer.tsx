
import { PlaylistContent } from './PlaylistContent';

interface PlaylistContainerProps {
  displayedSpins?: any[];
  hasActiveFilters: boolean;
  layout: 'list' | 'grid';
  compact: boolean;
  stationId?: string;
  showSearch: boolean;
  isCurrentlyPlaying: (spin: any, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: any;
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  playlistState: any;
  tracking: any;
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
  hasMoreSpins,
  loadingMore,
  onLoadMore,
  playlistState,
  tracking
}: PlaylistContainerProps) => {
  const isEmbedMode = window.location.pathname === '/embed';

  return (
    <div className="h-full flex flex-col">
      <PlaylistContent
        displayedSpins={displayedSpins}
        hasActiveFilters={hasActiveFilters}
        layout={layout}
        compact={compact}
        isEmbedMode={isEmbedMode}
        showSearch={showSearch}
        isCurrentlyPlaying={isCurrentlyPlaying}
        formatTime={formatTime}
        formatDate={formatDate}
        audioPlayer={audioPlayer}
        stationId={stationId}
        hasMoreSpins={hasMoreSpins}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
        playlistState={playlistState}
        tracking={tracking}
      />
    </div>
  );
};
