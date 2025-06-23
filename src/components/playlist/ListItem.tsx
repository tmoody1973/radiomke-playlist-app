
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Music } from 'lucide-react';
import { EnhancedAlbumArtwork } from './EnhancedAlbumArtwork';
import { EnhancedSongInfo } from './EnhancedSongInfo';
import { AudioPreviewButton } from './AudioPreviewButton';
import TicketmasterEvents from '../TicketmasterEvents';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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

interface ListItemProps {
  spin: Spin;
  index: number;
  isCurrentlyPlaying: boolean;
  compact?: boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: AudioPlayer;
}

export const ListItem: React.FC<ListItemProps> = ({
  spin,
  index,
  isCurrentlyPlaying,
  compact,
  formatTime,
  formatDate,
  audioPlayer
}) => {
  return (
    <Card className={`p-4 transition-all duration-200 ${isCurrentlyPlaying ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950' : 'hover:shadow-md'}`}>
      <div className="flex items-start gap-4">
        <EnhancedAlbumArtwork 
          spin={spin}
          size={compact ? 48 : 60}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <h3 className="font-semibold text-base leading-tight line-clamp-1 cursor-pointer hover:text-orange-600 transition-colors">
                    {spin.song || 'Unknown Song'}
                  </h3>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <TicketmasterEvents artistName={spin.artist} compact={true} />
                </HoverCardContent>
              </HoverCard>
              
              <p className="text-muted-foreground text-sm line-clamp-1 mb-1">
                {spin.artist || 'Unknown Artist'}
              </p>
              
              <EnhancedSongInfo spin={spin} compact={compact} />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {isCurrentlyPlaying && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  <Music className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(spin.start)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {formatDate(spin.start)}
            </div>
            
            <AudioPreviewButton 
              artist={spin.artist} 
              song={spin.song}
              trackId={`${spin.id}-${index}`}
              isLoading={audioPlayer.isLoading === `${spin.id}-${index}`}
              isPlaying={audioPlayer.currentlyPlaying === `${spin.id}-${index}`}
              onPlay={(embedUrl) => audioPlayer.playVideo(embedUrl, `${spin.id}-${index}`)}
              onStop={audioPlayer.stopVideo}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
