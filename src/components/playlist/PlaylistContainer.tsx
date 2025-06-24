
import React from 'react';
import { usePlaylistData } from '@/hooks/usePlaylistData';
import { PlaylistContent } from './PlaylistContent';
import { PlaylistDebugInfo } from './PlaylistDebugInfo';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

interface PlaylistContainerProps {
  stationId: string;
  autoUpdate: boolean;
  showSearch: boolean;
  maxItems: number;
  compact?: boolean;
  startDate?: string;
  endDate?: string;
  layout?: 'list' | 'grid';
}

export const PlaylistContainer = ({
  stationId,
  autoUpdate,
  showSearch,
  maxItems,
  compact = false,
  startDate = '',
  endDate = '',
  layout = 'list'
}: PlaylistContainerProps) => {
  console.log(`🎵 PlaylistContainer rendering for station: ${stationId}`);

  const playlistData = usePlaylistData({
    stationId,
    autoUpdate,
    maxItems,
    initialStartDate: startDate,
    initialEndDate: endDate
  });

  // Initialize both audio players
  const audioPlayer = useAudioPlayer();
  const youtubePlayer = useYouTubePlayer();

  return (
    <div className="space-y-4">
      <PlaylistContent
        {...playlistData}
        showSearch={showSearch}
        compact={compact}
        audioPlayer={audioPlayer}
        youtubePlayer={youtubePlayer}
        layout={layout}
      />
      <PlaylistDebugInfo 
        hasActiveFilters={playlistData.hasActiveFilters}
        dataUpdatedAt={playlistData.dataUpdatedAt}
        onManualRefresh={() => playlistData.refetch()}
      />
    </div>
  );
};
