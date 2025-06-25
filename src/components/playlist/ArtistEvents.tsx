
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
  isCurrentlyPlaying?: boolean; // New prop to control when to fetch Ticketmaster events
}

export const ArtistEvents = ({ 
  artistName, 
  compact = false, 
  stationId, 
  isCurrentlyPlaying = false 
}: ArtistEventsProps) => {
  // Add debugging to ensure we're using the artist name
  console.log(`🎫 ArtistEvents component for: "${artistName}" with stationId: "${stationId}", isCurrentlyPlaying: ${isCurrentlyPlaying}`);
  
  // Only fetch Ticketmaster events if this is the currently playing song
  const { data: ticketmasterEvents, isLoading: ticketmasterLoading, error: ticketmasterError } = useTicketmasterEvents(
    artistName, 
    isCurrentlyPlaying // Only enabled for currently playing song
  );
  
  const { data: customEvents, isLoading: customLoading, error: customError } = useCustomEvents(artistName, stationId);

  const isLoading = (isCurrentlyPlaying ? ticketmasterLoading : false) || customLoading;
  const hasError = (isCurrentlyPlaying ? ticketmasterError : false) && customError;
  
  console.log(`🎫 Custom events data for ${artistName}:`, customEvents);
  if (isCurrentlyPlaying) {
    console.log(`🎫 Ticketmaster events data for ${artistName} (currently playing):`, ticketmasterEvents);
  } else {
    console.log(`🎫 Skipping Ticketmaster API call for ${artistName} (not currently playing)`);
  }
  
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
  
  // Add Ticketmaster events only if this is currently playing
  if (isCurrentlyPlaying && ticketmasterEvents) {
    console.log(`🎫 Adding ${ticketmasterEvents.length} Ticketmaster events for ${artistName} (currently playing)`);
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
    <Card className={`${compact ? 'text-xs' : 'text-sm'} border-slate-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <CardTitle className={`${compact ? 'text-sm' : 'text-base'} text-slate-800 flex items-center gap-2 font-semibold`}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>🎵 {artistName} Live Shows</span>
          {isCurrentlyPlaying && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Now Playing</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {allEvents.slice(0, 3).map((event, index) => {
          const venue = event._embedded?.venues?.[0];
          const priceRange = event.priceRanges?.[0];
          
          return (
            <div key={event.isCustom ? event.id : event.id} className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                event.isCustom 
                  ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-600' 
                  : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600'
              }`}></div>
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Event name with custom event indicator */}
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-slate-900 leading-tight ${compact ? 'text-sm' : 'text-base'} group-hover:text-slate-700 transition-colors`}>
                      {event.name}
                    </h4>
                    {event.isCustom && (
                      <Star className="h-4 w-4 text-purple-600 fill-purple-200" />
                    )}
                  </div>
                  
                  {/* Date and time */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                      {formatEventDate(event.date, event.time)}
                    </span>
                  </div>
                  
                  {/* Venue */}
                  {venue && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className={`${compact ? 'text-xs' : 'text-sm'} truncate`}>
                        <span className="font-medium">{venue.name}</span>
                        <span className="text-slate-500"> • {venue.city.name}, {venue.state.stateCode}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Price range */}
                  {priceRange && (
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`}>
                        ${priceRange.min} - ${priceRange.max}
                      </span>
                    </div>
                  )}
                  
                  {/* Custom event description */}
                  {event.isCustom && event.description && (
                    <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} italic`}>
                      {event.description}
                    </p>
                  )}
                </div>
                
                {/* Ticket button */}
                <Button
                  size={compact ? "sm" : "default"}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  onClick={() => event.url && event.url !== '#' ? window.open(event.url, '_blank') : null}
                  disabled={!event.url || event.url === '#'}
                >
                  <ExternalLink className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                  {compact ? 'Tix' : 'Get Tickets'}
                </Button>
              </div>
            </div>
          );
        })}
        
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
