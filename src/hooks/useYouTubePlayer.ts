
import { useState, useRef, useEffect } from 'react';

export const useYouTubePlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const playVideo = async (embedUrl: string, trackId: string) => {
    try {
      // If the same track is already playing, stop it
      if (currentlyPlaying === trackId) {
        stopVideo();
        return;
      }

      // Stop any currently playing video
      if (iframeRef.current) {
        iframeRef.current.remove();
      }

      setIsLoading(trackId);
      
      // Create new iframe for YouTube video
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.width = '0';
      iframe.height = '0';
      iframe.style.display = 'none';
      iframe.allow = 'autoplay';
      
      document.body.appendChild(iframe);
      iframeRef.current = iframe;

      // Simulate loading time
      setTimeout(() => {
        setIsLoading(null);
        setCurrentlyPlaying(trackId);
      }, 1000);

    } catch (error) {
      console.error('Error playing YouTube video:', error);
      setIsLoading(null);
      setCurrentlyPlaying(null);
    }
  };

  const stopVideo = () => {
    if (iframeRef.current) {
      iframeRef.current.remove();
      iframeRef.current = null;
      setCurrentlyPlaying(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.remove();
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
