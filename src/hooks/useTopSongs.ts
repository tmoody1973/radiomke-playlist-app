
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

    // Increase cap for longer periods so 30 days isn't truncated
    const rowCap = days > 7 ? 25000 : 5000;

    // Fetch last N days of songs for the station
    const { data, error } = await supabase
      .from('songs')
      .select('artist,song,image,start_time')
      .eq('station_id', stationId)
      .gte('start_time', from)
      .order('start_time', { ascending: false })
      .limit(rowCap);

    if (error) throw error;

    // Aggregate by artist + song
    const map = new Map<string, TopSong & { latestImage?: string | null }>();
    for (const row of data || []) {
      const key = `${row.artist}__${row.song}`;
      const existing = map.get(key);
      if (existing) {
        existing.spins += 1;
        // Prefer first non-empty image encountered (most recent due to ordering)
        if (!existing.image && row.image) existing.image = row.image;
      } else {
        map.set(key, {
          artist: row.artist,
          song: row.song,
          image: row.image ?? null,
          spins: 1,
        });
      }
    }

    // Sort by spins desc and take top limit
    const items = Array.from(map.values())
      .sort((a, b) => b.spins - a.spins)
      .slice(0, limit);

    return { items, analyzedCount: data?.length ?? 0, period: { from, to } };
  };

  return useQuery({
    queryKey: ['top-songs', stationId, days, limit],
    queryFn: fetchTopSongs,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
