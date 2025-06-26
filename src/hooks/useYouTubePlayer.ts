
import { useState } from 'react';

export const useYouTubePlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const playVideo = async (embedUrl: string, trackId: string) => {
    try {
      console.log(`🎬 Playing YouTube video for track: ${trackId} (hidden player)`);
      
      // If the same track is already playing, stop it
      if (currentlyPlaying === trackId) {
        stopVideo();
        return;
      }

      setIsLoading(trackId);
      
      console.log(`🎬 YouTube video playing in background: ${trackId}`);

      // Simulate loading time and then mark as playing (no visible player)
      setTimeout(() => {
        setIsLoading(null);
        setCurrentlyPlaying(trackId);
        console.log(`🎬 YouTube video now playing (hidden): ${trackId}`);
      }, 1000);

    } catch (error) {
      console.error('Error playing YouTube video:', error);
      setIsLoading(null);
      setCurrentlyPlaying(null);
    }
  };

  const stopVideo = () => {
    console.log('🛑 Stopping YouTube video (hidden player)');
    setCurrentlyPlaying(null);
    setIsLoading(null);
  };

  return {
    currentlyPlaying,
    isLoading,
    playVideo,
    stopVideo
  };
};
