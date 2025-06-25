
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TicketmasterEventsSearchHeaderProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  totalCount: number;
}

export const TicketmasterEventsSearchHeader = ({
  searchTerm,
  onSearch,
  totalCount
}: TicketmasterEventsSearchHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="text-sm text-gray-600">
        Total: {totalCount} events
      </div>
    </div>
  );
};
