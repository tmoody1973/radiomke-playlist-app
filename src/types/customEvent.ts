
export interface CustomEvent {
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
