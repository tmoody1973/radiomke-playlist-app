import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Music, Clock, User, Disc, RefreshCw, Calendar, Database, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SpinItem {
  id: number;
  start: string;
  duration: number;
  song: string;
  artist: string;
  release?: string;
  label?: string;
  image?: string;
  episode?: {
    title: string;
  };
}

interface SpinitinonPlaylistProps {
  stationId?: string;
  autoUpdate?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const SpinitinonPlaylist: React.FC<SpinitinonPlaylistProps> = ({
  stationId = '',
  autoUpdate = true,
  showSearch = true,
  maxItems = 20,
  compact = false
}) => {
  const [spins, setSpins] = useState<SpinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [useCache, setUseCache] = useState(true);
  const { toast } = useToast();

  // Debounced search term for actual API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSpins = useCallback(async (showLoader = true, append = false, page = 1) => {
    try {
      if (showLoader && !append) setLoading(true);
      if (append) setLoadingMore(true);
      if (!showLoader && !append) setIsRefreshing(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('endpoint', 'spins');
      queryParams.append('count', maxItems.toString());
      queryParams.append('use_cache', useCache.toString());
      
      if (stationId) queryParams.append('station', stationId);
      if (debouncedSearchTerm.trim()) queryParams.append('search', debouncedSearchTerm.trim());
      if (startDate) queryParams.append('start', startDate.toISOString());
      if (endDate) queryParams.append('end', endDate.toISOString());
      
      // Fix pagination: use the actual page number and let backend handle offset
      if (page > 1) {
        queryParams.append('page', page.toString());
      }

      console.log('Fetching spins with params:', Object.fromEntries(queryParams));

      const { data, error: supabaseError } = await supabase.functions.invoke('spinitron-proxy', {
        method: 'POST',
        body: queryParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.items) {
        console.log('Received spins:', data.items.length, 'for page:', page);
        
        if (append) {
          // When appending, filter out any duplicates based on ID
          const existingIds = new Set(spins.map(spin => spin.id));
          const newSpins = data.items.filter((spin: SpinItem) => !existingIds.has(spin.id));
          console.log('Adding', newSpins.length, 'new unique spins');
          setSpins(prev => [...prev, ...newSpins]);
          
          // For pagination: if we got 0 new unique items, assume no more data
          if (newSpins.length === 0) {
            setHasMore(false);
          } else {
            // Keep hasMore true if we got new items (backend typically returns 20 per page)
            setHasMore(true);
          }
        } else {
          setSpins(data.items);
          // For initial load: assume more data is available unless we get 0 items
          setHasMore(data.items.length > 0);
        }
      } else {
        console.warn('No items in response:', data);
        if (!append) setSpins([]);
        setHasMore(false);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch playlist';
      console.error('Error fetching spins:', err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [stationId, debouncedSearchTerm, startDate, endDate, maxItems, useCache, toast, spins]);

  // Auto-update effect
  useEffect(() => {
    if (!autoUpdate) return;

    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        if (currentPage === 1 && !debouncedSearchTerm.trim() && !startDate && !endDate) {
          fetchSpins(false, false, 1);
        }
        scheduleNextUpdate();
      }, 30000);
    };

    scheduleNextUpdate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchSpins, autoUpdate, currentPage, debouncedSearchTerm, startDate, endDate]);

  // Trigger search when debounced search term, filters, or cache setting change
  useEffect(() => {
    setCurrentPage(1);
    fetchSpins(true, false, 1);
  }, [debouncedSearchTerm, startDate, endDate, useCache]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchSpins(false, true, nextPage);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediately update debounced search term to trigger search
    setDebouncedSearchTerm(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isCurrentlyPlaying = (start: string, duration: number) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(startTime.getTime() + duration * 1000);
    return now >= startTime && now <= endTime;
  };

  // Find the currently playing song
  const currentlyPlayingSong = spins.find(spin => isCurrentlyPlaying(spin.start, spin.duration || 180));

  // Check if we have active search/filters
  const hasActiveFilters = debouncedSearchTerm.trim() || startDate || endDate;

  // Filter spins to show only matching results when searching
  const getFilteredSpins = () => {
    if (!debouncedSearchTerm.trim()) return spins;
    
    const searchTerm = debouncedSearchTerm.toLowerCase();
    return spins.filter(spin => 
      spin.song.toLowerCase().includes(searchTerm) ||
      spin.artist.toLowerCase().includes(searchTerm) ||
      (spin.release && spin.release.toLowerCase().includes(searchTerm))
    );
  };

  // Filter spins to count actual matches when searching
  const getSearchMatchCount = () => {
    if (!debouncedSearchTerm.trim()) return spins.length;
    
    const searchTerm = debouncedSearchTerm.toLowerCase();
    return spins.filter(spin => 
      spin.song.toLowerCase().includes(searchTerm) ||
      spin.artist.toLowerCase().includes(searchTerm) ||
      (spin.release && spin.release.toLowerCase().includes(searchTerm))
    ).length;
  };

  if (loading && spins.length === 0) {
    return (
      <Card className="w-full max-w-full mx-auto">
        <CardHeader className={compact ? 'py-3' : ''}>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : ''}`}>
            <Music className={compact ? "h-4 w-4" : "h-5 w-5"} />
            Loading Playlist...
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'py-3' : ''}>
          <div className="space-y-3">
            {[...Array(compact ? 3 : 5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-gray-200 rounded`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`${compact ? 'h-3' : 'h-4'} bg-gray-200 rounded w-3/4`}></div>
                    <div className={`${compact ? 'h-2' : 'h-3'} bg-gray-200 rounded w-1/2`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && spins.length === 0) {
    return (
      <Card className="w-full max-w-full mx-auto">
        <CardHeader className={compact ? 'py-3' : ''}>
          <CardTitle className={`flex items-center gap-2 text-red-600 ${compact ? 'text-lg' : ''}`}>
            <Music className={compact ? "h-4 w-4" : "h-5 w-5"} />
            Playlist Error
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'py-3' : ''}>
          <p className={`text-red-600 mb-4 ${compact ? 'text-sm' : ''}`}>{error}</p>
          <Button onClick={() => fetchSpins()} variant="outline" size={compact ? "sm" : "default"}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader className={compact ? 'py-3' : ''}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : ''}`}>
              <Music className={compact ? "h-4 w-4" : "h-5 w-5"} />
              Live Playlist
              {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
              {useCache && <Database className="h-4 w-4 text-green-600" />}
            </CardTitle>
          </div>
          
          {showSearch && !compact && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-cache"
                  checked={useCache}
                  onCheckedChange={setUseCache}
                />
                <Label htmlFor="use-cache" className="text-sm">
                  Use cached data for faster search
                </Label>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search artist, song, album..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    size="sm"
                  />
                </div>
                <Button type="submit" size="sm">
                  Search
                </Button>
              </form>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(searchTerm || debouncedSearchTerm || startDate || endDate) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Compact search for embed mode */}
          {showSearch && compact && (
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
              <Button type="submit" size="sm" className="h-8 px-3">
                <Search className="h-3 w-3" />
              </Button>
            </form>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'py-3' : ''}>
        {/* Now Playing Section - Enhanced but compact when needed */}
        {currentlyPlayingSong && !hasActiveFilters && (
          <div className={compact ? "mb-4" : "mb-8"}>
            <div className="flex items-center gap-2 mb-3">
              <Radio className={`${compact ? 'h-4 w-4' : 'h-6 w-6'} text-red-500 animate-pulse`} />
              <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-600`}>NOW PLAYING</h2>
            </div>
            <div className={`${compact ? 'p-3' : 'p-6'} rounded-xl border-4 border-red-300 bg-gradient-to-r from-red-50 to-red-100 shadow-lg`}>
              <div className={`flex ${compact ? 'gap-3' : 'gap-6'}`}>
                <div className="flex-shrink-0">
                  {currentlyPlayingSong.image ? (
                    <img
                      src={currentlyPlayingSong.image}
                      alt={`${currentlyPlayingSong.release || 'Album'} cover`}
                      className={`${compact ? 'w-12 h-12' : 'w-24 h-24 md:w-32 md:h-32'} rounded-lg object-cover shadow-lg ring-2 ring-red-300`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`${compact ? 'w-12 h-12' : 'w-24 h-24 md:w-32 md:h-32'} bg-red-200 rounded-lg flex items-center justify-center shadow-lg ring-2 ring-red-300`}>
                      <Disc className={`${compact ? 'h-6 w-6' : 'h-12 w-12 md:h-16 md:w-16'} text-red-500`} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${compact ? 'text-lg' : 'text-2xl md:text-3xl'} text-red-800 truncate mb-1`}>
                    {currentlyPlayingSong.song}
                  </h3>
                  <div className="flex items-center gap-1 text-red-700 mb-1">
                    <User className={compact ? "h-3 w-3" : "h-5 w-5"} />
                    <span className={`font-semibold ${compact ? 'text-sm' : 'text-lg md:text-xl'} truncate`}>{currentlyPlayingSong.artist}</span>
                  </div>
                  {currentlyPlayingSong.release && (
                    <div className={`flex items-center gap-1 text-red-600 ${compact ? 'text-xs mb-1' : 'text-base md:text-lg mb-3'}`}>
                      <Disc className="h-3 w-3" />
                      <span className="truncate">{currentlyPlayingSong.release}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-red-600 ${compact ? 'text-xs' : 'text-sm md:text-base'}`}>
                    <Clock className="h-3 w-3" />
                    <span>Started at {formatTime(currentlyPlayingSong.start)}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} bg-red-500 text-white rounded-full font-medium animate-pulse`}>
                      ● LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Separator className={compact ? "my-4" : "my-8"} />
          </div>
        )}

        {/* Search Results Header */}
        {hasActiveFilters && spins.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold`}>
                Search Results 
                {debouncedSearchTerm && <span className="text-blue-500 ml-1">for "{debouncedSearchTerm}"</span>}
              </h3>
            </div>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mb-3`}>
              {debouncedSearchTerm.trim() ? (
                <>
                  Found {getSearchMatchCount()} matching tracks
                </>
              ) : (
                <>Found {spins.length} tracks</>
              )}
              {startDate && <span> from {formatDate(startDate.toISOString())}</span>}
              {endDate && <span> to {formatDate(endDate.toISOString())}</span>}
            </p>
            <Separator className="mb-3" />
          </div>
        )}

        {/* Main Playlist */}
        {spins.length === 0 ? (
          <div className={`text-center ${compact ? 'py-4' : 'py-8'} text-gray-500`}>
            <Music className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-3 opacity-50`} />
            <p className={compact ? 'text-sm' : ''}>No tracks found</p>
            {(debouncedSearchTerm || startDate || endDate) && (
              <p className={`${compact ? 'text-xs' : 'text-sm'} mt-1`}>Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className={compact ? "space-y-2" : "space-y-3"}>
            {/* Playlist Header for non-search results */}
            {!hasActiveFilters && (
              <div className="flex items-center gap-2 mb-3">
                <Music className={compact ? "h-4 w-4" : "h-5 w-5"} />
                <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold`}>Recent Playlist</h3>
              </div>
            )}
            
            {getFilteredSpins().map((spin, index) => {
              const isPlaying = isCurrentlyPlaying(spin.start, spin.duration || 180);
              // Only hide currently playing song in the main list if NO active filters
              if (isPlaying && !hasActiveFilters) return null;
              
              return (
                <div
                  key={`${spin.id}-${index}`}
                  className={`${compact ? 'p-2' : 'p-4'} rounded-lg border transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-primary/10 border-primary/30 shadow-md' 
                      : 'bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className={`flex ${compact ? 'gap-2' : 'gap-4'}`}>
                    <div className="flex-shrink-0">
                      {spin.image ? (
                        <img
                          src={spin.image}
                          alt={`${spin.release || 'Album'} cover`}
                          className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded object-cover`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-gray-200 rounded flex items-center justify-center`}>
                          <Disc className={`${compact ? 'h-4 w-4' : 'h-6 w-6'} text-gray-400`} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <h4 className={`${compact ? 'text-sm' : 'font-medium'} truncate ${isPlaying ? 'text-primary' : ''}`}>
                            {spin.song}
                          </h4>
                          <div className={`flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            <User className="h-3 w-3" />
                            <span className="truncate">{spin.artist}</span>
                          </div>
                          {spin.release && !compact && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Disc className="h-3 w-3" />
                              <span className="truncate">{spin.release}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex flex-col items-end gap-1 ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground flex-shrink-0`}>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(spin.start)}</span>
                          </div>
                          {hasActiveFilters && !compact && (
                            <span className="text-xs">{formatDate(spin.start)}</span>
                          )}
                          {isPlaying && (
                            <span className={`${compact ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-xs'} bg-primary text-primary-foreground rounded-full`}>
                              PLAYING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Load More Button - Show when there are more results available */}
            {hasMore && spins.length > 0 && !compact && (
              <div className="flex justify-center pt-3">
                <Button 
                  onClick={handleLoadMore} 
                  variant="outline" 
                  size="sm"
                  disabled={loadingMore}
                  className="min-w-24"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className={`mt-3 text-center ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          {autoUpdate && currentPage === 1 && !debouncedSearchTerm && !startDate && !endDate && !compact && (
            <p>Updates automatically every 30 seconds</p>
          )}
          {spins.length > 0 && (
            <p className="mt-1">
              {hasActiveFilters ? (
                <>Showing {getFilteredSpins().length} of {spins.length} tracks</>
              ) : (
                <>Showing {spins.length} tracks</>
              )}
              {useCache && !compact && <span className="text-green-600 ml-1">(cached search enabled)</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinitinonPlaylist;
