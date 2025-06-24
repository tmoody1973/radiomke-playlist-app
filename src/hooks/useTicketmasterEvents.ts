
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
    
    const { data, error } = await supabase.functions.invoke('ticketmaster-events', {
      body: { artistName }
    });

    if (error) {
      console.error('Error fetching Ticketmaster events:', error);
      throw new Error('Failed to fetch Ticketmaster events');
    }

    return data?.events || [];
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
