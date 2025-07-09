import { useState } from 'react';
import { ArtistEvents } from './ArtistEvents';

interface LazyArtistEventsProps {
  artistName: string;
  compact?: boolean;
  stationId?: string;
}

export const LazyArtistEvents = ({ artistName, compact, stationId }: LazyArtistEventsProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  const handleLoadEvents = () => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  };

  // If not loaded yet, show a trigger button
  if (!shouldLoad) {
    return (
      <button 
        onClick={handleLoadEvents}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-muted/50 hover:bg-muted"
        title={`Load events for ${artistName}`}
      >
        Show Events
      </button>
    );
  }

  return <ArtistEvents artistName={artistName} compact={compact} stationId={stationId} />;
};