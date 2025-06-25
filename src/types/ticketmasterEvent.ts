
export interface TicketmasterEvent {
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
