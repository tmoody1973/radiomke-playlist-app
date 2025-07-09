
import { useQuery } from '@tanstack/react-query';
import { UseSpinDataProps, Spin } from '@/types/spinData';
import { SpinDataService } from '@/services/spinDataService';

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
    return SpinDataService.fetchSpins(
      stationId,
      maxItems,
      debouncedSearchTerm,
      startDate,
      endDate,
      dateSearchEnabled,
      hasActiveFilters
    );
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  return useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate, dateSearchEnabled, hasActiveFilters],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate && !hasActiveFilters ? 30000 : false, // Reduced from 3s to 30s (10x reduction)
    staleTime: hasActiveFilters ? 300000 : 15000, // Increased staleTime: 5min for filters, 15s for live
    gcTime: hasActiveFilters ? 600000 : 60000, // Longer cache time: 10min for filters, 1min for live
    refetchOnWindowFocus: false, // Disabled to reduce unnecessary calls
    refetchOnMount: true,
    refetchIntervalInBackground: autoUpdate && !hasActiveFilters,
    networkMode: 'always',
    retry: (failureCount, error) => {
      // Retry API failures up to 2 times, then fall back to database
      if (failureCount < 2) return true;
      return false;
    },
  });
};
