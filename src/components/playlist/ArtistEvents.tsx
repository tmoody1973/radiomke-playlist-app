import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, Loader2, Star } from 'lucide-react';
import { useTicketmasterEvents } from '@/hooks/useTicketmasterEvents';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { formatDate } from '@/utils/playlistHelpers';

interface ArtistEventsProps {
  artistName: string;
  compact?: boolean;
  stationId?: string;
}

export const ArtistEvents = ({ artistName, compact = false, stationId }: ArtistEventsProps) => {
  // Add debugging to ensure we're using the artist name
  console.log(`🎫 ArtistEvents component for: "${artistName}" with stationId: "${stationId}"`);
  
  const { data: ticketmasterEvents, isLoading: ticketmasterLoading, error: ticketmasterError } = useTicketmasterEvents(artistName);
  const { data: customEvents, isLoading: customLoading, error: customError } = useCustomEvents(artistName, stationId);

  const isLoading = customLoading;
  const hasError = customError;
  
  console.log(`🎫 Custom events data for ${artistName}:`, customEvents);
  console.log(`🎫 Ticketmaster events data for ${artistName}:`, ticketmasterEvents);
  
  // Combine and sort events by date
  const allEvents = [];
  
  // Add custom events with a flag
  if (customEvents) {
    console.log(`🎫 Adding ${customEvents.length} custom events for ${artistName}`);
    customEvents.forEach(event => {
      allEvents.push({
        ...event,
        isCustom: true,
        date: event.event_date,
        time: event.event_time,
        name: event.event_title,
        url: event.ticket_url || '#',
        _embedded: {
          venues: event.venue_name ? [{
            name: event.venue_name,
            city: { name: event.venue_city || '' },
            state: { stateCode: event.venue_state || '' }
          }] : []
        },
        priceRanges: (event.price_min || event.price_max) ? [{
          min: event.price_min || 0,
          max: event.price_max || 999
        }] : []
      });
    });
  }
  
  // Add Ticketmaster events
  if (ticketmasterEvents) {
    console.log(`🎫 Adding ${ticketmasterEvents.length} Ticketmaster events for ${artistName}`);
    ticketmasterEvents.forEach(event => {
      allEvents.push({
        ...event,
        isCustom: false,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime
      });
    });
  }
  
  // Sort by date
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`🎫 Total combined events for ${artistName}: ${allEvents.length}`);

  if (isLoading) {
    return (
      <Card className={`${compact ? 'text-xs' : 'text-sm'} border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-slate-700 font-medium">Finding upcoming shows for {artistName}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || !allEvents || allEvents.length === 0) {
    return null; // Don't show anything if no events or error
  }

  const formatEventDate = (dateString: string, timeString?: string) => {
    let date: Date;
    
    // Check if it's a date-only string (YYYY-MM-DD format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Parse as local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      // Use normal parsing for datetime strings
      date = new Date(dateString);
    }
    
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
    <Card className={`${compact ? 'text-xs' : 'text-sm'} border-slate-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className={`${compact ? 'text-sm' : 'text-base'} text-slate-800 flex items-center gap-2 font-semibold`}>
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <span className="truncate">🎵 {artistName} Live Shows</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 px-3 sm:px-6">
        {allEvents.slice(0, 3).map((event, index) => {
          const venue = event._embedded?.venues?.[0];
          const priceRange = event.priceRanges?.[0];
          
          return (
            <div key={event.isCustom ? event.id : event.id} className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                event.isCustom 
                  ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-600' 
                  : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600'
              }`}></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 space-y-2 w-full sm:w-auto">
                  {/* Event name with custom event indicator */}
                  <div className="flex items-start gap-2">
                    <h4 className={`font-semibold text-slate-900 leading-tight ${compact ? 'text-sm' : 'text-base'} group-hover:text-slate-700 transition-colors flex-1`}>
                      {event.name}
                    </h4>
                    {event.isCustom && (
                      <Star className="h-4 w-4 text-purple-600 fill-purple-200 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  
                  {/* Date and time */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium break-words`}>
                      {formatEventDate(event.date, event.time)}
                    </span>
                  </div>
                  
                  {/* Venue */}
                  {venue && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className={`${compact ? 'text-xs' : 'text-sm'} break-words`}>
                        <span className="font-medium">{venue.name}</span>
                        <span className="text-slate-500 block sm:inline"> 
                          <span className="hidden sm:inline"> • </span>
                          {venue.city.name}, {venue.state.stateCode}
                        </span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* Price range */}
                    {priceRange && (
                      <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full w-fit">
                        <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold whitespace-nowrap`}>
                          ${priceRange.min} - ${priceRange.max}
                        </span>
                      </div>
                    )}
                    
                    {/* Ticket button - mobile optimized */}
                    <div className="sm:hidden w-full">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                        onClick={() => event.url && event.url !== '#' ? window.open(event.url, '_blank') : null}
                        disabled={!event.url || event.url === '#'}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Tickets
                      </Button>
                    </div>
                  </div>
                  
                  {/* Custom event description */}
                  {event.isCustom && event.description && (
                    <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} italic break-words`}>
                      {event.description}
                    </p>
                  )}
                </div>
                
                {/* Ticket button - desktop */}
                <div className="hidden sm:block flex-shrink-0">
                  <Button
                    size={compact ? "sm" : "default"}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold whitespace-nowrap"
                    onClick={() => event.url && event.url !== '#' ? window.open(event.url, '_blank') : null}
                    disabled={!event.url || event.url === '#'}
                  >
                    <ExternalLink className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    {compact ? 'Tix' : 'Get Tickets'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Ticketmaster loading indicator */}
        {ticketmasterLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            <span>Checking Ticketmaster for more shows...</span>
          </div>
        )}
        
        {/* Show more indicator */}
        {allEvents.length > 3 && (
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              + {allEvents.length - 3} more shows available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
