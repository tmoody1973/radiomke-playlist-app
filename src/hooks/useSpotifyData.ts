
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpotifyData {
  albumName?: string;
  albumArt?: string;
  trackName?: string;
  artistName?: string;
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
        // Check if we have cached data (you could implement local storage caching here)
        const cacheKey = `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cached = localStorage.getItem(`spotify-${cacheKey}`);
        
        if (cached) {
          const cachedData: CachedSpotifyData = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(cachedData.lastFetched).getTime();
          
          // Use cached data if less than 24 hours old
          if (cacheAge < 24 * 60 * 60 * 1000) {
            setSpotifyData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Fetch from Spotify API
        const { data, error } = await supabase.functions.invoke('spotify-search', {
          body: { artist, song }
        });

        if (error) {
          console.error('Error fetching Spotify data:', error);
          setSpotifyData(null);
        } else if (data?.found) {
          const newSpotifyData: SpotifyData = {
            albumName: data.albumName,
            albumArt: data.albumArt,
            trackName: data.trackName,
            artistName: data.artistName
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
        } else {
          setSpotifyData(null);
        }
      } catch (error) {
        console.error('Error in useSpotifyData:', error);
        setSpotifyData(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSpotifyData, 300);
    return () => clearTimeout(timeoutId);
  }, [artist, song]);

  return { spotifyData, loading };
};
