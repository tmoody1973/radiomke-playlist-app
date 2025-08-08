import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRequestDeduplication } from '@/hooks/useRequestDeduplication';

export interface SongLinksData {
  pageUrl?: string;
  linksByPlatform?: Record<string, { url: string; nativeAppUriIos?: string | null; nativeAppUriAndroid?: string | null }>;
}

export const useSongLinks = () => {
  const { deduplicateRequest } = useRequestDeduplication();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SongLinksData | null>(null);
  const [source, setSource] = useState<'fresh' | 'cache' | 'stale-cache' | null>(null);

  const fetchLinks = useCallback(async (params: { spotifyTrackId?: string | null; artist?: string; title?: string; isrc?: string | null; }) => {
    const cacheKey = params.spotifyTrackId ? `spotify:${params.spotifyTrackId}` : `q:${(params.artist||'')}-${(params.title||'')}`;
    setLoading(true);
    setError(null);

    try {
      const result = await deduplicateRequest(cacheKey, async () => {
        const { data, error } = await supabase.functions.invoke('songlink-lookup', {
          body: {
            spotify_track_id: params.spotifyTrackId || undefined,
            artist: params.artist,
            title: params.title,
            isrc: params.isrc || undefined,
          },
        });
        if (error) throw error;
        return data as { source: 'fresh' | 'cache' | 'stale-cache'; data: SongLinksData };
      }, 5000);

      setData(result?.data || null);
      setSource(result?.source || null);
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to load links');
      return null;
    } finally {
      setLoading(false);
    }
  }, [deduplicateRequest]);

  return { loading, error, data, source, fetchLinks };
};
