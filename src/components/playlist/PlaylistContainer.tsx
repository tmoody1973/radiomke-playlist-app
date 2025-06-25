import { PlaylistContent } from './PlaylistContent';

interface PlaylistContainerProps {
  displayedSpins?: any[];
  hasActiveFilters: boolean;
  layout: 'list' | 'grid';
  compact: boolean;
  stationId?: string;
  isCurrentlyPlaying: (spin: any, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: any;
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const PlaylistContainer = ({
  displayedSpins,
  hasActiveFilters,
  layout,
  compact,
  stationId,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  audioPlayer,
  hasMoreSpins,
  loadingMore,
  onLoadMore
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
        isCurrentlyPlaying={isCurrentlyPlaying}
        formatTime={formatTime}
        formatDate={formatDate}
        audioPlayer={audioPlayer}
        stationId={stationId}
        hasMoreSpins={hasMoreSpins}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};
