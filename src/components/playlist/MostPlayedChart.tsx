import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { useMostPlayedSongs } from '@/hooks/useMostPlayedSongs';
import { LazyYouTubePreviewButton } from './LazyYouTubePreviewButton';
import { Badge } from '@/components/ui/badge';

interface MostPlayedChartProps {
  stationId?: string;
  showStationFilter?: boolean;
}

export const MostPlayedChart = ({ stationId, showStationFilter = true }: MostPlayedChartProps) => {
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedStation, setSelectedStation] = useState<string>(stationId || '');

  const { data: mostPlayedSongs, isLoading, refetch, isFetching } = useMostPlayedSongs({
    timePeriod,
    limit: 50,
    stationId: selectedStation || undefined
  });

  const handleRefresh = () => {
    refetch();
  };

  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Last 7 Days';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Most Played Songs
          </h2>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded bg-muted h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Most Played Songs
        </h2>
        
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={(value: '7d' | '30d' | 'all') => setTimePeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {showStationFilter && (
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stations</SelectItem>
                <SelectItem value="88nine">88Nine</SelectItem>
                <SelectItem value="radiomilwaukee">Radio Milwaukee</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing top {mostPlayedSongs?.length || 0} songs from {getTimePeriodLabel(timePeriod).toLowerCase()}
      </div>

      <div className="space-y-2">
        {mostPlayedSongs?.map((song, index) => (
          <Card key={`${song.artist}-${song.song}`} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              {song.latest_image && (
                <img 
                  src={song.latest_image} 
                  alt="Album artwork"
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{song.song}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {song.play_count} {song.play_count === 1 ? 'play' : 'plays'}
                  </Badge>
                  {song.stations.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {song.stations.length} stations
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <LazyYouTubePreviewButton 
                  artist={song.artist} 
                  song={song.song}
                  trackId={`${song.artist}-${song.song}`}
                  currentlyPlaying={null}
                  isLoading={null}
                  onPlay={() => {}}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(!mostPlayedSongs || mostPlayedSongs.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No songs found for the selected time period.</p>
        </Card>
      )}
    </div>
  );
};