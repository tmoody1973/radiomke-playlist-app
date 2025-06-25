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
  isCurrentlyPlaying?: boolean;
}

export const ArtistEvents = ({ 
  artistName, 
  compact = false, 
  stationId, 
  isCurrentlyPlaying = false 
}: ArtistEventsProps) => {
  console.log(`🎫 ArtistEvents component for: "${artistName}" with stationId: "${stationId}", isCurrentlyPlaying: ${isCurrentlyPlaying}`);
  console.log(`🎫 Exact artist name being searched: "${artistName}" (length: ${artistName.length})`);
  
  // Only fetch Ticketmaster events if this is the currently playing song
  const { data: ticketmasterEvents, isLoading: ticketmasterLoading, error: ticketmasterError } = useTicketmasterEvents(
    artistName, 
    isCurrentlyPlaying
  );
  
  const { data: customEvents, isLoading: customLoading, error: customError } = useCustomEvents(artistName, stationId);

  const isLoading = (isCurrentlyPlaying ? ticketmasterLoading : false) || customLoading;
  const hasError = (isCurrentlyPlaying ? ticketmasterError : false) && customError;
  
  console.log(`🎫 Custom events data for "${artistName}":`, customEvents);
  console.log(`🎫 Custom events loading state:`, customLoading);
  console.log(`🎫 Custom events error:`, customError);
  
  if (isCurrentlyPlaying) {
    console.log(`🎫 Ticketmaster events data for ${artistName} (currently playing):`, ticketmasterEvents);
  } else {
    console.log(`🎫 Skipping Ticketmaster API call for ${artistName} (not currently playing)`);
  }
  
  // Combine and sort events by date
  const allEvents = [];
  
  // Add custom events with a flag
  if (customEvents) {
    console.log(`🎫 Processing ${customEvents.length} custom events for "${artistName}"`);
    customEvents.forEach((event, index) => {
      console.log(`🎫 Custom event ${index + 1}:`, {
        id: event.id,
        artist_name: event.artist_name,
        event_title: event.event_title,
        event_date: event.event_date,
        is_active: event.is_active,
        station_ids: event.station_ids
      });
      
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
  } else {
    console.log(`🎫 No custom events data received for "${artistName}"`);
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

  console.log(`🎫 Final combined events for "${artistName}": ${allEvents.length} total events`);
  console.log(`🎫 All events details:`, allEvents);

  if (isLoading) {
    return (
      <Card className={`${compact ? 'text-xs' : 'text-sm'} border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg`}>
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
    console.log(`🎫 Not showing events card for "${artistName}" - hasError: ${hasError}, allEvents length: ${allEvents?.length || 0}`);
    return null;
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
    <Card className={`${compact ? 'text-xs' : 'text-sm'} border-l-4 border-l-purple-500 border-slate-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-t-lg">
        <CardTitle className={`${compact ? 'text-sm' : 'text-base'} text-slate-800 flex items-center gap-2 font-bold`}>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <span>🎵 {artistName} Live Shows</span>
          {isCurrentlyPlaying && (
            <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
              Now Playing
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {allEvents.slice(0, 3).map((event, index) => {
          const venue = event._embedded?.venues?.[0];
          const priceRange = event.priceRanges?.[0];
          
          return (
            <div key={event.isCustom ? event.id : event.id} className="group relative bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-slate-200/60 hover:border-purple-300 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform">
              {/* Enhanced gradient accent bar */}
              <div className={`absolute top-0 left-0 w-full h-2 rounded-t-xl ${
                event.isCustom 
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' 
                  : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500'
              } shadow-sm`}></div>
              
              <div className="flex justify-between items-start gap-4 mt-1">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Event name with enhanced custom event indicator */}
                  <div className="flex items-center gap-3">
                    <h4 className={`font-bold text-slate-900 leading-tight ${compact ? 'text-sm' : 'text-base'} group-hover:text-purple-800 transition-colors`}>
                      {event.name}
                    </h4>
                    {event.isCustom && (
                      <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                        <Star className="h-3 w-3 fill-purple-500" />
                        <span>Exclusive</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Date and time with enhanced styling */}
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`}>
                      {formatEventDate(event.date, event.time)}
                    </span>
                  </div>
                  
                  {/* Venue with enhanced styling */}
                  {venue && (
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                      <MapPin className="h-4 w-4 text-pink-600" />
                      <span className={`${compact ? 'text-xs' : 'text-sm'} truncate`}>
                        <span className="font-semibold">{venue.name}</span>
                        <span className="text-slate-500 font-medium"> • {venue.city.name}, {venue.state.stateCode}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Price range with enhanced styling */}
                  {priceRange && (
                    <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg border border-green-200">
                      <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold`}>
                        ${priceRange.min} - ${priceRange.max}
                      </span>
                    </div>
                  )}
                  
                  {/* Custom event description */}
                  {event.isCustom && event.description && (
                    <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} italic bg-purple-50 p-2 rounded-lg border-l-2 border-purple-300`}>
                      {event.description}
                    </p>
                  )}
                </div>
                
                {/* Enhanced ticket button */}
                <Button
                  size={compact ? "sm" : "default"}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-bold transform hover:scale-105"
                  onClick={() => event.url && event.url !== '#' ? window.open(event.url, '_blank') : null}
                  disabled={!event.url || event.url === '#'}
                >
                  <ExternalLink className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                  {compact ? 'Tickets' : 'Get Tickets'}
                </Button>
              </div>
            </div>
          );
        })}
        
        {/* Enhanced show more indicator */}
        {allEvents.length > 3 && (
          <div className="text-center pt-3">
            <span className="text-xs text-slate-600 bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-full font-semibold border border-slate-300">
              + {allEvents.length - 3} more shows available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
