
import { useState, useEffect } from 'react';


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

  // Initialize available stations from a safe, static list (no DB call)
  useEffect(() => {
    const DEFAULT_STATIONS: Station[] = [
      { id: 'hyfin', name: 'HYFIN' },
      { id: '88nine', name: '88Nine Radio Milwaukee' },
    ];
    setStations(DEFAULT_STATIONS);
    setError(null);
    setLoading(false);
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
