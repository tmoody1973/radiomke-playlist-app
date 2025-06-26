import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Search, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface TicketmasterEvent {
  id: string;
  artist_name: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_time?: string;
  venue_name?: string;
  venue_city?: string;
  venue_state?: string;
  ticket_url?: string;
  price_min?: number;
  price_max?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

  // Make event active mutation
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

  const handleMakeActive = (id: string) => {
    makeActiveEvent.mutate(id);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="p-4">Loading Ticketmaster events...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticketmaster Events Cache</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {totalCount} events
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editingId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-event-name">Event Name</Label>
                  <Input
                    id="edit-event-name"
                    value={editForm.event_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, event_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-venue-name">Venue Name</Label>
                  <Input
                    id="edit-venue-name"
                    value={editForm.venue_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-venue-city">City</Label>
                  <Input
                    id="edit-venue-city"
                    value={editForm.venue_city || ''}
                    onChange={(e) => setEditForm({ ...editForm, venue_city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-venue-state">State</Label>
                  <Input
                    id="edit-venue-state"
                    value={editForm.venue_state || ''}
                    onChange={(e) => setEditForm({ ...editForm, venue_state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-event-date">Date</Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={editForm.event_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-event-time">Time</Label>
                  <Input
                    id="edit-event-time"
                    type="time"
                    value={editForm.event_time || ''}
                    onChange={(e) => setEditForm({ ...editForm, event_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ticket-url">Ticket URL</Label>
                  <Input
                    id="edit-ticket-url"
                    value={editForm.ticket_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, ticket_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price-min">Min Price</Label>
                  <Input
                    id="edit-price-min"
                    type="number"
                    value={editForm.price_min || ''}
                    onChange={(e) => setEditForm({ ...editForm, price_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price-max">Max Price</Label>
                  <Input
                    id="edit-price-max"
                    type="number"
                    value={editForm.price_max || ''}
                    onChange={(e) => setEditForm({ ...editForm, price_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdate} disabled={updateEvent.isPending}>
                  Update Event
                </Button>
                <Button variant="outline" onClick={() => { setEditingId(null); setEditForm({}); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.artist_name}</TableCell>
                <TableCell>{event.event_name}</TableCell>
                <TableCell>
                  {event.venue_name && (
                    <div>
                      {event.venue_name}
                      {event.venue_city && `, ${event.venue_city}`}
                      {event.venue_state && `, ${event.venue_state}`}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    {event.event_date}
                    {event.event_time && <div className="text-sm text-gray-600">{event.event_time}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {(event.price_min || event.price_max) && (
                    <div>${event.price_min || 0} - ${event.price_max || 'N/A'}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={event.is_active ? "default" : "secondary"}>
                    {event.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!event.is_active && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleMakeActive(event.id)}
                        disabled={makeActiveEvent.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {events.length === 0 && (
          <p className="text-center text-gray-500 py-8">No Ticketmaster events found</p>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {Math.min(ITEMS_PER_PAGE, events.length)} of {totalCount} events 
          (Page {currentPage} of {totalPages})
        </div>
      </CardContent>
    </Card>
  );
};
