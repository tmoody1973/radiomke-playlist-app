
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TicketmasterEvent, ITEMS_PER_PAGE } from './ticketmaster/types';
import { useTicketmasterMutations } from './ticketmaster/hooks/useTicketmasterMutations';
import { EventEditForm } from './ticketmaster/EventEditForm';
import { EventsTable } from './ticketmaster/EventsTable';
import { SearchAndPagination } from './ticketmaster/SearchAndPagination';

export const TicketmasterEventsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TicketmasterEvent>>({});

  const { updateEvent, deleteEvent, makeActiveEvent } = useTicketmasterMutations();

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

  const handleEdit = (event: TicketmasterEvent) => {
    setEditingId(event.id);
    setEditForm(event);
  };

  const handleUpdate = () => {
    if (editingId) {
      updateEvent.mutate({ id: editingId, ...editForm });
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cached event?')) {
      deleteEvent.mutate(id);
    }
  };

  const handleMakeActive = (id: string) => {
    makeActiveEvent.mutate(id);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelEdit = () => {
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
      </CardHeader>
      <CardContent>
        <SearchAndPagination
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          eventsCount={events.length}
        />

        {editingId && (
          <EventEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            onUpdate={handleUpdate}
            onCancel={handleCancelEdit}
            isUpdating={updateEvent.isPending}
          />
        )}

        <EventsTable
          events={events}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMakeActive={handleMakeActive}
          isDeleting={deleteEvent.isPending}
          isActivating={makeActiveEvent.isPending}
        />

        {events.length === 0 && (
          <p className="text-center text-gray-500 py-8">No Ticketmaster events found</p>
        )}
      </CardContent>
    </Card>
  );
};
