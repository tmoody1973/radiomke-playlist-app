
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TicketmasterEvent } from './types';

interface EventEditFormProps {
  editForm: Partial<TicketmasterEvent>;
  setEditForm: (form: Partial<TicketmasterEvent>) => void;
  onUpdate: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const EventEditForm: React.FC<EventEditFormProps> = ({
  editForm,
  setEditForm,
  onUpdate,
  onCancel,
  isUpdating
}) => {
  return (
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
          <Button onClick={onUpdate} disabled={isUpdating}>
            Update Event
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
