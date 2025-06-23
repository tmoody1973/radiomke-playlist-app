
import { useQuery } from '@tanstack/react-query';

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales: {
    public: {
      startDateTime: string;
      endDateTime: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime: string;
      dateTime: string;
    };
  };
  _embedded: {
    venues: Array<{
      name: string;
      type: string;
      id: string;
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
    }>;
    attractions: Array<{
      name: string;
      type: string;
      id: string;
    }>;
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export const useTicketmasterEvents = (artistName: string) => {
  return useQuery({
    queryKey: ['ticketmaster-events', artistName],
    queryFn: async (): Promise<TicketmasterEvent[]> => {
      if (!artistName || artistName.trim().length < 2) {
        return [];
      }

      console.log('Searching Ticketmaster for artist:', artistName);

      try {
        // Use Supabase Edge Function to call Ticketmaster API
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase.functions.invoke('ticketmaster-search', {
          body: {
            artistName: artistName.trim(),
            markets: ['30', '3', '16'] // Milwaukee, Chicago, Minneapolis
          }
        });

        if (error) {
          console.error('Error calling Ticketmaster function:', error);
          return [];
        }

        console.log(`Found ${data?.events?.length || 0} events for ${artistName}`);
        return data?.events || [];
      } catch (error) {
        console.error('Error fetching Ticketmaster events:', error);
        return [];
      }
    },
    enabled: Boolean(artistName && artistName.trim().length >= 2),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
