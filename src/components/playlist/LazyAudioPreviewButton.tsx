import { useState } from 'react';
import { AudioPreviewButton } from './AudioPreviewButton';

interface LazyAudioPreviewButtonProps {
  artist: string;
  song: string;
  trackId: string;
  currentlyPlaying: string | null;
  isLoading: string | null;
  onPlay: (previewUrl: string, trackId: string) => void;
  onStop: () => void;
  size?: 'sm' | 'md';
}

export const LazyAudioPreviewButton = (props: LazyAudioPreviewButtonProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Only load Spotify data when user hovers or interacts
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
        className="h-6 w-6 rounded-full bg-green-600/50 hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center"
        title="Load Spotify preview"
      >
        <span className="text-xs text-white">♫</span>
      </div>
    );
  }

  return <AudioPreviewButton {...props} />;
};