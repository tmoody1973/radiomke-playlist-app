
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';
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
  formatDate
}: PlaylistHeaderProps) => {
  return (
    <CardHeader className={compact ? "pb-3" : ""}>
      <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : ""}`}>
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
