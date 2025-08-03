import { useState } from 'react';
import { YouTubePreviewButton } from './YouTubePreviewButton';

interface LazyYouTubePreviewButtonProps {
  artist: string;
  song: string;
  trackId: string;
  currentlyPlaying: string | null;
  isLoading: string | null;
  onPlay: (embedUrl: string, trackId: string) => void;
  size?: 'sm' | 'md';
  enabled?: boolean;
}

export const LazyYouTubePreviewButton = (props: LazyYouTubePreviewButtonProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // If YouTube is disabled, don't render anything
  if (!props.enabled) {
    return null;
  }

  // Only load YouTube data when user hovers or interacts
  const handleMouseEnter = () => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  };

  // If not loaded yet, show a placeholder button
  if (!shouldLoad) {
    return (
      <div 
        onMouseEnter={handleMouseEnter}
        onClick={handleMouseEnter}
        className="h-6 w-6 rounded-full bg-red-600/50 hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center"
        title="Load YouTube preview"
      >
        <span className="text-xs text-white">▶</span>
      </div>
    );
  }

  return <YouTubePreviewButton {...props} />;
};