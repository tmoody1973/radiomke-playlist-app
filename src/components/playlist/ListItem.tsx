
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock } from 'lucide-react';
import { EnhancedAlbumArtwork } from './EnhancedAlbumArtwork';
import { EnhancedSongInfo } from './EnhancedSongInfo';
import { LazyYouTubePreviewButton } from './LazyYouTubePreviewButton';
import { ArtistEvents } from './ArtistEvents';

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
  is_manual?: boolean;
}

interface YouTubePlayer {
  currentlyPlaying: string | null;
  isLoading: string | null;
  playVideo: (embedUrl: string, trackId: string) => void;
  stopVideo: () => void;
}

interface ListItemProps {
  spin: Spin;
  index: number;
  isCurrentlyPlaying: boolean;
  compact: boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  youtubePlayer: YouTubePlayer;
  stationId?: string;
}

export const ListItem = ({ 
  spin, 
  index, 
  isCurrentlyPlaying, 
  compact, 
  formatTime, 
  formatDate,
  youtubePlayer,
  stationId
}: ListItemProps) => {
  const trackId = `${spin.artist}-${spin.song}-${spin.id}`;

  // Debug logging for list item rendering
  console.log(`🎵 Rendering ListItem for ${spin.artist} - ${spin.song}`, {
    trackId,
    spinId: spin.id,
    youtubePlayer: !!youtubePlayer
  });

  return (
    <div className="space-y-2">
      <div 
        className={`p-3 transition-colors hover:bg-accent/50 ${
          isCurrentlyPlaying 
            ? 'bg-primary/5 border-t border-b border-primary/20' 
            : 'bg-card border-t border-b border-border/30 dark:border-border'
        }`}
      >
        <div className="flex gap-3">
          {/* Album Artwork */}
          <div className={`flex-shrink-0 relative group ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
            <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
              <EnhancedAlbumArtwork
                src={spin.image}
                alt={`${spin.song} by ${spin.artist}`}
                className="w-full h-full"
                fallbackIconSize={compact ? 'w-4 h-4' : 'w-6 h-6'}
                artist={spin.artist}
                song={spin.song}
              />
            </AspectRatio>
            
            {/* YouTube Preview Button Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
              <div className="debug-youtube-button">
                <LazyYouTubePreviewButton
                  artist={spin.artist}
                  song={spin.song}
                  trackId={trackId}
                  currentlyPlaying={youtubePlayer.currentlyPlaying}
                  isLoading={youtubePlayer.isLoading}
                  onPlay={youtubePlayer.playVideo}
                  size={compact ? 'sm' : 'md'}
                />
              </div>
            </div>
          </div>

          {/* Song Information */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <EnhancedSongInfo spin={spin} compact={compact} />
                 <div className="flex flex-col items-end ml-2">
                 <div className="flex flex-col gap-1">
                   {isCurrentlyPlaying && (
                     <Badge variant="secondary" className={compact ? "text-xs px-2 py-0" : ""}>
                       Now Playing
                     </Badge>
                   )}
                   {spin.is_manual && (
                     <Badge variant="outline" className={compact ? "text-xs px-2 py-0" : "text-xs"}>
                       Manual
                     </Badge>
                   )}
                 </div>
                <div className={`text-right mt-1 ${compact ? "text-xs" : "text-sm"}`}>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(spin.start)}
                  </div>
                  <div className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                    {formatDate(spin.start)}
                  </div>
                  {spin.duration && (
                    <div className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                      {Math.floor(spin.duration / 60)}:{(spin.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Artist Events - pass the stationId */}
      <ArtistEvents 
        artistName={spin.artist} 
        compact={compact} 
        stationId={stationId || spin.station_id}
      />
    </div>
  );
};
