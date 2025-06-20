
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Search, Music, Clock, User, Radio, ImageIcon, Calendar, Play, Loader2 } from 'lucide-react';
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
  layout?: 'list' | 'grid' | 'ticker';
  scrollSpeed?: number;
}

// Component for handling image loading with fallback
const AlbumArtwork = ({ 
  src, 
  alt, 
  className = "",
  fallbackIconSize = "w-6 h-6"
}: { 
  src?: string; 
  alt: string; 
  className?: string;
  fallbackIconSize?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Music className={`${fallbackIconSize} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Music className={`${fallbackIconSize} text-muted-foreground animate-pulse`} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.log('Image failed to load:', src);
          setImageError(true);
        }}
        loading="lazy"
      />
    </div>
  );
};

const SpinitinonPlaylist = ({ 
  stationId = 'hyfin', // Default to HYFIN
  autoUpdate = true, 
  showSearch = true, 
  maxItems = 20,
  compact = false,
  startDate: initialStartDate = '',
  endDate: initialEndDate = '',
  layout = 'list',
  scrollSpeed = 60
}: SpinitinonPlaylistProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateSearchEnabled, setDateSearchEnabled] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allSpins, setAllSpins] = useState<Spin[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
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
    setDisplayCount(5);
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
      end: effectiveEndDate,
      use_cache: 'false',
      timestamp: Date.now()
    });

    const { data, error } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        station: stationId,
        count: maxItems.toString(),
        search: debouncedSearchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false',
        _cache_bust: Date.now().toString()
      }
    });

    if (error) {
      console.error('Error fetching spins:', error);
      throw error;
    }

    console.log('Received spins:', data.items?.length || 0, 'for station:', stationId, 'search:', debouncedSearchTerm);
    return data.items || [];
  };

  const effectiveStartDate = dateSearchEnabled ? startDate : '';
  const effectiveEndDate = dateSearchEnabled ? endDate : '';

  // Check if we have active filters
  const hasActiveFilters = debouncedSearchTerm || effectiveStartDate || effectiveEndDate;

  const { data: spins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spins', stationId, maxItems, debouncedSearchTerm, effectiveStartDate, effectiveEndDate],
    queryFn: fetchSpins,
    refetchInterval: autoUpdate ? 10000 : false, // Always poll every 10 seconds if autoUpdate is enabled
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    gcTime: 5000, // Keep in cache for 5 seconds
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
      setDisplayCount(prev => Math.min(prev + 5, allSpins.length));
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

  // Grid item component for better organization
  const GridItem = ({ spin, index }: { spin: Spin; index: number }) => (
    <div 
      className={`relative group overflow-hidden rounded-lg transition-all hover:scale-105 ${
        isCurrentlyPlaying(spin, index) ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      <AspectRatio ratio={1} className="bg-gradient-to-br from-muted to-muted/50">
        <AlbumArtwork
          src={spin.image}
          alt={`${spin.song} by ${spin.artist}`}
          className="w-full h-full rounded-lg overflow-hidden"
          fallbackIconSize="w-8 h-8"
        />
        
        {/* Overlay with song info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              {isCurrentlyPlaying(spin, index) && (
                <Play className="h-3 w-3 text-primary fill-current" />
              )}
              <span className="text-xs font-medium">{formatTime(spin.start)}</span>
            </div>
            <h3 className="font-semibold text-sm truncate">{spin.song}</h3>
            <p className="text-xs text-white/80 truncate">{spin.artist}</p>
          </div>
        </div>
        
        {/* Now playing badge */}
        {isCurrentlyPlaying(spin, index) && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
              Live
            </Badge>
          </div>
        )}
      </AspectRatio>
      
      {/* Song details below image */}
      <div className="p-2 space-y-1">
        <h3 className="font-medium text-sm truncate">{spin.song}</h3>
        <p className="text-xs text-muted-foreground truncate">{spin.artist}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(spin.start)}</span>
          {spin.duration && (
            <span>{Math.floor(spin.duration / 60)}:{(spin.duration % 60).toString().padStart(2, '0')}</span>
          )}
        </div>
      </div>
    </div>
  );

  // Ticker item component for scrolling layout
  const TickerItem = ({ spin, index }: { spin: Spin; index: number }) => (
    <div 
      className={`inline-flex items-center gap-3 px-6 py-2 whitespace-nowrap ${
        isCurrentlyPlaying(spin, index) ? 'bg-primary/10 text-primary' : ''
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8">
        <AlbumArtwork
          src={spin.image}
          alt={`${spin.song} by ${spin.artist}`}
          className="w-full h-full rounded"
          fallbackIconSize="w-4 h-4"
        />
      </div>
      
      <div className="flex items-center gap-2">
        {isCurrentlyPlaying(spin, index) && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-500">LIVE</span>
          </div>
        )}
        <span className="font-semibold">{spin.song}</span>
        <span className="text-muted-foreground">by {spin.artist}</span>
        <span className="text-xs text-muted-foreground">• {formatTime(spin.start)}</span>
      </div>
    </div>
  );

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
      <Card className={`w-full ${isEmbedMode && layout === 'ticker' ? 'h-full flex flex-col' : ''}`}>
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
    return layout === 'ticker' ? 'Live Radio' : 'Live Playlist';
  };

  return (
    <Card className={`w-full ${isEmbedMode && layout === 'ticker' ? 'h-full flex flex-col' : ''}`}>
      <CardHeader className={compact || layout === 'ticker' ? "pb-3" : ""}>
        <CardTitle className={`flex items-center gap-2 ${compact || layout === 'ticker' ? "text-lg" : ""}`}>
          <Radio className={`${compact || layout === 'ticker' ? "h-4 w-4" : "h-5 w-5"}`} />
          {getTitle()}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </CardTitle>
        
        {showSearch && layout !== 'ticker' && (
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
      
      <CardContent className={`${compact || layout === 'ticker' ? "pt-0" : ""} ${isEmbedMode && layout === 'ticker' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        <div className={isEmbedMode && layout === 'ticker' ? "flex-1 flex flex-col min-h-0" : ""}>
          {displayedSpins.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'No matching songs found' : 'No songs playing right now'}
              </p>
            </div>
          ) : layout === 'ticker' ? (
            // Ticker Layout with configurable scroll speed
            <div className="relative overflow-hidden bg-gradient-to-r from-background via-background/95 to-background rounded-lg border">
              <div 
                className="flex hover:[animation-play-state:paused]"
                style={{ 
                  animation: `scroll-left ${scrollSpeed}s linear infinite` 
                }}
              >
                {[...displayedSpins, ...displayedSpins].map((spin, index) => (
                  <TickerItem key={`ticker-${spin.id}-${index}`} spin={spin} index={index % displayedSpins.length} />
                ))}
              </div>
            </div>
          ) : layout === 'grid' ? (
            // Grid Layout
            <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
              {displayedSpins.map((spin, index) => (
                <GridItem key={`${spin.id}-${index}`} spin={spin} index={index} />
              ))}
            </div>
          ) : (
            // List Layout
            <div className="space-y-3">
              {displayedSpins.map((spin, index) => (
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
                        <AlbumArtwork
                          src={spin.image}
                          alt={`${spin.song} by ${spin.artist}`}
                          className="w-full h-full"
                          fallbackIconSize={compact ? 'w-4 h-4' : 'w-6 h-6'}
                        />
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
              ))}
            </div>
          )}
          
          {/* Load More Button - hidden for ticker layout */}
          {hasMoreSpins && layout !== 'ticker' && (
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
                  `Load More (${Math.min(5, allSpins.length - displayCount)} more songs)`
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
