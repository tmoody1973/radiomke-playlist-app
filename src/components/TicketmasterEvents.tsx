
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useTicketmasterEvents, TicketmasterEvent } from '@/hooks/useTicketmasterEvents';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketmasterEventsProps {
  artistName: string;
  compact?: boolean;
}

const formatEventDate = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatEventTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getMarketName = (venue: TicketmasterEvent['_embedded']['venues'][0]) => {
  const city = venue.city.name;
  const state = venue.state.stateCode;
  
  if (state === 'WI' && city === 'Milwaukee') return 'Milwaukee';
  if (state === 'IL' && (city === 'Chicago' || city.includes('Chicago'))) return 'Chicago';
  if (state === 'MN' && (city === 'Minneapolis' || city === 'Saint Paul')) return 'Minneapolis';
  
  return `${city}, ${state}`;
};

const EventCard: React.FC<{ event: TicketmasterEvent; compact?: boolean }> = ({ event, compact }) => {
  const venue = event._embedded?.venues?.[0];
  const eventImage = event.images?.find(img => img.ratio === '16_9' || img.ratio === '4_3')?.url;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      {eventImage && !compact && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={eventImage} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={`${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
            {event.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {venue ? getMarketName(venue) : 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatEventDate(event.dates.start.dateTime)}</span>
          {event.dates.start.localTime && (
            <span>• {formatEventTime(event.dates.start.dateTime)}</span>
          )}
        </div>
        
        {venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{venue.name}</span>
          </div>
        )}
        
        <Button 
          size="sm" 
          className="w-full" 
          onClick={() => window.open(event.url, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          Get Tickets
        </Button>
      </CardContent>
    </Card>
  );
};

const TicketmasterEvents: React.FC<TicketmasterEventsProps> = ({ artistName, compact = false }) => {
  const { data: events = [], isLoading, error } = useTicketmasterEvents(artistName);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4" />
          <span className="font-medium text-sm">Upcoming Shows</span>
        </div>
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-2/3 mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 inline mr-2" />
        Unable to load event information
      </div>
    );
  }

  if (events.length === 0) {
    return null; // Don't show anything if no events
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-orange-600" />
        <span className="font-medium text-sm">Upcoming Shows ({events.length})</span>
      </div>
      
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {events.slice(0, compact ? 2 : 4).map((event) => (
          <EventCard key={event.id} event={event} compact={compact} />
        ))}
      </div>
      
      {events.length > (compact ? 2 : 4) && (
        <div className="text-center pt-2">
          <Badge variant="outline" className="text-xs">
            +{events.length - (compact ? 2 : 4)} more events
          </Badge>
        </div>
      )}
    </div>
  );
};

export default TicketmasterEvents;
