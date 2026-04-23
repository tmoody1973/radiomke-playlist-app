
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchFilters } from './SearchFilters';

interface PlaylistHeaderProps {
  title: string;
  compact: boolean;
  isLoading: boolean;
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateSearchEnabled: boolean;
  setDateSearchEnabled: (enabled: boolean) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  onDateClear: () => void;
  formatDate: (dateString: string) => string;
  lastUpdate?: Date;
  onManualRefresh?: () => void;
}

const formatRelative = (date: Date) => {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
};

export const PlaylistHeader = ({
  title,
  compact,
  isLoading,
  showSearch,
  searchTerm,
  setSearchTerm,
  dateSearchEnabled,
  setDateSearchEnabled,
  startDate,
  endDate,
  onDateChange,
  onDateClear,
  formatDate,
  lastUpdate,
  onManualRefresh
}: PlaylistHeaderProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!lastUpdate) return;
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <CardHeader className={compact ? "pb-3" : ""}>
      <CardTitle className={`flex flex-wrap items-center gap-2 ${compact ? "text-lg" : ""}`}>
        <Radio className={`${compact ? "h-4 w-4" : "h-5 w-5"}`} />
        {title}
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
        {(lastUpdate || onManualRefresh) && (
          <div className="ml-auto flex items-center gap-2 text-xs font-normal text-muted-foreground">
            {lastUpdate && (
              <span
                title={lastUpdate.toLocaleString()}
                aria-live="polite"
              >
                Updated {formatRelative(lastUpdate)}
              </span>
            )}
            {onManualRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManualRefresh}
                disabled={isLoading}
                className="h-7 px-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="ml-1">Refresh</span>
              </Button>
            )}
          </div>
        )}
      </CardTitle>
      
      {showSearch && (
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateSearchEnabled={dateSearchEnabled}
          setDateSearchEnabled={setDateSearchEnabled}
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
          onDateClear={onDateClear}
          formatDate={formatDate}
        />
      )}
    </CardHeader>
  );
};
