import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRequestDeduplication } from './useRequestDeduplication';

interface SpotifyData {
  albumName?: string;
  albumArt?: string;
  trackName?: string;
  artistName?: string;
  previewUrl?: string | null;
}

interface CachedSpotifyData extends SpotifyData {
  id: string;
  artist: string;
  song: string;
  lastFetched: string;
}

// Global cache to share data between component instances
const globalSpotifyCache = new Map<string, { data: SpotifyData | null; timestamp: number; loading: boolean }>();

export const useOptimizedSpotifyData = (artist: string, song: string) => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(false);
  const { deduplicateRequest } = useRequestDeduplication();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!artist || !song) return;

    const cacheKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check global cache first
    const cached = globalSpotifyCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 3600000)) { // 1 hour cache
      console.log(`🎵 Using global Spotify cache for: ${artist} - ${song}`);
      setSpotifyData(cached.data);
      setLoading(cached.loading);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const fetchSpotifyData = async () => {
      try {
        // Check localStorage cache
        const localCached = localStorage.getItem(`spotify-${cacheKey}`);
        if (localCached) {
          const cachedData: CachedSpotifyData = JSON.parse(localCached);
          const cacheAge = Date.now() - new Date(cachedData.lastFetched).getTime();
          
          // Use cached data if less than 7 days old
          if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
            console.log(`🎵 Using localStorage Spotify cache for: ${artist} - ${song}`);
            const data = cachedData.previewUrl ? cachedData : null;
            
            // Update global cache
            globalSpotifyCache.set(cacheKey, { data, timestamp: Date.now(), loading: false });
            
            setSpotifyData(data);
            return data;
          }
        }

        console.log(`🎵 Fetching fresh Spotify data for: ${artist} - ${song}`);

        const { data, error } = await supabase.functions.invoke('spotify-search', {
          body: { artist, song }
        });

        if (abortControllerRef.current?.signal.aborted) return null;

        if (error) {
          console.error('Supabase function error:', error);
          return null;
        } else if (data?.found && data?.previewUrl) {
          console.log('🎵 Spotify data found with preview:', data);
          const newSpotifyData: SpotifyData = {
            albumName: data.albumName,
            albumArt: data.albumArt,
            trackName: data.trackName,
            artistName: data.artistName,
            previewUrl: data.previewUrl
          };
          
          // Cache the result
          const cacheData: CachedSpotifyData = {
            ...newSpotifyData,
            id: cacheKey,
            artist,
            song,
            lastFetched: new Date().toISOString()
          };
          localStorage.setItem(`spotify-${cacheKey}`, JSON.stringify(cacheData));
          
          // Update global cache
          globalSpotifyCache.set(cacheKey, { data: newSpotifyData, timestamp: Date.now(), loading: false });
          
          return newSpotifyData;
        } else {
          console.log('🎵 No Spotify preview available for:', artist, '-', song);
          // Cache null result to avoid repeated requests
          globalSpotifyCache.set(cacheKey, { data: null, timestamp: Date.now(), loading: false });
          return null;
        }
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) return null;
        console.error('Error in useOptimizedSpotifyData:', error);
        return null;
      }
    };

    // Set loading state in global cache
    globalSpotifyCache.set(cacheKey, { data: null, timestamp: Date.now(), loading: true });
    setLoading(true);

    // Use deduplication to prevent multiple requests for the same song
    deduplicateRequest(
      `spotify-${cacheKey}`,
      fetchSpotifyData,
      10000 // 10 second deduplication window
    ).then((result) => {
      if (!abortControllerRef.current?.signal.aborted) {
        setSpotifyData(result);
        setLoading(false);
      }
    }).catch((error) => {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Deduplicated request failed:', error);
        setSpotifyData(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [artist, song, deduplicateRequest]);

  return { spotifyData, loading };
};