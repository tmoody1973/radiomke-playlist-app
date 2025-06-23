import { useState, useEffect } from 'react';

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

interface UsePlaylistStateProps {
  spins: Spin[];
  hasActiveFilters: boolean;
  initialStartDate: string;
  initialEndDate: string;
}

export const usePlaylistState = ({ spins, hasActiveFilters, initialStartDate, initialEndDate }: UsePlaylistStateProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateSearchEnabled, setDateSearchEnabled] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allSpins, setAllSpins] = useState<Spin[]>([]);
  const [displayCount, setDisplayCount] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initialize date search if dates were provided via props
  useEffect(() => {
    if (initialStartDate || initialEndDate) {
      setDateSearchEnabled(true);
    }
  }, [initialStartDate, initialEndDate]);

  // Update current time every second for accurate "now playing" detection
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset display count when search or date filters change
  useEffect(() => {
    setDisplayCount(15);
    setAllSpins([]);
  }, [debouncedSearchTerm, startDate, endDate, dateSearchEnabled]);

  // Update allSpins when new data comes in and ensure fresh data replaces old
  useEffect(() => {
    if (spins && spins.length > 0) {
      // For live data (no filters), always replace the data to show latest songs
      if (!hasActiveFilters) {
        setAllSpins(spins);
        setDisplayCount(15); // Reset display count for fresh live data
      } else {
        // For filtered data, keep the existing behavior
        setAllSpins(spins);
      }
    }
  }, [spins, hasActiveFilters]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    dateSearchEnabled,
    setDateSearchEnabled,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentTime,
    allSpins,
    setAllSpins,
    displayCount,
    setDisplayCount,
    loadingMore,
    setLoadingMore
  };
};
