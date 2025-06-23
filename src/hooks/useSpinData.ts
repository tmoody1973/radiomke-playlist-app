
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
    const effectiveStartDate = dateSearchEnabled ? startDate : '';
    const effectiveEndDate = dateSearchEnabled ? endDate : '';
    
    console.log('Fetching spins with params:', {
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
        use_cache: hasActiveFilters ? 'true' : 'false', // Use cache for searches, fresh data for live
        _cache_bust: Date.now().toString() // Force cache busting
      }
    });

    if (error) {
      console.error('Error fetching spins:', error);
      throw error;
    }

    console.log('Received spins:', data.items?.length || 0, 'for station:', stationId, 'at', new Date().toISOString());
    return data.items || [];
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  return useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate, dateSearchEnabled],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate && !hasActiveFilters ? 10000 : false, // Refetch every 10 seconds for live data
    staleTime: hasActiveFilters ? 30000 : 0, // Cache search results for 30s, fresh data for live
    gcTime: hasActiveFilters ? 300000 : 0, // Keep search results for 5 minutes, no cache for live
    refetchOnWindowFocus: !hasActiveFilters, // Only refetch on focus for live data
    refetchOnMount: true,
    refetchIntervalInBackground: autoUpdate && !hasActiveFilters, // Continue updating in background
  });
};
