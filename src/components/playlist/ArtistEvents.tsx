
import React from 'react';
import { useTicketmasterEvents } from '@/hooks/useTicketmasterEvents';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react';

interface ArtistEventsProps {
  artistName: string;
  compact?: boolean;
  stationId?: string;
  tracking?: any;
}

export const ArtistEvents = ({ artistName, compact = false, stationId, tracking }: ArtistEventsProps) => {
  const { data: events = [], isLoading, error } = useTicketmasterEvents(artistName);

  React.useEffect(() => {
    if (events.length > 0 && tracking) {
      tracking.trackArtistEvents(artistName, events.length);
    }
  }, [events.length, artistName, tracking]);

  if (isLoading) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground animate-pulse`}>
        Loading events...
      </div>
    );
  }

  if (error || events.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? 'mt-1' : 'mt-2'} space-y-1`}>
      <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
        Upcoming Events:
      </div>
      {events.slice(0, compact ? 2 : 3).map((event) => (
        <div
          key={event.id}
          className={`${compact ? 'p-2 text-xs' : 'p-3 text-sm'} bg-secondary/50 rounded-md`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {event.name}
              </div>
              {event._embedded?.venues?.[0] && (
                <div className={`flex items-center gap-1 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event._embedded.venues[0].name}</span>
                </div>
              )}
              <div className={`flex items-center gap-1 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(event.dates.start.localDate).toLocaleDateString()}</span>
              </div>
              {event.priceRanges?.[0] && (
                <div className={`flex items-center gap-1 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                  <DollarSign className="w-3 h-3" />
                  <span>${event.priceRanges[0].min} - ${event.priceRanges[0].max}</span>
                </div>
              )}
            </div>
            {event.url && (
              <Button
                size={compact ? "sm" : "default"}
                variant="outline"
                asChild
                className={compact ? "h-6 px-2 text-xs" : ""}
              >
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {!compact && "Tickets"}
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
