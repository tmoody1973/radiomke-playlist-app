
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeData {
  videoId?: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  embedUrl?: string;
}

interface CachedYouTubeData extends YouTubeData {
  id: string;
  artist: string;
  song: string;
  lastFetched: string;
}

export const useYouTubeData = (artist: string, song: string) => {
  const [youtubeData, setYouTubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist || !song) return;

    const fetchYouTubeData = async () => {
      setLoading(true);
      
      try {
        // Check if we have cached data
        const cacheKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cached = localStorage.getItem(`youtube-${cacheKey}`);
        
        if (cached) {
          const cachedData: CachedYouTubeData = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(cachedData.lastFetched).getTime();
          
          // Use cached data if less than 24 hours old
          if (cacheAge < 24 * 60 * 60 * 1000) {
            console.log(`Using cached YouTube data for: ${artist} - ${song}`, cachedData);
            setYouTubeData(cachedData);
            setLoading(false);
            return;
          }
        }

        console.log(`Fetching fresh YouTube data for: ${artist} - ${song}`);

        // Fetch from YouTube API
        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('Supabase function error:', error);
          setYouTubeData(null);
        } else if (data?.found && data?.videoId) {
          console.log('YouTube video found:', data);
          const newYouTubeData: YouTubeData = {
            videoId: data.videoId,
            title: data.title,
            channelTitle: data.channelTitle,
            thumbnail: data.thumbnail,
            embedUrl: data.embedUrl
          };
          
          setYouTubeData(newYouTubeData);
          
          // Cache the result
          const cacheData: CachedYouTubeData = {
            ...newYouTubeData,
            id: cacheKey,
            artist,
            song,
            lastFetched: new Date().toISOString()
          };
          localStorage.setItem(`youtube-${cacheKey}`, JSON.stringify(cacheData));
        } else {
          console.log('No YouTube video found for:', artist, '-', song);
          setYouTubeData(null);
        }
      } catch (error) {
        console.error('Error in useYouTubeData:', error);
        setYouTubeData(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchYouTubeData, 300);
    return () => clearTimeout(timeoutId);
  }, [artist, song]);

  return { youtubeData, loading };
};
