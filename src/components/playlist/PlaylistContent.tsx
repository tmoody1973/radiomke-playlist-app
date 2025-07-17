
import React from 'react';
import { ListItem } from './ListItem';
import { GridItem } from './GridItem';

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

interface PlaylistContentProps {
  displayedSpins: Spin[];
  layout: 'list' | 'grid';
  compact: boolean;
  stationId: string;
  isCurrentlyPlaying: (spin: any, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  youtubePlayer: YouTubePlayer;
}

export const PlaylistContent = ({
  displayedSpins,
  layout,
  compact,
  stationId,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  youtubePlayer
}: PlaylistContentProps) => {
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedSpins.map((spin, index) => (
          <GridItem
            key={`${spin.id}-${spin.start}`}
            spin={spin}
            index={index}
            isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
            formatTime={formatTime}
            youtubePlayer={youtubePlayer}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayedSpins.map((spin, index) => (
        <ListItem
          key={`${spin.id}-${spin.start}`}
          spin={spin}
          index={index}
          isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
          compact={compact}
          formatTime={formatTime}
          formatDate={formatDate}
          youtubePlayer={youtubePlayer}
          stationId={stationId}
        />
      ))}
    </div>
  );
};
