
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomEventMutations } from '@/hooks/useCustomEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export const CustomEventsAdmin = () => {
  const { toast } = useToast();
  const { createEvent, updateEvent, deleteEvent } = useCustomEventMutations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // Fetch unique artist names from the songs table
  const { data: artistNames, isLoading: artistsLoading } = useQuery({
    queryKey: ['artist-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('artist')
        .order('artist', { ascending: true });

      if (error) throw error;
      
      // Get unique artist names
      const uniqueArtists = [...new Set(data.map(item => item.artist))].filter(Boolean).sort();
      return uniqueArtists;
    },
  });

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
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist_name">Artist Name *</Label>
                  <Select
                    value={formData.artist_name}
                    onValueChange={(value) => setFormData({ ...formData, artist_name: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={artistsLoading ? "Loading artists..." : "Select an artist"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto bg-white border border-gray-300 shadow-lg z-50">
                      {artistNames?.map((artist) => (
                        <SelectItem 
                          key={artist} 
                          value={artist}
                          className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                        >
                          {artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="event_title">Event Title *</Label>
                  <Input
                    id="event_title"
                    value={formData.event_title}
                    onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="venue_city">City</Label>
                  <Input
                    id="venue_city"
                    value={formData.venue_city}
                    onChange={(e) => setFormData({ ...formData, venue_city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="venue_state">State</Label>
                  <Input
                    id="venue_state"
                    value={formData.venue_state}
                    onChange={(e) => setFormData({ ...formData, venue_state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event_time">Event Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ticket_url">Ticket URL</Label>
                  <Input
                    id="ticket_url"
                    type="url"
                    value={formData.ticket_url}
                    onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price_min">Min Price ($)</Label>
                  <Input
                    id="price_min"
                    type="number"
                    step="0.01"
                    value={formData.price_min || ''}
                    onChange={(e) => setFormData({ ...formData, price_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="price_max">Max Price ($)</Label>
                  <Input
                    id="price_max"
                    type="number"
                    step="0.01"
                    value={formData.price_max || ''}
                    onChange={(e) => setFormData({ ...formData, price_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'} Event
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.event_title}</h3>
                      <Badge variant={event.is_active ? "default" : "secondary"}>
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Artist:</strong> {event.artist_name}
                    </p>
                    {event.venue_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Venue:</strong> {event.venue_name}
                        {event.venue_city && `, ${event.venue_city}`}
                        {event.venue_state && `, ${event.venue_state}`}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Date:</strong> {event.event_date}
                      {event.event_time && ` at ${event.event_time}`}
                    </p>
                    {(event.price_min || event.price_max) && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Price:</strong> ${event.price_min || 0} - ${event.price_max || 'N/A'}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {events?.length === 0 && (
              <p className="text-center text-gray-500 py-8">No custom events found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
