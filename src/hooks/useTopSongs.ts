
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TopSong {
  artist: string;
  song: string;
  image?: string | null;
  spins: number;
}

interface UseTopSongsProps {
  stationId: string;
  days?: number; // default 7
  limit?: number; // default 20
}

export interface TopSongsResult {
  items: TopSong[];
  analyzedCount: number;
  period: { from: string; to: string };
}

export const useTopSongs = ({ stationId, days = 7, limit = 20 }: UseTopSongsProps) => {
  const fetchTopSongs = async (): Promise<TopSongsResult> => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Cap rows analyzed to keep things fast; paginate to bypass per-request limits
    const maxRows = days > 7 ? 25000 : 5000;
    const pageSize = 1000; // Supabase per-request practical limit

    // Aggregate by artist + song while paginating
    const map = new Map<string, TopSong & { latestImage?: string | null }>();
    let analyzedCount = 0;
    let offset = 0;

    while (analyzedCount < maxRows) {
      const { data, error } = await supabase
        .from('songs')
        .select('artist,song,image,start_time')
        .eq('station_id', stationId)
        .gte('start_time', from)
        .lte('start_time', to)
        .order('start_time', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const page = data || [];
      if (page.length === 0) break;

      for (const row of page) {
        const key = `${row.artist}__${row.song}`;
        const existing = map.get(key);
        if (existing) {
          existing.spins += 1;
          if (!existing.image && row.image) existing.image = row.image; // keep most recent image
        } else {
          map.set(key, {
            artist: row.artist,
            song: row.song,
            image: row.image ?? null,
            spins: 1,
          });
        }
      }

      analyzedCount += page.length;
      // If we got less than a full page, we've reached the end
      if (page.length < pageSize) break;

      offset += pageSize;

      // Stop early if we would exceed the cap
      if (analyzedCount >= maxRows) break;
    }

    const items = Array.from(map.values())
      .sort((a, b) => b.spins - a.spins)
      .slice(0, limit);

    return { items, analyzedCount, period: { from, to } };
  };

  return useQuery({
    queryKey: ['top-songs', stationId, days, limit],
    queryFn: fetchTopSongs,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
