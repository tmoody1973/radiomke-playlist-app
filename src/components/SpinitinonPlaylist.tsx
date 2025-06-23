
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Music, Radio, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from './playlist/SearchFilters';
import { GridItem } from './playlist/GridItem';
import { ListItem } from './playlist/ListItem';

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

interface SpinitinonPlaylistProps {
  stationId?: string;
  autoUpdate?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  compact?: boolean;
  startDate?: string;
  endDate?: string;
  layout?: 'list' | 'grid';
}

const SpinitinonPlaylist = ({ 
  stationId = 'hyfin',
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate: initialStartDate = '',
  endDate: initialEndDate = '',
  layout = 'list'
}: SpinitinonPlaylistProps) => {
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
  }, [debouncedSearchTerm, startDate, endDate, dateSearchEnabled, stationId]);

  const fetchSpins = async (): Promise<Spin[]> => {
    const effectiveStartDate = dateSearchEnabled ? startDate : '';
    const effectiveEndDate = dateSearchEnabled ? endDate : '';
    
    console.log('Fetching spins with params:', {
      endpoint: 'spins',
      station: stationId,
      count: maxItems.toString(),
      search: debouncedSearchTerm,
      start: effectiveStartDate,
      end: effectiveEndDate
    });

    const { data, error } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        station: stationId,
        count: maxItems.toString(),
        search: debouncedSearchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false'
      }
    });

    if (error) {
      console.error('Error fetching spins:', error);
      throw error;
    }

    console.log('Received spins:', data.items?.length || 0, 'for station:', stationId);
    return data.items || [];
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  // Check if we have active filters
  const hasActiveFilters = debouncedSearchTerm || effectiveStartDate || effectiveEndDate;

  const { data: spins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate ? 5000 : false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update allSpins when new data comes in
  useEffect(() => {
    if (spins && spins.length > 0) {
      setAllSpins(spins);
    }
  }, [spins]);

  const displayedSpins = allSpins.slice(0, displayCount);
  const hasMoreSpins = displayCount < allSpins.length;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 15, allSpins.length));
      setLoadingMore(false);
    }, 500);
  };

  // Improved "now playing" detection
  const isCurrentlyPlaying = (spin: Spin, index: number) => {
    // Only show "now playing" for live data (no active filters)
    if (hasActiveFilters) return false;
    
    const startTime = new Date(spin.start);
    const endTime = new Date(startTime.getTime() + (spin.duration || 180) * 1000);
    
    // Check if current time is within the song's play window
    const isWithinTimeWindow = currentTime >= startTime && currentTime <= endTime;
    
    // For live playlist, the currently playing song should be the most recent one that's within its time window
    if (index === 0 && isWithinTimeWindow) {
      return true;
    }
    
    // Check if this song is playing now (useful for historical data that might be current)
    return isWithinTimeWindow;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleDateClear = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDateSearchToggle = (enabled: boolean) => {
    setDateSearchEnabled(enabled);
    if (!enabled) {
      setStartDate('');
      setEndDate('');
    }
  };

  const isEmbedMode = window.location.pathname === '/embed';
  const hasDateFilter = dateSearchEnabled && (startDate || endDate);

  if (error) {
    return (
      <Card className={`w-full ${isEmbedMode ? 'h-full flex flex-col' : ''}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <Radio className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load playlist data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your connection and try again
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTitle = () => {
    if (hasDateFilter && debouncedSearchTerm) {
      return 'Filtered Results';
    } else if (hasDateFilter) {
      return 'Date Range Results';
    } else if (debouncedSearchTerm) {
      return 'Search Results';
    }
    return 'Live Playlist';
  };

  return (
    <Card className={`w-full ${isEmbedMode ? 'h-full flex flex-col' : ''}`}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : ""}`}>
          <Radio className={`${compact ? "h-4 w-4" : "h-5 w-5"}`} />
          {getTitle()}
          <Badge 
            variant="secondary" 
            className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 font-semibold tracking-wide shadow-sm"
          >
            BETA
          </Badge>
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </CardTitle>
        
        {showSearch && (
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateSearchEnabled={dateSearchEnabled}
            setDateSearchEnabled={handleDateSearchToggle}
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onDateClear={handleDateClear}
            formatDate={formatDate}
          />
        )}
      </CardHeader>
      
      <CardContent className={`${compact ? "pt-0" : ""} ${isEmbedMode ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        <div className={isEmbedMode ? "flex-1 flex flex-col min-h-0" : ""}>
          <ScrollArea 
            className={
              isEmbedMode 
                ? "flex-1" 
                : compact 
                  ? "h-64" 
                  : "h-96"
            } 
            type="always"
          >
            {displayedSpins.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'No matching songs found' : 'No songs playing right now'}
                </p>
              </div>
            ) : layout === 'grid' ? (
              // Grid Layout
              <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                {displayedSpins.map((spin, index) => (
                  <GridItem 
                    key={`${spin.id}-${index}`} 
                    spin={spin} 
                    index={index}
                    isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            ) : (
              // List Layout
              <div className="space-y-3">
                {displayedSpins.map((spin, index) => (
                  <ListItem
                    key={`${spin.id}-${index}`}
                    spin={spin}
                    index={index}
                    isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
                    compact={compact}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Load More Button */}
          {hasMoreSpins && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full sm:w-auto"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinitinonPlaylist;
