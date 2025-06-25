
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music } from 'lucide-react';
import { GridItem } from './GridItem';
import { ListItem } from './ListItem';

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
  isCurrentlyPlaying: (spin: Spin, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: AudioPlayer;
  stationId?: string;
}

export const PlaylistContent = ({
  displayedSpins = [],
  hasActiveFilters,
  layout,
  compact,
  isEmbedMode,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  audioPlayer,
  stationId
}: PlaylistContentProps) => {
  // Ensure displayedSpins is always an array
  const safeDisplayedSpins = displayedSpins || [];

  // Determine scroll area height based on context
  const getScrollAreaHeight = () => {
    if (isEmbedMode) {
      // For embed mode, use a fixed height that allows scrolling
      return "400px";
    }
    return compact ? "h-64" : "h-96";
  };

  return (
    <div className={isEmbedMode ? "flex-1 flex flex-col min-h-0" : ""}>
      <ScrollArea 
        className={isEmbedMode ? "flex-1" : getScrollAreaHeight()}
        style={isEmbedMode ? { height: '400px' } : undefined}
      >
        {safeDisplayedSpins.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {hasActiveFilters ? 'No matching songs found' : 'No songs playing right now'}
            </p>
          </div>
        ) : layout === 'grid' ? (
          // Grid Layout
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
          // List Layout
          <div className="space-y-3">
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
      </ScrollArea>
    </div>
  );
};
