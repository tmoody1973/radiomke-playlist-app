
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, RefreshCw, Clock } from 'lucide-react';
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
  lastUpdated?: Date;
  onRefresh?: () => void;
  hasActiveFilters?: boolean;
}

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
  lastUpdated,
  onRefresh,
  hasActiveFilters
}: PlaylistHeaderProps) => {
  const formatLastUpdated = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <CardHeader className={compact ? "pb-3" : ""}>
      <div className="flex items-center justify-between">
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : ""}`}>
          <Radio className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${!hasActiveFilters && !isLoading ? 'text-green-500' : ''}`} />
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
        </CardTitle>
        
        {!hasActiveFilters && (
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatLastUpdated(lastUpdated)}
              </div>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 px-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        )}
      </div>
      
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
