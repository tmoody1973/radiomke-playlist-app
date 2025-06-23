
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeData {
  videoId?: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  embedUrl?: string;
  fromCache?: boolean;
}

export const useYouTubeData = (artist: string, song: string) => {
  const [youtubeData, setYouTubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist || !song) return;

    const fetchYouTubeData = async () => {
      setLoading(true);
      
      try {
        console.log(`Fetching YouTube data for: ${artist} - ${song}`);

        // Fetch from YouTube API (which now checks database cache first)
        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('Supabase function error:', error);
          setYouTubeData(null);
        } else if (data?.found && data?.videoId) {
          console.log('YouTube video found:', data.fromCache ? '(from cache)' : '(fresh API call)', data);
          const newYouTubeData: YouTubeData = {
            videoId: data.videoId,
            title: data.title,
            channelTitle: data.channelTitle,
            thumbnail: data.thumbnail,
            embedUrl: data.embedUrl,
            fromCache: data.fromCache
          };
          
          setYouTubeData(newYouTubeData);
        } else {
          console.log('No YouTube video found for:', artist, '-', song, data.fromCache ? '(cached result)' : '(fresh API call)');
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
