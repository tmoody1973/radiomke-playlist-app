
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const DateRangePicker = ({ startDate, endDate, onDateChange, onClear }: DateRangePickerProps) => {
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [useTimeRange, setUseTimeRange] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const isoString = date.toISOString();
      onDateChange(isoString, endDate || '');
      setStartCalendarOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const isoString = date.toISOString();
      onDateChange(startDate || '', isoString);
      setEndCalendarOpen(false);
    }
  };

  const handleTimeRangeSearch = () => {
    if (selectedDate && startTime && endTime) {
      const startDateTime = new Date(selectedDate);
      const endDateTime = new Date(selectedDate);
      
      // Parse time (HH:MM format)
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      startDateTime.setHours(startHour, startMinute, 0, 0);
      endDateTime.setHours(endHour, endMinute, 59, 999);
      
      // If end time is before start time, assume it's the next day
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      onDateChange(startDateTime.toISOString(), endDateTime.toISOString());
    }
  };

  const handleTimeframeSelect = (timeframe: string) => {
    const now = new Date();
    let start: Date;
    
    switch (timeframe) {
      case 'last-hour':
        start = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'last-3-hours':
        start = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        break;
      case 'last-6-hours':
        start = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case 'last-12-hours':
        start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        onDateChange(start.toISOString(), new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());
        return;
      case 'last-7-days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-30-days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    onDateChange(start.toISOString(), now.toISOString());
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'PPP');
  };

  const hasDateFilter = startDate || endDate;

  return (
    <div className="space-y-3">
      {/* Quick Timeframe Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Quick Timeframes</span>
        </div>
        <Select onValueChange={handleTimeframeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-hour">Last Hour</SelectItem>
            <SelectItem value="last-3-hours">Last 3 Hours</SelectItem>
            <SelectItem value="last-6-hours">Last 6 Hours</SelectItem>
            <SelectItem value="last-12-hours">Last 12 Hours</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last-7-days">Last 7 Days</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Specific Date & Time Range Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Search by Date & Time</span>
        </div>
        
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {selectedDate && startTime && endTime && (
            <Button
              onClick={handleTimeRangeSearch}
              size="sm"
              className="w-full"
            >
              Search this timeframe
            </Button>
          )}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Custom Date Range</span>
        <div className="flex flex-wrap gap-2 items-center">
          <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? formatDisplayDate(startDate) : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={handleStartDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? formatDisplayDate(endDate) : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={handleEndDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear Filter Button */}
      {hasDateFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters & Return to Live Playlist
        </Button>
      )}
    </div>
  );
};

export default DateRangePicker;
