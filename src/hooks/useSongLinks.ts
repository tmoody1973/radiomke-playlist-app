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
  const [statusCode, setStatusCode] = useState<number | null>(null);

const fetchLinks = useCallback(async (params: { spotifyTrackId?: string | null; artist?: string; title?: string; isrc?: string | null; }) => {
  const cacheKey = params.spotifyTrackId ? `spotify:${params.spotifyTrackId}` : params.isrc ? `isrc:${params.isrc}` : `q:${(params.artist||'')}-${(params.title||'')}`;
  setError(null);
  setStatusCode(null);

  // Guard: only fetch when we have a strong identifier (spotify or isrc)
  if (!params.spotifyTrackId && !params.isrc) {
    setData(null);
    setSource(null);
    return null;
  }

  setLoading(true);

  try {
    const result = await deduplicateRequest(cacheKey, async () => {
      const invoke = async () => {
        const { data, error } = await supabase.functions.invoke('songlink-lookup', {
          body: {
            spotify_track_id: params.spotifyTrackId || undefined,
            artist: params.artist,
            title: params.title,
            isrc: params.isrc || undefined,
          },
        });
        if (error) throw error as any;
        return data as { source: 'fresh' | 'cache' | 'stale-cache'; data: SongLinksData };
      };

      try {
        return await invoke();
      } catch (err: any) {
        // Retry once on 429
        const status = err?.status ?? err?.context?.status ?? null;
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 800));
          return await invoke();
        }
        throw err;
      }
    }, 5000);

    setStatusCode(200);
    setData(result?.data || null);
    setSource(result?.source || null);
    return result;
  } catch (e: any) {
    const status = e?.status ?? e?.context?.status ?? null;
    setStatusCode(status);

    // Treat 422 (insufficient identifiers/no cache) as "no links" without error UI
    if (status === 422) {
      setData(null);
      setSource(null);
      setError(null);
      return null;
    }

    // Friendly message for generic failures
    setError('Unable to load links right now. Please try again later.');
    return null;
  } finally {
    setLoading(false);
  }
}, [deduplicateRequest]);

return { loading, error, data, source, statusCode, fetchLinks };
};