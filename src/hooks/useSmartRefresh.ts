import { useEffect, useCallback, useRef } from 'react';
import { shouldUpdateSoon, getSongProgress } from '@/utils/playlistHelpers';

interface Spin {
  id: number;
  artist: string;
  song: string;
  start: string;
  duration: number;
}

interface UseSmartRefreshProps {
  spins: Spin[];
  currentTime: Date;
  hasActiveFilters: boolean;
  baseInterval: number; // Base interval in ms (e.g., 15000)
  onRefresh: () => void;
  autoUpdate: boolean;
}

export const useSmartRefresh = ({
  spins,
  currentTime,
  hasActiveFilters,
  baseInterval,
  onRefresh,
  autoUpdate
}: UseSmartRefreshProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<Date>(new Date());

  const calculateNextInterval = useCallback(() => {
    if (hasActiveFilters || !autoUpdate) return baseInterval;
    
    // Check if current song is ending soon
    const currentSong = spins[0];
    if (currentSong && shouldUpdateSoon(currentSong, currentTime)) {
      console.log('🎵 Song ending soon, increasing refresh frequency');
      return 10000; // 10 seconds when song is ending
    }
    
    return baseInterval; // Default 15 seconds
  }, [spins, currentTime, hasActiveFilters, baseInterval, autoUpdate]);

  const scheduleNextRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    const nextInterval = calculateNextInterval();
    
    intervalRef.current = setTimeout(() => {
      const now = new Date();
      const timeSinceLastRefresh = now.getTime() - lastRefreshRef.current.getTime();
      
      // Only refresh if enough time has passed (prevent rapid calls)
      if (timeSinceLastRefresh >= 8000) { // Min 8 seconds between refreshes
        console.log('🔄 Smart refresh triggered, interval:', nextInterval);
        lastRefreshRef.current = now;
        onRefresh();
      }
      
      // Schedule next refresh
      scheduleNextRefresh();
    }, nextInterval);
  }, [calculateNextInterval, onRefresh]);

  useEffect(() => {
    if (autoUpdate && !hasActiveFilters) {
      scheduleNextRefresh();
    } else if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [autoUpdate, hasActiveFilters, scheduleNextRefresh]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    lastRefreshRef.current = new Date();
    onRefresh();
    
    // Restart smart refresh cycle
    if (autoUpdate && !hasActiveFilters) {
      scheduleNextRefresh();
    }
  }, [onRefresh, autoUpdate, hasActiveFilters, scheduleNextRefresh]);

  return { manualRefresh };
};