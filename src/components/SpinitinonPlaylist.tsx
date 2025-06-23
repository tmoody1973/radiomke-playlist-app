
import React from 'react';
import { PlaylistContainer } from './playlist/PlaylistContainer';

interface SpinitinonPlaylistProps {
  stationId?: string;
  autoUpdate?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  compact?: boolean;
  startDate?: string;
  endDate?: string;
  layout?: 'list' | 'grid';
}

const SpinitinonPlaylist = ({ 
  stationId = 'hyfin',
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate = '',
  endDate = '',
  layout = 'list'
}: SpinitinonPlaylistProps) => {
  console.log(`🎵 SpinitinonPlaylist rendering for station: ${stationId}`);

  return (
    <PlaylistContainer
      stationId={stationId}
      autoUpdate={autoUpdate}
      showSearch={showSearch}
      maxItems={maxItems}
      compact={compact}
      startDate={startDate}
      endDate={endDate}
      layout={layout}
    />
  );
};

export default SpinitinonPlaylist;
