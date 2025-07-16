
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useConfigCache } from './useEmbedCache';

interface Station {
  id: string;
  name: string;
}

export const useEmbedDemoState = () => {
  const { savedConfig, saveConfig } = useConfigCache();
  
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState(savedConfig?.selectedStation || 'hyfin');
  const [autoUpdate, setAutoUpdate] = useState(savedConfig?.autoUpdate ?? true);
  const [showSearch, setShowSearch] = useState(savedConfig?.showSearch ?? true);
  const [maxItems, setMaxItems] = useState(savedConfig?.maxItems || 20);
  const [unlimitedSongs, setUnlimitedSongs] = useState(savedConfig?.unlimitedSongs || false);
  const [compact, setCompact] = useState(savedConfig?.compact || false);
  const [height, setHeight] = useState(savedConfig?.height || '600');
  const [theme, setTheme] = useState(savedConfig?.theme || 'light');
  const [layout, setLayout] = useState(savedConfig?.layout || 'list');
  const [enableDateSearch, setEnableDateSearch] = useState(savedConfig?.enableDateSearch || false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    savedConfig?.startDate ? new Date(savedConfig.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    savedConfig?.endDate ? new Date(savedConfig.endDate) : undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('stations')
          .select('id, name')
          .order('name');
        
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
    startDate,
    endDate,
  };

  // Auto-save configuration changes
  useEffect(() => {
    if (!loading && stations.length > 0) {
      saveConfig(embedConfig);
    }
  }, [embedConfig, loading, stations.length, saveConfig]);

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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    embedConfig,
  };
};
