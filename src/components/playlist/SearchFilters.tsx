
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Calendar } from 'lucide-react';
import DateRangePicker from '../DateRangePicker';

interface SearchFiltersProps {
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

export const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  dateSearchEnabled,
  setDateSearchEnabled,
  startDate,
  endDate,
  onDateChange,
  onDateClear,
  formatDate
}: SearchFiltersProps) => {
  const hasDateFilter = dateSearchEnabled && (startDate || endDate);

  return (
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
          onCheckedChange={setDateSearchEnabled}
        />
      </div>
      
      {dateSearchEnabled && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
          onClear={onDateClear}
        />
      )}
      
      {hasDateFilter && (
        <div className="flex gap-2 text-xs text-muted-foreground">
          {startDate && <span>From: {formatDate(startDate)}</span>}
          {endDate && <span>To: {formatDate(endDate)}</span>}
        </div>
      )}
    </div>
  );
};
