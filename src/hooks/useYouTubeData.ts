
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

export const useYouTubeData = (artist: string, song: string, isCurrentlyPlaying: boolean = false) => {
  const [youtubeData, setYouTubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch YouTube data if this is the currently playing song
    if (!artist || !song || !isCurrentlyPlaying) {
      setYouTubeData(null);
      return;
    }

    const fetchYouTubeData = async () => {
      setLoading(true);
      
      try {
        console.log(`🎵 Checking for existing YouTube data for: ${artist} - ${song} (currently playing)`);

        // First check if we already have cached data
        const searchKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        
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
          console.log(`🎵 Using cached YouTube data for ${artist} - ${song} (currently playing)`);
          
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

        // Only make API call if we don't have cached data
        console.log(`🎵 No cache found for ${artist} - ${song} (currently playing), making API call`);

        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('Supabase function error:', error);
          setYouTubeData(null);
        } else if (data?.found && data?.videoId) {
          console.log('YouTube video found for currently playing song:', data.fromCache ? '(from cache)' : '(fresh API call)', data);
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
          console.log('No YouTube video found for currently playing song:', artist, '-', song, data?.fromCache ? '(cached result)' : '(fresh API call)');
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
  }, [artist, song, isCurrentlyPlaying]);

  return { youtubeData, loading };
};
