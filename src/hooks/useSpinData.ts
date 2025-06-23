
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Spin {
  id: number;
  artist: string;
  song: string;
  start: string;
  duration: number;
  composer?: string;
  label?: string;
  release?: string;
  image?: string;
}

interface UseSpinDataProps {
  stationId: string;
  maxItems: number;
  debouncedSearchTerm: string;
  startDate: string;
  endDate: string;
  dateSearchEnabled: boolean;
  autoUpdate: boolean;
  hasActiveFilters: boolean;
}

export const useSpinData = ({
  stationId,
  maxItems,
  debouncedSearchTerm,
  startDate,
  endDate,
  dateSearchEnabled,
  autoUpdate,
  hasActiveFilters
}: UseSpinDataProps) => {
  const fetchSpins = async (): Promise<Spin[]> => {
    // If we have active filters (search term or date filters), search the database
    if (hasActiveFilters) {
      console.log('Searching database with filters:', {
        station: stationId,
        search: debouncedSearchTerm,
        startDate: dateSearchEnabled ? startDate : '',
        endDate: dateSearchEnabled ? endDate : '',
        maxItems
      });

      let query = supabase
        .from('songs')
        .select('*')
        .eq('station_id', stationId)
        .order('start_time', { ascending: false })
        .limit(maxItems);

      // Add search filter if there's a search term
      if (debouncedSearchTerm) {
        query = query.or(`artist.ilike.%${debouncedSearchTerm}%,song.ilike.%${debouncedSearchTerm}%`);
      }

      // Add date filters if enabled
      if (dateSearchEnabled) {
        if (startDate) {
          query = query.gte('start_time', startDate);
        }
        if (endDate) {
          query = query.lte('start_time', endDate);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database search error:', error);
        throw error;
      }

      console.log('Database search results:', data?.length || 0, 'songs found');

      // Transform database results to match API format
      return (data || []).map(song => ({
        id: song.spinitron_id,
        artist: song.artist,
        song: song.song,
        start: song.start_time,
        duration: song.duration || 0,
        composer: '',
        label: song.label || '',
        release: song.release || '',
        image: song.image || ''
      }));
    }

    // Otherwise, fetch live data from API
    const effectiveStartDate = dateSearchEnabled ? startDate : '';
    const effectiveEndDate = dateSearchEnabled ? endDate : '';
    
    console.log('Fetching live spins with params:', {
      endpoint: 'spins',
      station: stationId,
      count: maxItems.toString(),
      search: debouncedSearchTerm,
      start: effectiveStartDate,
      end: effectiveEndDate,
      dateSearchEnabled,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        station: stationId,
        count: maxItems.toString(),
        search: debouncedSearchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false', // Always fetch fresh data for live updates
        _cache_bust: Date.now().toString()
      }
    });

    if (error) {
      console.error('Error fetching spins:', error);
      throw error;
    }

    console.log('Received live spins:', data.items?.length || 0, 'for station:', stationId, 'at', new Date().toISOString());
    return data.items || [];
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  return useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate, dateSearchEnabled, hasActiveFilters],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate && !hasActiveFilters ? 5000 : false, // Reduced from 10 seconds to 5 seconds for faster updates
    staleTime: hasActiveFilters ? 30000 : 0, // Live data is immediately stale
    gcTime: hasActiveFilters ? 300000 : 30000, // Reduced cache time for live data
    refetchOnWindowFocus: !hasActiveFilters,
    refetchOnMount: true,
    refetchIntervalInBackground: autoUpdate && !hasActiveFilters,
    // Force network requests for live data
    networkMode: hasActiveFilters ? 'online' : 'always',
  });
};
