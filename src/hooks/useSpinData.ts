
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
    refetchInterval: autoUpdate && !hasActiveFilters ? 15000 : false, // Optimized: 15s for live data
    staleTime: hasActiveFilters ? 300000 : 45000, // Optimized: 5min for filters, 45s for live (increased from 15s)
    gcTime: hasActiveFilters ? 600000 : 120000, // Optimized: 10min for filters, 2min for live
    refetchOnWindowFocus: !hasActiveFilters, // Re-enabled for live data to get fresh updates
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
