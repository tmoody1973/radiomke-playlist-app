
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
    audioPlayer: !!audioPlayer
  });

  return (
    <div className={`group p-4 border border-slate-200 rounded-lg transition-all duration-200 hover:border-slate-300 hover:shadow-md ${
      isCurrentlyPlaying ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md' : 'bg-white'
    }`}>
      <div className="flex items-start gap-4">
        {/* Album Artwork */}
        <div className="flex-shrink-0">
          <EnhancedAlbumArtwork 
            artist={spin.artist}
            song={spin.song}
            src={spin.image}
            alt={`${spin.artist} - ${spin.song}`}
            compact={compact}
          />
        </div>
        
        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <EnhancedSongInfo 
                spin={spin}
                compact={compact}
              />
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(spin.start)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(spin.start)}</span>
                </div>
                {isCurrentlyPlaying && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Now Playing
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Audio Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <YouTubePreviewButton 
                artist={spin.artist}
                song={spin.song}
                trackId={trackId}
                currentlyPlaying={audioPlayer.currentlyPlaying}
                isLoading={audioPlayer.isLoading}
                onPlay={audioPlayer.playVideo}
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
      
      {/* Artist Events - Only show Ticketmaster events for currently playing song */}
      <div className="mt-4">
        <ArtistEvents 
          artistName={spin.artist} 
          compact={compact}
          stationId={stationId}
          isCurrentlyPlaying={isCurrentlyPlaying}
        />
      </div>
    </div>
  );
};
