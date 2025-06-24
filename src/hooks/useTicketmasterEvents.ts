
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
    }>;
  };
  url: string;
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
}

export const useTicketmasterEvents = (artistName: string, enabled: boolean = true) => {
  const fetchEvents = async (): Promise<TicketmasterEvent[]> => {
    if (!artistName.trim()) return [];

    console.log(`🎫 Fetching Ticketmaster events for: ${artistName}`);
    
    try {
      // First try the edge function (which will check cache and API)
      const { data, error } = await supabase.functions.invoke('ticketmaster-events', {
        body: { artistName }
      });

      if (error) {
        console.error('Error from ticketmaster-events function:', error);
        // Fallback: try to get cached events directly from database
        console.log(`🎫 Falling back to direct cache lookup for: ${artistName}`);
        return await fetchCachedEventsDirectly(artistName);
      }

      return data?.events || [];
    } catch (error) {
      console.error('Error calling ticketmaster-events function:', error);
      // Fallback: try to get cached events directly from database
      console.log(`🎫 Falling back to direct cache lookup for: ${artistName}`);
      return await fetchCachedEventsDirectly(artistName);
    }
  };

  const fetchCachedEventsDirectly = async (artistName: string): Promise<TicketmasterEvent[]> => {
    try {
      const { data: cachedEvents, error } = await supabase
        .from('ticketmaster_events_cache')
        .select('*')
        .eq('artist_name', artistName)
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching cached events:', error);
        return [];
      }

      if (!cachedEvents || cachedEvents.length === 0) {
        return [];
      }

      console.log(`🎫 Found ${cachedEvents.length} cached events for ${artistName}`);

      // Convert cached events to Ticketmaster format
      return cachedEvents.map(event => ({
        id: event.event_id,
        name: event.event_name,
        dates: {
          start: {
            localDate: event.event_date,
            localTime: event.event_time
          }
        },
        _embedded: {
          venues: event.venue_name ? [{
            name: event.venue_name,
            city: { name: event.venue_city || '' },
            state: { name: event.venue_state || '', stateCode: event.venue_state || '' }
          }] : []
        },
        url: event.ticket_url || '',
        priceRanges: (event.price_min || event.price_max) ? [{
          min: event.price_min || 0,
          max: event.price_max || 999,
          currency: 'USD'
        }] : []
      }));
    } catch (error) {
      console.error('Error in direct cache lookup:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['ticketmaster-events', artistName],
    queryFn: fetchEvents,
    enabled: enabled && !!artistName.trim(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1
  });
};
