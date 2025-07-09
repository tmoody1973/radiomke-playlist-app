
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSpotifyData = (artist: string, song: string) => {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist || !song) return;

    const fetchSpotifyData = async () => {
      setLoading(true);
      
      try {
        // Check if we have cached data
        const cacheKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cached = localStorage.getItem(`spotify-${cacheKey}`);
        
        if (cached) {
          const cachedData: CachedSpotifyData = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(cachedData.lastFetched).getTime();
          
          // Use cached data if less than 7 days old (increased from 24 hours)
          if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
            console.log(`Using cached Spotify data for: ${artist} - ${song}`, cachedData);
            setSpotifyData(cachedData);
            setLoading(false);
            return;
          }
        }

        console.log(`Fetching fresh Spotify data for: ${artist} - ${song}`);

        // Fetch from Spotify API
        const { data, error } = await supabase.functions.invoke('spotify-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('Supabase function error:', error);
          setSpotifyData(null);
        } else if (data?.found && data?.previewUrl) {
          console.log('Spotify data found with preview:', data);
          const newSpotifyData: SpotifyData = {
            albumName: data.albumName,
            albumArt: data.albumArt,
            trackName: data.trackName,
            artistName: data.artistName,
            previewUrl: data.previewUrl
          };
          
          setSpotifyData(newSpotifyData);
          
          // Cache the result
          const cacheData: CachedSpotifyData = {
            ...newSpotifyData,
            id: cacheKey,
            artist,
            song,
            lastFetched: new Date().toISOString()
          };
          localStorage.setItem(`spotify-${cacheKey}`, JSON.stringify(cacheData));
        } else if (data?.found && !data?.previewUrl) {
          console.log(`Spotify track found but no preview available for: ${artist} - ${song}`);
          setSpotifyData(null);
        } else {
          console.log('No Spotify data found for:', artist, '-', song);
          setSpotifyData(null);
        }
      } catch (error) {
        console.error('Error in useSpotifyData:', error);
        setSpotifyData(null);
      } finally {
        setLoading(false);
      }
    };

    // Increased debounce from 300ms to 1000ms to reduce API calls
    const timeoutId = setTimeout(fetchSpotifyData, 1000);
    return () => clearTimeout(timeoutId);
  }, [artist, song]);

  return { spotifyData, loading };
};
