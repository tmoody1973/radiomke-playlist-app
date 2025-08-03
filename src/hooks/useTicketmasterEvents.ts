
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

export const useTicketmasterEvents = (artistName: string | null, enabled: boolean = true) => {
  const fetchEvents = async (): Promise<TicketmasterEvent[]> => {
    if (!artistName?.trim()) return [];

    console.log(`🎫 Checking for existing Ticketmaster events for: ${artistName}`);
    
    // First, check if we have cached events for this artist
    const { data: cachedEvents, error: cacheError } = await supabase
      .from('ticketmaster_events_cache')
      .select('*')
      .eq('artist_name', artistName)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (cacheError) {
      console.error('Cache lookup error:', cacheError);
      return [];
    }

    // If we have cached events, check if they're recent (less than 24 hours old)
    if (cachedEvents && cachedEvents.length > 0) {
      const mostRecentCache = cachedEvents.reduce((latest, event) => 
        new Date(event.updated_at) > new Date(latest.updated_at) ? event : latest
      );
      
      const cacheAge = Date.now() - new Date(mostRecentCache.updated_at).getTime();
      const isRecentCache = cacheAge < (24 * 60 * 60 * 1000); // 24 hours

      if (isRecentCache) {
        console.log(`🎫 Using cached events for ${artistName} (cached ${Math.floor(cacheAge / (60 * 60 * 1000))} hours ago)`);
        
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
      }
    }

    // Only make API call if we don't have recent cached data
    console.log(`🎫 No recent cache found for ${artistName}, making API call`);
    
    try {
      const { data, error } = await supabase.functions.invoke('ticketmaster-events', {
        body: { artistName }
      });

      if (error) {
        console.error('Error from ticketmaster-events function:', error);
        // Return any cached events we have, even if they're older
        return cachedEvents ? cachedEvents.map(event => ({
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
        })) : [];
      }

      return data?.events || [];
    } catch (error) {
      console.error('Error calling ticketmaster-events function:', error);
      // Return any cached events we have
      return cachedEvents ? cachedEvents.map(event => ({
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
      })) : [];
    }
  };

  return useQuery({
    queryKey: ['ticketmaster-events', artistName],
    queryFn: fetchEvents,
    enabled: enabled && !!artistName?.trim(),
    staleTime: 1000 * 60 * 60 * 24 * 7, // Increased from 24h to 7 days
    gcTime: 1000 * 60 * 60 * 24 * 14, // Increased from 7 to 14 days
    retry: 1
  });
};
