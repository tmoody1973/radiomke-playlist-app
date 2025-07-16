import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MostPlayedSong {
  artist: string;
  song: string;
  play_count: number;
  latest_image?: string;
  stations: string[];
}

interface UseMostPlayedSongsProps {
  timePeriod?: '7d' | '30d' | 'all';
  limit?: number;
  stationId?: string;
}

export const useMostPlayedSongs = ({ 
  timePeriod = '7d', 
  limit = 50, 
  stationId 
}: UseMostPlayedSongsProps = {}) => {
  const fetchMostPlayedSongs = async (): Promise<MostPlayedSong[]> => {
    let query = supabase
      .from('songs')
      .select('artist, song, image, station_id, start_time');

    // Apply time filter
    if (timePeriod !== 'all') {
      const daysAgo = timePeriod === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      query = query.gte('start_time', startDate.toISOString());
    }

    // Apply station filter if provided
    if (stationId) {
      query = query.eq('station_id', stationId);
    }

    const { data: songs, error } = await query;

    if (error) {
      console.error('Error fetching most played songs:', error);
      throw error;
    }

    // Group by artist + song and count plays
    const songMap = new Map<string, MostPlayedSong>();
    
    songs?.forEach(song => {
      const key = `${song.artist}|||${song.song}`;
      const existing = songMap.get(key);
      
      if (existing) {
        existing.play_count++;
        if (!existing.stations.includes(song.station_id)) {
          existing.stations.push(song.station_id);
        }
        // Keep the latest image if available
        if (song.image && !existing.latest_image) {
          existing.latest_image = song.image;
        }
      } else {
        songMap.set(key, {
          artist: song.artist,
          song: song.song,
          play_count: 1,
          latest_image: song.image || undefined,
          stations: [song.station_id]
        });
      }
    });

    // Convert to array and sort by play count
    return Array.from(songMap.values())
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, limit);
  };

  return useQuery({
    queryKey: ['mostPlayedSongs', timePeriod, limit, stationId],
    queryFn: fetchMostPlayedSongs,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - most played doesn't need real-time updates
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnWindowFocus: false,
    refetchInterval: false, // Manual refresh only
  });
};
