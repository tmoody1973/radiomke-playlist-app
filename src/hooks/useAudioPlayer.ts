
import { useState, useRef, useEffect } from 'react';

export const useAudioPlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (previewUrl: string, trackId: string) => {
    try {
      // If the same track is already playing, pause it
      if (currentlyPlaying === trackId) {
        if (audioRef.current) {
          audioRef.current.pause();
          setCurrentlyPlaying(null);
        }
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setIsLoading(trackId);
      
      // Create new audio element
      audioRef.current = new Audio(previewUrl);
      
      audioRef.current.addEventListener('loadstart', () => {
        setIsLoading(trackId);
      });

      audioRef.current.addEventListener('canplay', () => {
        setIsLoading(null);
        setCurrentlyPlaying(trackId);
      });

      audioRef.current.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });

      audioRef.current.addEventListener('error', () => {
        setIsLoading(null);
        setCurrentlyPlaying(null);
        console.error('Error playing audio preview');
      });

      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(null);
      setCurrentlyPlaying(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    currentlyPlaying,
    isLoading,
    playAudio,
    stopAudio
  };
};
