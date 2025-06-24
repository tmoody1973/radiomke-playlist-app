
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';
import { ArtistSearch } from './ArtistSearch';
import { CustomEvent } from '@/types/customEvent';

interface CustomEventFormProps {
  formData: Partial<CustomEvent>;
  setFormData: (data: Partial<CustomEvent>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  editingId: string | null;
  artistSearchTerm: string;
  setArtistSearchTerm: (term: string) => void;
}

export const CustomEventForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
  editingId,
  artistSearchTerm,
  setArtistSearchTerm
}: CustomEventFormProps) => {
  const handleArtistChange = (value: string) => {
    setArtistSearchTerm(value);
    setFormData({ ...formData, artist_name: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ArtistSearch
          value={artistSearchTerm}
          onChange={handleArtistChange}
          required
        />
        
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
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {editingId ? 'Update' : 'Create'} Event
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};
