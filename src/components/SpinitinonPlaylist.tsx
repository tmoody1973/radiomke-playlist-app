
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Switch } from '@/components/ui/switch';
import { Search, Music, Clock, User, Radio, ImageIcon, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DateRangePicker from './DateRangePicker';

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
}

const SpinitinonPlaylist = ({ 
  stationId = '', 
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate: initialStartDate = '',
  endDate: initialEndDate = ''
}: SpinitinonPlaylistProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateSearchEnabled, setDateSearchEnabled] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Initialize date search if dates were provided via props
  useEffect(() => {
    if (initialStartDate || initialEndDate) {
      setDateSearchEnabled(true);
    }
  }, [initialStartDate, initialEndDate]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSpins = async (): Promise<Spin[]> => {
    const effectiveStartDate = dateSearchEnabled ? startDate : '';
    const effectiveEndDate = dateSearchEnabled ? endDate : '';
    
    console.log('Fetching spins with params:', {
      endpoint: 'spins',
      count: maxItems.toString(),
      search: debouncedSearchTerm,
      start: effectiveStartDate,
      end: effectiveEndDate,
      use_cache: 'false', // Always fetch fresh data for live updates
      timestamp: Date.now()
    });

    const { data, error } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        count: maxItems.toString(),
        search: debouncedSearchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false', // Always get fresh data
        _cache_bust: Date.now().toString()
      }
    });

    if (error) {
      console.error('Error fetching spins:', error);
      throw error;
    }

    console.log('Received spins:', data.items?.length || 0, 'for search:', debouncedSearchTerm);
    return data.items || [];
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  // Check if we have active filters
  const hasActiveFilters = debouncedSearchTerm || effectiveStartDate || effectiveEndDate;

  const { data: spins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spins', stationId, page, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate && !hasActiveFilters ? 10000 : false, // Consistent 10 second updates
    staleTime: 0, // Always consider data stale for immediate updates
    gcTime: 5000, // Short garbage collection time
  });

  // Consistent polling for live updates
  useEffect(() => {
    if (!autoUpdate || hasActiveFilters) return;

    console.log('Setting up consistent polling for live updates...');
    const interval = setInterval(() => {
      console.log('Polling for updates...');
      refetch();
    }, 10000); // Poll every 10 seconds consistently

    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [autoUpdate, refetch, hasActiveFilters]);

  const displayedSpins = spins;

  // Determine if a song is currently playing (within the last 5 minutes of its start time + duration)
  const isCurrentlyPlaying = (spin: Spin, index: number) => {
    if (hasActiveFilters) return false; // Don't show "now playing" when filtering
    if (index !== 0) return false; // Only the first song can be "now playing"
    
    const now = new Date();
    const startTime = new Date(spin.start);
    const endTime = new Date(startTime.getTime() + (spin.duration || 180) * 1000);
    
    return now >= startTime && now <= endTime;
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
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </CardTitle>
        
        {showSearch && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Search</span>
              <Switch
                checked={dateSearchEnabled}
                onCheckedChange={handleDateSearchToggle}
              />
            </div>
            
            {dateSearchEnabled && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                onClear={handleDateClear}
              />
            )}
            
            {hasDateFilter && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                {startDate && <span>From: {formatDate(startDate)}</span>}
                {endDate && <span>To: {formatDate(endDate)}</span>}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={`${compact ? "pt-0" : ""} ${isEmbedMode ? 'flex-1 flex flex-col min-h-0' : ''}`}>
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
          <div className="space-y-3">
            {displayedSpins.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'No matching songs found' : 'No songs playing right now'}
                </p>
              </div>
            ) : (
              displayedSpins.map((spin, index) => (
                <div 
                  key={`${spin.id}-${index}`}
                  className={`p-3 border rounded-lg transition-colors hover:bg-accent/50 ${
                    isCurrentlyPlaying(spin, index) ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Album Artwork */}
                    <div className={`flex-shrink-0 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
                      <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
                        {spin.image ? (
                          <img
                            src={spin.image}
                            alt={`${spin.song} by ${spin.artist}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full bg-muted flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-muted-foreground`} />
                          </div>
                        )}
                      </AspectRatio>
                    </div>

                    {/* Song Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold truncate ${compact ? "text-sm" : ""}`}>
                            {spin.song}
                          </h3>
                          <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
                            <User className="inline h-3 w-3 mr-1" />
                            {spin.artist}
                          </p>
                          {spin.composer && (
                            <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
                              Composer: {spin.composer}
                            </p>
                          )}
                          {spin.label && (
                            <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
                              Label: {spin.label}
                            </p>
                          )}
                          {spin.release && (
                            <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
                              Release: {spin.release}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          {isCurrentlyPlaying(spin, index) && (
                            <Badge variant="secondary" className={compact ? "text-xs px-2 py-0" : ""}>
                              Now Playing
                            </Badge>
                          )}
                          <div className={`text-right mt-1 ${compact ? "text-xs" : "text-sm"}`}>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(spin.start)}
                            </div>
                            <div className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                              {formatDate(spin.start)}
                            </div>
                            {spin.duration && (
                              <div className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                                {Math.floor(spin.duration / 60)}:{(spin.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SpinitinonPlaylist;
