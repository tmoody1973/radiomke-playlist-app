
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { CustomEvent } from '@/types/customEvent';

interface CustomEventsListProps {
  events: CustomEvent[] | undefined;
  onEdit: (event: CustomEvent) => void;
  onDelete: (id: string) => void;
}

export const CustomEventsList = ({ events, onEdit, onDelete }: CustomEventsListProps) => {
  return (
    <div className="space-y-4">
      {events?.map((event) => (
        <div key={event.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{event.event_title}</h3>
                <Badge variant={event.is_active ? "default" : "secondary"}>
                  {event.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Artist:</strong> {event.artist_name}
              </p>
              {event.venue_name && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Venue:</strong> {event.venue_name}
                  {event.venue_city && `, ${event.venue_city}`}
                  {event.venue_state && `, ${event.venue_state}`}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                <strong>Date:</strong> {event.event_date}
                {event.event_time && ` at ${event.event_time}`}
              </p>
              {(event.price_min || event.price_max) && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Price:</strong> ${event.price_min || 0} - ${event.price_max || 'N/A'}
                </p>
              )}
              {event.description && (
                <p className="text-sm text-gray-600 mt-2">{event.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(event.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      {events?.length === 0 && (
        <p className="text-center text-gray-500 py-8">No custom events found</p>
      )}
    </div>
  );
};
