
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock } from 'lucide-react';
import { EnhancedAlbumArtwork } from './EnhancedAlbumArtwork';
import { EnhancedSongInfo } from './EnhancedSongInfo';
import { AudioPreviewButton } from './AudioPreviewButton';

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
  playAudio: (previewUrl: string, trackId: string) => void;
  stopAudio: () => void;
}

interface ListItemProps {
  spin: Spin;
  index: number;
  isCurrentlyPlaying: boolean;
  compact: boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: AudioPlayer;
}

export const ListItem = ({ 
  spin, 
  index, 
  isCurrentlyPlaying, 
  compact, 
  formatTime, 
  formatDate,
  audioPlayer
}: ListItemProps) => {
  const trackId = `${spin.artist}-${spin.song}-${spin.id}`;

  return (
    <div 
      className={`p-3 border rounded-lg transition-colors hover:bg-accent/50 ${
        isCurrentlyPlaying ? 'bg-primary/5 border-primary/20' : 'bg-card'
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
          
          {/* Audio Preview Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
            <AudioPreviewButton
              artist={spin.artist}
              song={spin.song}
              trackId={trackId}
              currentlyPlaying={audioPlayer.currentlyPlaying}
              isLoading={audioPlayer.isLoading}
              onPlay={audioPlayer.playAudio}
              size={compact ? 'sm' : 'md'}
            />
          </div>
        </div>

        {/* Song Information */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <EnhancedSongInfo spin={spin} compact={compact} />
            <div className="flex flex-col items-end ml-2">
              {isCurrentlyPlaying && (
                <Badge variant="secondary" className={compact ? "text-xs px-2 py-0" : ""}>
                  Now Playing
                </Badge>
              )}
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
  );
};
