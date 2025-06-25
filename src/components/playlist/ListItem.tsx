
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { EnhancedSongInfo } from './EnhancedSongInfo';
import { EnhancedAlbumArtwork } from './EnhancedAlbumArtwork';
import { YouTubePreviewButton } from './YouTubePreviewButton';
import { AudioPreviewButton } from './AudioPreviewButton';
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
  compact: boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  audioPlayer: AudioPlayer;
  stationId?: string;
}

export const ListItem = ({ 
  spin, 
  index, 
  isCurrentlyPlaying, 
  compact, 
  formatTime, 
  formatDate, 
  audioPlayer,
  stationId 
}: ListItemProps) => {
  const trackId = `${spin.artist}-${spin.song}-${spin.id}`;
  
  console.log(`🎵 Rendering ListItem for ${spin.artist} - ${spin.song}`, {
    trackId,
    spinId: spin.id,
    audioPlayer: !!audioPlayer,
    isCurrentlyPlaying
  });

  return (
    <div className="group">
      {/* Main song item - compact horizontal layout */}
      <div className={`flex items-center gap-3 p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        isCurrentlyPlaying ? 'bg-gradient-to-r from-green-50 to-blue-50' : ''
      }`}>
        {/* Small Album Artwork */}
        <div className="flex-shrink-0">
          <EnhancedAlbumArtwork 
            artist={spin.artist}
            song={spin.song}
            src={spin.image}
            alt={`${spin.artist} - ${spin.song}`}
            className="w-12 h-12 rounded-md object-cover"
            fallbackIconSize="w-4 h-4"
          />
        </div>
        
        {/* Song Info - Horizontal layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${compact ? "text-sm" : "text-base"}`}>
                {spin.song}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="truncate">{spin.artist}</span>
                {spin.release && (
                  <>
                    <span>•</span>
                    <span className="truncate">{spin.release}</span>
                  </>
                )}
                {spin.label && (
                  <>
                    <span>•</span>
                    <span className="truncate">{spin.label}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Time info and controls */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Clock className="h-4 w-4" />
                <span>{formatTime(spin.start)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(spin.start)}</span>
              </div>
              {isCurrentlyPlaying && (
                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                  Now Playing
                </Badge>
              )}
              
              {/* Audio Controls */}
              <div className="flex items-center gap-1">
                <YouTubePreviewButton 
                  artist={spin.artist}
                  song={spin.song}
                  trackId={trackId}
                  currentlyPlaying={audioPlayer.currentlyPlaying}
                  isLoading={audioPlayer.isLoading}
                  onPlay={audioPlayer.playVideo}
                  isCurrentlyPlaying={isCurrentlyPlaying}
                />
                <AudioPreviewButton 
                  artist={spin.artist}
                  song={spin.song}
                  trackId={trackId}
                  currentlyPlaying={audioPlayer.currentlyPlaying}
                  isLoading={audioPlayer.isLoading}
                  onPlay={audioPlayer.playVideo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Artist Events - Only show for currently playing song */}
      {isCurrentlyPlaying && (
        <div className="px-3 pb-3">
          <ArtistEvents 
            artistName={spin.artist} 
            compact={true}
            stationId={stationId}
            isCurrentlyPlaying={isCurrentlyPlaying}
          />
        </div>
      )}
    </div>
  );
};
