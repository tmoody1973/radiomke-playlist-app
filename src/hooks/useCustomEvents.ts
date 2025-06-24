
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomEvent {
  id: string;
  artist_name: string;
  event_title: string;
  venue_name?: string;
  venue_city?: string;
  venue_state?: string;
  event_date: string;
  event_time?: string;
  ticket_url?: string;
  price_min?: number;
  price_max?: number;
  description?: string;
  is_active: boolean;
  station_ids: string[];
  created_at: string;
  updated_at: string;
}

export const useCustomEvents = (artistName: string, stationId?: string) => {
  const fetchCustomEvents = async (): Promise<CustomEvent[]> => {
    if (!artistName.trim()) return [];

    console.log(`🎫 Fetching custom events for: "${artistName}" with stationId: "${stationId}"`);
    
    // First, let's check what events exist for this artist without filters
    const { data: allArtistEvents, error: debugError } = await supabase
      .from('custom_events')
      .select('*')
      .eq('artist_name', artistName);
    
    console.log(`🎫 All events for ${artistName} (no filters):`, allArtistEvents);
    
    if (debugError) {
      console.error('🎫 Debug query error:', debugError);
    }

    let query = supabase
      .from('custom_events')
      .select('*')
      .eq('artist_name', artistName)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
      .order('event_date', { ascending: true });

    console.log(`🎫 Today's date for filtering: ${new Date().toISOString().split('T')[0]}`);

    // If stationId is provided, filter by station
    if (stationId) {
      console.log(`🎫 Filtering by stationId: ${stationId}`);
      query = query.or(`station_ids.cs.{${stationId}},station_ids.eq.{}`);
    } else {
      console.log(`🎫 No stationId provided, showing all station events`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('🎫 Error fetching custom events:', error);
      throw new Error('Failed to fetch custom events');
    }

    console.log(`🎫 Filtered events for ${artistName}:`, data);
    console.log(`🎫 Number of events found: ${data?.length || 0}`);

    return data || [];
  };

  return useQuery({
    queryKey: ['custom-events', artistName, stationId],
    queryFn: fetchCustomEvents,
    enabled: !!artistName.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useCustomEventMutations = () => {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<CustomEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-events'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CustomEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-events'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-events'] });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
};
