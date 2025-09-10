
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Station {
  id: string;
  name: string;
}

export const useEmbedDemoState = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState('hyfin');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [maxItems, setMaxItems] = useState(20);
  const [unlimitedSongs, setUnlimitedSongs] = useState(false);
  const [compact, setCompact] = useState(false);
  const [height, setHeight] = useState('600');
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState('list');
  const [enableDateSearch, setEnableDateSearch] = useState(false);
  const [enableYouTube, setEnableYouTube] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .rpc('public_list_stations');
        
        if (error) {
          console.error('Error fetching stations:', error);
          setError('Failed to load stations. Please try refreshing the page.');
        } else if (data && data.length > 0) {
          setStations(data);
        } else {
          setError('No stations found. Please check your configuration.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const embedConfig = {
    selectedStation,
    autoUpdate,
    showSearch,
    maxItems,
    unlimitedSongs,
    compact,
    height,
    theme,
    layout,
    enableDateSearch,
    enableYouTube,
    showHeader,
    showLoadMore,
    startDate,
    endDate,
  };

  return {
    stations,
    selectedStation,
    setSelectedStation,
    autoUpdate,
    setAutoUpdate,
    showSearch,
    setShowSearch,
    maxItems,
    setMaxItems,
    unlimitedSongs,
    setUnlimitedSongs,
    compact,
    setCompact,
    height,
    setHeight,
    theme,
    setTheme,
    layout,
    setLayout,
    enableDateSearch,
    setEnableDateSearch,
    enableYouTube,
    setEnableYouTube,
    showHeader,
    setShowHeader,
    showLoadMore,
    setShowLoadMore,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    embedConfig,
  };
};
