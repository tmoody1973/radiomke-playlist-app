
import { useState, useRef, useEffect } from 'react';

export const useYouTubePlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const playerRef = useRef<HTMLIFrameElement | null>(null);
  const currentVideoRef = useRef<string | null>(null);

  const playVideo = async (embedUrl: string, trackId: string) => {
    try {
      console.log(`🎬 Playing YouTube video for track: ${trackId}`);
      
      // If the same track is already playing, stop it
      if (currentlyPlaying === trackId) {
        stopVideo();
        return;
      }

      setIsLoading(trackId);
      
      // Remove any existing player
      if (playerRef.current) {
        document.body.removeChild(playerRef.current);
        playerRef.current = null;
      }

      // Create hidden iframe player
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl + '&autoplay=1&enablejsapi=1';
      iframe.style.position = 'fixed';
      iframe.style.top = '-1000px';
      iframe.style.left = '-1000px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.allow = 'autoplay';
      
      document.body.appendChild(iframe);
      playerRef.current = iframe;
      currentVideoRef.current = trackId;

      // Simulate loading time then mark as playing
      setTimeout(() => {
        if (currentVideoRef.current === trackId) {
          setIsLoading(null);
          setCurrentlyPlaying(trackId);
          console.log(`🎬 YouTube video now playing: ${trackId}`);
        }
      }, 1500);

    } catch (error) {
      console.error('Error playing YouTube video:', error);
      setIsLoading(null);
      setCurrentlyPlaying(null);
    }
  };

  const stopVideo = () => {
    console.log('🛑 Stopping YouTube video');
    
    if (playerRef.current) {
      document.body.removeChild(playerRef.current);
      playerRef.current = null;
    }
    
    setCurrentlyPlaying(null);
    setIsLoading(null);
    currentVideoRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          document.body.removeChild(playerRef.current);
        } catch (e) {
          // Player might already be removed
        }
      }
    };
  }, []);

  return {
    currentlyPlaying,
    isLoading,
    playVideo,
    stopVideo
  };
};
