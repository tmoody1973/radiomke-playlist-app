
import { useQuery } from '@tanstack/react-query';

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

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
}

export const useTicketmasterEvents = (artistName: string, enabled: boolean = true) => {
  const fetchEvents = async (): Promise<TicketmasterEvent[]> => {
    if (!artistName.trim()) return [];

    // Note: In production, the API key should be stored in Supabase secrets
    // For now, using a public demo key - replace with your actual key
    const API_KEY = 'YOUR_TICKETMASTER_API_KEY'; // This should come from Supabase secrets
    
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artistName)}&city=Chicago,Milwaukee&classificationName=music&apikey=${API_KEY}&size=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Ticketmaster events');
    }

    const data: TicketmasterResponse = await response.json();
    return data._embedded?.events || [];
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
