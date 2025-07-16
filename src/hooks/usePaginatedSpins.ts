import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SpinDataService } from '@/services/spinDataService';
import { Spin } from '@/types/spinData';

interface UsePaginatedSpinsProps {
  stationId: string;
  initialMaxItems: number;
  debouncedSearchTerm: string;
  startDate: string;
  endDate: string;
  dateSearchEnabled: boolean;
  autoUpdate: boolean;
  hasActiveFilters: boolean;
}

export const usePaginatedSpins = ({
  stationId,
  initialMaxItems,
  debouncedSearchTerm,
  startDate,
  endDate,
  dateSearchEnabled,
  autoUpdate,
  hasActiveFilters
}: UsePaginatedSpinsProps) => {
  const queryClient = useQueryClient();
  const [allSpins, setAllSpins] = useState<Spin[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prefetchTriggered = useRef(false);

  // Reset pagination when filters change
  useEffect(() => {
    setAllSpins([]);
    setCurrentOffset(0);
    setHasMore(true);
    prefetchTriggered.current = false;
  }, [debouncedSearchTerm, startDate, endDate, dateSearchEnabled, hasActiveFilters]);

  const { data: currentBatch = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spins', stationId, initialMaxItems, debouncedSearchTerm, startDate, endDate, dateSearchEnabled, hasActiveFilters, currentOffset],
    queryFn: async (): Promise<Spin[]> => {
      const spins = await SpinDataService.fetchSpins(
        stationId,
        initialMaxItems,
        debouncedSearchTerm,
        startDate,
        endDate,
        dateSearchEnabled,
        hasActiveFilters,
        currentOffset
      );
      
      // Check if we have fewer results than requested, indicating no more data
      if (spins.length < initialMaxItems) {
        setHasMore(false);
      }
      
      return spins;
    },
    refetchInterval: autoUpdate && !hasActiveFilters && currentOffset === 0 ? 30000 : false,
    staleTime: hasActiveFilters ? 300000 : 15000,
    gcTime: hasActiveFilters ? 600000 : 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    networkMode: 'always',
    retry: (failureCount, error) => {
      if (failureCount < 2) return true;
      return false;
    },
  });

  // Update allSpins when new batch arrives
  useEffect(() => {
    if (currentBatch.length > 0) {
      if (currentOffset === 0) {
        // First batch or refresh
        setAllSpins(currentBatch);
      } else {
        // Subsequent batches - append to existing
        setAllSpins(prev => {
          const existingIds = new Set(prev.map(spin => spin.id));
          const newSpins = currentBatch.filter(spin => !existingIds.has(spin.id));
          return [...prev, ...newSpins];
        });
      }
      setIsLoadingMore(false);
    }
  }, [currentBatch, currentOffset]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const newOffset = currentOffset + initialMaxItems;
    setCurrentOffset(newOffset);
  }, [currentOffset, initialMaxItems, isLoadingMore, hasMore]);

  // Intelligent prefetching - when user is at 80% of cached data
  const checkForPrefetch = useCallback((currentIndex: number) => {
    const threshold = Math.floor(allSpins.length * 0.8);
    
    if (currentIndex >= threshold && !prefetchTriggered.current && hasMore && !isLoadingMore) {
      prefetchTriggered.current = true;
      
      // Prefetch next batch
      const nextOffset = currentOffset + initialMaxItems;
      queryClient.prefetchQuery({
        queryKey: ['spins', stationId, initialMaxItems, debouncedSearchTerm, startDate, endDate, dateSearchEnabled, hasActiveFilters, nextOffset],
        queryFn: () => SpinDataService.fetchSpins(
          stationId,
          initialMaxItems,
          debouncedSearchTerm,
          startDate,
          endDate,
          dateSearchEnabled,
          hasActiveFilters,
          nextOffset
        ),
        staleTime: 60000, // 1 minute
      });
    }
  }, [allSpins.length, currentOffset, initialMaxItems, hasMore, isLoadingMore, queryClient, stationId, debouncedSearchTerm, startDate, endDate, dateSearchEnabled, hasActiveFilters]);

  return {
    data: allSpins,
    isLoading: isLoading && currentOffset === 0, // Only show loading for initial fetch
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch: () => {
      setCurrentOffset(0);
      setAllSpins([]);
      setHasMore(true);
      prefetchTriggered.current = false;
      return refetch();
    },
    checkForPrefetch,
  };
};