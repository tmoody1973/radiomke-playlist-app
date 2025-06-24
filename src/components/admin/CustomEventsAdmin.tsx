
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomEventMutations } from '@/hooks/useCustomEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomEvent } from '@/types/customEvent';
import { CustomEventForm } from './CustomEventForm';
import { CustomEventsList } from './CustomEventsList';

export const CustomEventsAdmin = () => {
  const { toast } = useToast();
  const { createEvent, updateEvent, deleteEvent } = useCustomEventMutations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [artistSearchTerm, setArtistSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<CustomEvent>>({
    artist_name: '',
    event_title: '',
    venue_name: '',
    venue_city: '',
    venue_state: '',
    event_date: '',
    event_time: '',
    ticket_url: '',
    price_min: undefined,
    price_max: undefined,
    description: '',
    is_active: true,
    station_ids: []
  });

  // Fetch all custom events for admin view
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-custom-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as CustomEvent[];
    },
  });

  const resetForm = () => {
    setFormData({
      artist_name: '',
      event_title: '',
      venue_name: '',
      venue_city: '',
      venue_state: '',
      event_date: '',
      event_time: '',
      ticket_url: '',
      price_min: undefined,
      price_max: undefined,
      description: '',
      is_active: true,
      station_ids: []
    });
    setArtistSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.artist_name || !formData.event_title || !formData.event_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, ...formData });
        toast({
          title: "Success",
          description: "Event updated successfully"
        });
        setEditingId(null);
      } else {
        await createEvent.mutateAsync(formData as Omit<CustomEvent, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Success",
          description: "Event created successfully"
        });
        setIsCreating(false);
      }
      
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (event: CustomEvent) => {
    setFormData(event);
    setArtistSearchTerm(event.artist_name);
    setEditingId(event.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent.mutateAsync(id);
        toast({
          title: "Success",
          description: "Event deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  if (isLoading) {
    return <div className="p-4">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Custom Events Admin
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <CustomEventForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createEvent.isPending || updateEvent.isPending}
              editingId={editingId}
              artistSearchTerm={artistSearchTerm}
              setArtistSearchTerm={setArtistSearchTerm}
            />
          )}

          <CustomEventsList
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
