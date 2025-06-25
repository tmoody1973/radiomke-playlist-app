import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play } from 'lucide-react';
import { EnhancedAlbumArtwork } from './EnhancedAlbumArtwork';
import { AudioPreviewButton } from './AudioPreviewButton';
import { YouTubePreviewButton } from './YouTubePreviewButton';

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

interface GridItemProps {
  spin: Spin;
  index: number;
  isCurrentlyPlaying: boolean;
  formatTime: (dateString: string) => string;
  audioPlayer: AudioPlayer;
}

export const GridItem = ({ spin, index, isCurrentlyPlaying, formatTime, audioPlayer }: GridItemProps) => {
  const trackId = `${spin.artist}-${spin.song}-${spin.id}`;

  return (
    <div 
      className={`relative group overflow-hidden rounded-lg transition-all hover:scale-105 ${
        isCurrentlyPlaying ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      <AspectRatio ratio={1} className="bg-gradient-to-br from-muted to-muted/50">
        <EnhancedAlbumArtwork
          src={spin.image}
          alt={`${spin.song} by ${spin.artist}`}
          className="w-full h-full rounded-lg overflow-hidden"
          fallbackIconSize="w-8 h-8"
          artist={spin.artist}
          song={spin.song}
        />
        
        {/* YouTube Preview Button */}
        <div className="absolute top-2 right-2 z-10">
          <YouTubePreviewButton
            artist={spin.artist}
            song={spin.song}
            trackId={trackId}
            currentlyPlaying={audioPlayer.currentlyPlaying}
            isLoading={audioPlayer.isLoading}
            onPlay={audioPlayer.playVideo}
            size="sm"
          />
        </div>
        
        {/* Overlay with song info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              {isCurrentlyPlaying && (
                <Play className="h-3 w-3 text-primary fill-current" />
              )}
              <span className="text-xs font-medium">{formatTime(spin.start)}</span>
            </div>
            <h3 className="font-semibold text-sm truncate">{spin.song}</h3>
            <p className="text-xs text-white/80 truncate">{spin.artist}</p>
          </div>
        </div>
        
        {/* Now playing badge */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
              Live
            </Badge>
          </div>
        )}
      </AspectRatio>
      
      {/* Song details below image */}
      <div className="p-2 space-y-1">
        <h3 className="font-medium text-sm truncate">{spin.song}</h3>
        <p className="text-xs text-muted-foreground truncate">{spin.artist}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(spin.start)}</span>
          {spin.duration && (
            <span>{Math.floor(spin.duration / 60)}:{(spin.duration % 60).toString().padStart(2, '0')}</span>
          )}
        </div>
      </div>
    </div>
  );
};
