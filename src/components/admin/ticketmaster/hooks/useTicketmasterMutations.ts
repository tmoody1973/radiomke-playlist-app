
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TicketmasterEvent } from '../types';

export const useTicketmasterMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<TicketmasterEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('ticketmaster_events_cache')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticketmaster-events'] });
      toast({
        title: "Success",
        description: "Event updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ticketmaster_events_cache')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticketmaster-events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    },
  });

  const makeActiveEvent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ticketmaster_events_cache')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticketmaster-events'] });
      toast({
        title: "Success",
        description: "Event activated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate event",
        variant: "destructive"
      });
    },
  });

  return {
    updateEvent,
    deleteEvent,
    makeActiveEvent
  };
};
