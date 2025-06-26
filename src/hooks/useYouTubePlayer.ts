
import { useState, useRef, useEffect } from 'react';

export const useYouTubePlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const playVideo = async (embedUrl: string, trackId: string) => {
    try {
      console.log(`🎬 Attempting to play YouTube video for track: ${trackId}`);
      
      // If the same track is already playing, stop it
      if (currentlyPlaying === trackId) {
        stopVideo();
        return;
      }

      // Stop any currently playing video
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }

      setIsLoading(trackId);
      
      // Create a visible player container if it doesn't exist
      if (!playerRef.current) {
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-container';
        playerDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          height: 200px;
          z-index: 9999;
          background: black;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          overflow: hidden;
        `;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
          position: absolute;
          top: 5px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10000;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        closeButton.onclick = () => stopVideo();
        
        playerDiv.appendChild(closeButton);
        document.body.appendChild(playerDiv);
        playerRef.current = playerDiv;
      }

      // Create new iframe for YouTube video
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = 'none';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      
      playerRef.current.appendChild(iframe);
      iframeRef.current = iframe;

      console.log(`🎬 YouTube player created for track: ${trackId}`);

      // Simulate loading time and then mark as playing
      setTimeout(() => {
        setIsLoading(null);
        setCurrentlyPlaying(trackId);
        console.log(`🎬 YouTube video now playing: ${trackId}`);
      }, 1000);

    } catch (error) {
      console.error('Error playing YouTube video:', error);
      setIsLoading(null);
      setCurrentlyPlaying(null);
    }
  };

  const stopVideo = () => {
    console.log('🛑 Stopping YouTube video');
    
    if (iframeRef.current) {
      iframeRef.current.remove();
      iframeRef.current = null;
    }
    
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }
    
    setCurrentlyPlaying(null);
    setIsLoading(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
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
