
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Music, Clock, User, Disc, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

const SpinitinonPlaylist: React.FC<SpinitinonPlaylistProps> = ({
  stationId = '',
  autoUpdate = true,
  showSearch = true,
  maxItems = 20
}) => {
  const [spins, setSpins] = useState<SpinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSpins = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setIsRefreshing(!showLoader);
      setError(null);

      const params = new URLSearchParams({
        endpoint: 'spins',
        count: maxItems.toString(),
      });

      if (stationId) params.append('station', stationId);
      if (searchTerm) params.append('search', searchTerm);

      console.log('Fetching spins with params:', Object.fromEntries(params));

      const { data, error: supabaseError } = await supabase.functions.invoke('spinitron-proxy', {
        body: params.toString(),
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.items) {
        console.log('Received spins:', data.items.length);
        setSpins(data.items);
      } else {
        console.warn('No items in response:', data);
        setSpins([]);
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
      setIsRefreshing(false);
    }
  }, [stationId, searchTerm, maxItems, toast]);

  // Auto-update with setTimeout for better network handling
  useEffect(() => {
    if (!autoUpdate) return;

    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        fetchSpins(false); // Don't show loader for auto-updates
        scheduleNextUpdate(); // Schedule the next update
      }, 30000); // 30 seconds
    };

    scheduleNextUpdate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchSpins, autoUpdate]);

  // Initial load
  useEffect(() => {
    fetchSpins();
  }, [fetchSpins]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentlyPlaying = (start: string, duration: number) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(startTime.getTime() + duration * 1000);
    return now >= startTime && now <= endTime;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSpins();
  };

  if (loading && spins.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Loading Playlist...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Music className="h-5 w-5" />
            Playlist Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchSpins()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Live Playlist
            {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          
          {showSearch && (
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-initial">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search artist, song, album..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {spins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tracks found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spins.map((spin, index) => {
              const isPlaying = isCurrentlyPlaying(spin.start, spin.duration || 180);
              
              return (
                <div
                  key={`${spin.id}-${index}`}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-primary/10 border-primary/30 shadow-md animate-pulse' 
                      : 'bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {spin.image ? (
                        <img
                          src={spin.image}
                          alt={`${spin.release || 'Album'} cover`}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Disc className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-medium truncate ${isPlaying ? 'text-primary' : ''}`}>
                            {spin.song}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{spin.artist}</span>
                          </div>
                          {spin.release && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Disc className="h-3 w-3" />
                              <span className="truncate">{spin.release}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(spin.start)}</span>
                          {isPlaying && (
                            <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                              NOW PLAYING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {autoUpdate && (
            <p>Updates automatically every 30 seconds</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinitinonPlaylist;
