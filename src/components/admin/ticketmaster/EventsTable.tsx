
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TicketmasterEvent } from './types';

interface EventsTableProps {
  events: TicketmasterEvent[];
  onEdit: (event: TicketmasterEvent) => void;
  onDelete: (id: string) => void;
  onMakeActive: (id: string) => void;
  isDeleting: boolean;
  isActivating: boolean;
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  onEdit,
  onDelete,
  onMakeActive,
  isDeleting,
  isActivating
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Artist</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Date/Time</TableHead>
          <TableHead>Price Range</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.artist_name}</TableCell>
            <TableCell>{event.event_name}</TableCell>
            <TableCell>
              {event.venue_name && (
                <div>
                  {event.venue_name}
                  {event.venue_city && `, ${event.venue_city}`}
                  {event.venue_state && `, ${event.venue_state}`}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div>
                {event.event_date}
                {event.event_time && <div className="text-sm text-gray-600">{event.event_time}</div>}
              </div>
            </TableCell>
            <TableCell>
              {(event.price_min || event.price_max) && (
                <div>${event.price_min || 0} - ${event.price_max || 'N/A'}</div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={event.is_active ? "default" : "secondary"}>
                {event.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {!event.is_active && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onMakeActive(event.id)}
                    disabled={isActivating}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(event.id)} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
