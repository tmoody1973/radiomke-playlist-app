
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { useTicketmasterEvents } from '@/hooks/useTicketmasterEvents';
import { formatDate } from '@/utils/playlistHelpers';

interface ArtistEventsProps {
  artistName: string;
  compact?: boolean;
}

export const ArtistEvents = ({ artistName, compact = false }: ArtistEventsProps) => {
  const { data: events, isLoading, error } = useTicketmasterEvents(artistName);

  if (isLoading) {
    return (
      <Card className={`${compact ? 'text-xs' : 'text-sm'} border-blue-200 bg-blue-50/50`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-blue-700">Checking for upcoming shows...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !events || events.length === 0) {
    return null; // Don't show anything if no events or error
  }

  const formatEventDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    return formattedDate;
  };

  return (
    <Card className={`${compact ? 'text-xs' : 'text-sm'} border-green-200 bg-green-50/50 mt-2`}>
      <CardHeader className="pb-2">
        <CardTitle className={`${compact ? 'text-sm' : 'text-base'} text-green-800 flex items-center gap-2`}>
          <Calendar className="h-4 w-4" />
          🎵 {artistName} - Upcoming Shows
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {events.slice(0, 3).map((event) => {
            const venue = event._embedded?.venues?.[0];
            const priceRange = event.priceRanges?.[0];
            
            return (
              <div key={event.id} className="bg-white rounded-lg p-2 border border-green-200">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                      {event.name}
                    </h4>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        {formatEventDate(event.dates.start.localDate, event.dates.start.localTime)}
                      </span>
                    </div>
                    {venue && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs truncate">
                          {venue.name}, {venue.city.name}, {venue.state.stateCode}
                        </span>
                      </div>
                    )}
                    {priceRange && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        From ${priceRange.min} - ${priceRange.max}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-green-600 text-white border-green-600 hover:bg-green-700"
                    onClick={() => window.open(event.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Tickets
                  </Button>
                </div>
              </div>
            );
          })}
          {events.length > 3 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              + {events.length - 3} more shows
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
