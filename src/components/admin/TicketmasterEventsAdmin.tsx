
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TicketmasterEvent } from '@/types/ticketmasterEvent';
import { TicketmasterEventEditForm } from './TicketmasterEventEditForm';
import { TicketmasterEventsTable } from './TicketmasterEventsTable';
import { TicketmasterEventsPagination } from './TicketmasterEventsPagination';
import { TicketmasterEventsSearchHeader } from './TicketmasterEventsSearchHeader';

const ITEMS_PER_PAGE = 10;

export const TicketmasterEventsAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TicketmasterEvent>>({});

  // Fetch all Ticketmaster cached events with count
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-ticketmaster-events', searchTerm, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('ticketmaster_events_cache')
        .select('*', { count: 'exact' })
        .order('event_date', { ascending: true });

      // Apply search filter if present
      if (searchTerm) {
        query = query.or(`artist_name.ilike.%${searchTerm}%,event_name.ilike.%${searchTerm}%,venue_name.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { events: data as TicketmasterEvent[], totalCount: count || 0 };
    },
  });

  const events = eventsData?.events || [];
  const totalCount = eventsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Update event mutation
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
      setEditingId(null);
      setEditForm({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    },
  });

  // Delete event mutation
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

  const handleEdit = (event: TicketmasterEvent) => {
    setEditingId(event.id);
    setEditForm(event);
  };

  const handleUpdate = () => {
    if (editingId) {
      updateEvent.mutate({ id: editingId, ...editForm });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cached event?')) {
      deleteEvent.mutate(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return <div className="p-4">Loading Ticketmaster events...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticketmaster Events Cache</CardTitle>
        <TicketmasterEventsSearchHeader
          searchTerm={searchTerm}
          onSearch={handleSearch}
          totalCount={totalCount}
        />
      </CardHeader>
      <CardContent>
        {editingId && (
          <TicketmasterEventEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            isUpdating={updateEvent.isPending}
          />
        )}

        <TicketmasterEventsTable
          events={events}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TicketmasterEventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          eventsCount={events.length}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
};
