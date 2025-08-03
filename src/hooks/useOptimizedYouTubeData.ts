import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRequestDeduplication } from './useRequestDeduplication';

interface YouTubeData {
  videoId?: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  embedUrl?: string;
  fromCache?: boolean;
}

// Global cache to share data between component instances
const globalYouTubeCache = new Map<string, { data: YouTubeData | null; timestamp: number; loading: boolean }>();

export const useOptimizedYouTubeData = (artist: string, song: string, enabled: boolean = true) => {
  const [youtubeData, setYouTubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);
  const { deduplicateRequest } = useRequestDeduplication();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !artist || !song) return;

    const searchKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check global cache first
    const cached = globalYouTubeCache.get(searchKey);
    if (cached && (Date.now() - cached.timestamp < 3600000)) { // 1 hour cache
      console.log(`🎬 Using global YouTube cache for: ${artist} - ${song}`);
      setYouTubeData(cached.data);
      setLoading(cached.loading);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const fetchYouTubeData = async () => {
      try {
        console.log(`🎬 Checking YouTube cache for: ${artist} - ${song}`);
        
        // Check database cache first
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
          console.log(`🎬 Using database YouTube cache for ${artist} - ${song}`);
          
          const data = cachedResult.found && cachedResult.video_id ? {
            videoId: cachedResult.video_id,
            title: cachedResult.title,
            channelTitle: cachedResult.channel_title,
            thumbnail: cachedResult.thumbnail,
            embedUrl: cachedResult.embed_url,
            fromCache: true
          } : null;

          // Update global cache
          globalYouTubeCache.set(searchKey, { data, timestamp: Date.now(), loading: false });
          
          return data;
        }

        // No cached data found, make API call
        console.log(`🎬 No cache found for ${artist} - ${song}, making API call`);

        if (abortControllerRef.current?.signal.aborted) return null;

        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { artist, song }
        });

        if (abortControllerRef.current?.signal.aborted) return null;

        if (error) {
          console.error('YouTube search function error:', error);
          return null;
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
          
          // Update global cache
          globalYouTubeCache.set(searchKey, { data: newYouTubeData, timestamp: Date.now(), loading: false });
          
          return newYouTubeData;
        } else {
          console.log(`❌ No YouTube video found for ${artist} - ${song}`);
          // Cache null result to avoid repeated requests
          globalYouTubeCache.set(searchKey, { data: null, timestamp: Date.now(), loading: false });
          return null;
        }
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) return null;
        console.error('Error in useOptimizedYouTubeData:', error);
        return null;
      }
    };

    // Set loading state in global cache
    globalYouTubeCache.set(searchKey, { data: null, timestamp: Date.now(), loading: true });
    setLoading(true);

    // Use deduplication to prevent multiple requests for the same song
    deduplicateRequest(
      `youtube-${searchKey}`,
      fetchYouTubeData,
      10000 // 10 second deduplication window
    ).then((result) => {
      if (!abortControllerRef.current?.signal.aborted) {
        setYouTubeData(result);
        setLoading(false);
      }
    }).catch((error) => {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Deduplicated request failed:', error);
        setYouTubeData(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [artist, song, enabled, deduplicateRequest]);

  return { youtubeData, loading };
};