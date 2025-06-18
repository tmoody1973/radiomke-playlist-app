
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
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

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'PPP');
  };

  const hasDateFilter = startDate || endDate;

  return (
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

      {hasDateFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DateRangePicker;
