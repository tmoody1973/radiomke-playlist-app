
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
        console.log(`🎵 Fetching YouTube data for: ${artist} - ${song}`);

        // Create search key for caching
        const searchKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // First check if we already have cached data
        const { data: cachedResult, error: cacheError } = await supabase
          .from('youtube_cache')
          .select('*')
          .eq('search_key', searchKey)
          .single();

        if (cacheError && cacheError.code !== 'PGRST116') {
          console.error('YouTube cache lookup error:', cacheError);
        }

        // If we have cached data, use it
        if (cachedResult) {
          console.log(`🎵 Using cached YouTube data for ${artist} - ${song}`);
          
          if (cachedResult.found && cachedResult.video_id) {
            setYouTubeData({
              videoId: cachedResult.video_id,
              title: cachedResult.title,
              channelTitle: cachedResult.channel_title,
              thumbnail: cachedResult.thumbnail,
              embedUrl: cachedResult.embed_url,
              fromCache: true
            });
          } else {
            setYouTubeData(null);
          }
          setLoading(false);
          return;
        }

        // No cached data found, make API call
        console.log(`🎵 No cache found for ${artist} - ${song}, making API call`);

        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('YouTube search function error:', error);
          setYouTubeData(null);
        } else if (data?.found && data?.videoId) {
          console.log(`✅ YouTube video found for ${artist} - ${song}:`, data.videoId);
          const newYouTubeData: YouTubeData = {
            videoId: data.videoId,
            title: data.title,
            channelTitle: data.channelTitle,
            thumbnail: data.thumbnail,
            embedUrl: data.embedUrl,
            fromCache: data.fromCache || false
          };
          
          setYouTubeData(newYouTubeData);
        } else {
          console.log(`❌ No YouTube video found for ${artist} - ${song}`);
          setYouTubeData(null);
        }
      } catch (error) {
        console.error('Error in useYouTubeData:', error);
        setYouTubeData(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(fetchYouTubeData, 100);
    return () => clearTimeout(timeoutId);
  }, [artist, song]);

  return { youtubeData, loading };
};
