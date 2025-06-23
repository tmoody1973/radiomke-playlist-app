
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

    // For live data, always fetch from API and merge with recent database entries
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

    // Fetch fresh data from API
    const { data: apiData, error: apiError } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        station: stationId,
        count: maxItems.toString(),
        search: debouncedSearchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false',
        _cache_bust: Date.now().toString()
      }
    });

    if (apiError) {
      console.error('Error fetching from API:', apiError);
      // Fallback to database if API fails
      console.log('API failed, falling back to database cache');
      
      const { data: fallbackData, error: dbError } = await supabase
        .from('songs')
        .select('*')
        .eq('station_id', stationId)
        .order('start_time', { ascending: false })
        .limit(maxItems);

      if (dbError) {
        console.error('Database fallback also failed:', dbError);
        throw apiError; // Throw original API error
      }

      return (fallbackData || []).map(song => ({
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

    const apiSpins = apiData.items || [];
    console.log('Received API spins:', apiSpins.length, 'for station:', stationId);

    // Also fetch recent songs from database to ensure we don't miss any
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentDbSpins } = await supabase
      .from('songs')
      .select('*')
      .eq('station_id', stationId)
      .gte('start_time', oneHourAgo)
      .order('start_time', { ascending: false });

    // Merge API data with recent database data, removing duplicates
    const allSpins = new Map();
    
    // Add API spins first (they take priority)
    apiSpins.forEach((spin: any) => {
      allSpins.set(spin.id, {
        id: spin.id,
        artist: spin.artist,
        song: spin.song,
        start: spin.start,
        duration: spin.duration || 0,
        composer: '',
        label: spin.label || '',
        release: spin.release || '',
        image: spin.image || ''
      });
    });

    // Add recent database spins that aren't already in API results
    (recentDbSpins || []).forEach(dbSpin => {
      if (!allSpins.has(dbSpin.spinitron_id)) {
        allSpins.set(dbSpin.spinitron_id, {
          id: dbSpin.spinitron_id,
          artist: dbSpin.artist,
          song: dbSpin.song,
          start: dbSpin.start_time,
          duration: dbSpin.duration || 0,
          composer: '',
          label: dbSpin.label || '',
          release: dbSpin.release || '',
          image: dbSpin.image || ''
        });
      }
    });

    // Convert back to array and sort by start time (most recent first)
    const mergedSpins = Array.from(allSpins.values()).sort((a, b) => 
      new Date(b.start).getTime() - new Date(a.start).getTime()
    );

    console.log('Merged spins total:', mergedSpins.length, 'for station:', stationId);
    return mergedSpins.slice(0, maxItems);
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  return useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate, dateSearchEnabled, hasActiveFilters],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate && !hasActiveFilters ? 3000 : false, // Faster updates (3 seconds) to catch missed songs
    staleTime: hasActiveFilters ? 30000 : 0,
    gcTime: hasActiveFilters ? 300000 : 10000, // Shorter cache time for live data
    refetchOnWindowFocus: !hasActiveFilters,
    refetchOnMount: true,
    refetchIntervalInBackground: autoUpdate && !hasActiveFilters,
    networkMode: 'always', // Always try to fetch, even if offline
    retry: (failureCount, error) => {
      // Retry API failures up to 2 times, then fall back to database
      if (failureCount < 2) return true;
      return false;
    },
  });
};
