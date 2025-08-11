import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTopSongs } from '@/hooks/useTopSongs';
import { useSpinData } from '@/hooks/useSpinData';

interface StationEventsTabProps {
  stationId: string;
}

type TicketmasterEvent = {
  id: string;
  artist_name: string;
  event_id: string;
  event_name: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string | null; // HH:mm:ss
  venue_name?: string | null;
  venue_city?: string | null;
  venue_state?: string | null;
  ticket_url?: string | null;
  event_data?: any;
  is_active: boolean;
};

type CustomEvent = {
  id: string;
  artist_name: string;
  event_title: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string | null;
  venue_name?: string | null;
  venue_city?: string | null;
  venue_state?: string | null;
  ticket_url?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  description?: string | null;
  is_active: boolean;
  station_ids: string[];
};

const formatDateTime = (dateStr: string, timeStr?: string | null) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    const datePart = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    let timePart = '';
    if (timeStr) {
      const [hh, mm] = timeStr.split(':').map(Number);
      const t = new Date();
      t.setHours(hh || 0, mm || 0, 0, 0);
      timePart = t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    return timePart ? `${datePart} • ${timePart}` : datePart;
  } catch {
    return dateStr;
  }
};

export const StationEventsTab: React.FC<StationEventsTabProps> = ({ stationId }) => {
  // Use recent spins and top songs to derive artists this station plays
  const { data: recentSpins, isLoading: loadingSpins } = useSpinData({
    stationId,
    maxItems: 100,
    debouncedSearchTerm: '',
    startDate: '',
    endDate: '',
    dateSearchEnabled: false,
    autoUpdate: false,
    hasActiveFilters: false,
  });

  const { data: top, isLoading: loadingTop } = useTopSongs({ stationId, days: 30, limit: 100 });

  const artists = React.useMemo(() => {
    const set = new Set<string>();
    (recentSpins || []).forEach((s: any) => s?.artist && set.add(String(s.artist).trim()));
    (top?.items || []).forEach((i: any) => i?.artist && set.add(String(i.artist).trim()));
    return Array.from(set);
  }, [recentSpins, top]);

  // Include common artist name variants (strip leading articles) to improve matches
  const queryArtists = React.useMemo(() => {
    const stripArticle = (name: string) => name.replace(/^(the|an|a)\s+/i, '').trim();
    const set = new Set<string>();
    artists.forEach((name) => {
      const n = String(name).trim();
      if (!n) return;
      set.add(n);
      const stripped = stripArticle(n);
      if (stripped && stripped !== n) set.add(stripped);
    });
    return Array.from(set);
  }, [artists]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['station-events', stationId, queryArtists.join('|')],
    enabled: queryArtists.length > 0,
    queryFn: async () => {
      const today = new Date();
      const to = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const fromStr = fmt(today);
      const toStr = fmt(to);

      // Fetch Ticketmaster cached events for these artists
      const { data: tm, error: tmErr } = await supabase
        .from('ticketmaster_events_cache')
        .select('*')
        .in('artist_name', queryArtists)
        .eq('is_active', true)
        .gte('event_date', fromStr)
        .lte('event_date', toStr)
        .order('event_date', { ascending: true });
      if (tmErr) throw tmErr;

      // Fetch Custom events
      const { data: ce, error: ceErr } = await supabase
        .from('custom_events')
        .select('*')
        .in('artist_name', queryArtists)
        .eq('is_active', true)
        .gte('event_date', fromStr)
        .lte('event_date', toStr)
        .order('event_date', { ascending: true });
      if (ceErr) throw ceErr;

      const filteredCustom = (ce as CustomEvent[] | null)?.filter((e) => !e.station_ids || e.station_ids.length === 0 || e.station_ids.includes(stationId)) || [];

      // Normalize to a common structure
      type Normalized = {
        key: string;
        source: 'Ticketmaster' | 'Custom';
        artist_name: string;
        title: string;
        date: string;
        time?: string | null;
        venue?: string | null;
        city?: string | null;
        state?: string | null;
        url?: string | null;
      };

      const tmNorm: Normalized[] = (tm as TicketmasterEvent[] | null)?.map((e) => ({
        key: `tm:${e.event_id}`,
        source: 'Ticketmaster',
        artist_name: e.artist_name,
        title: e.event_name,
        date: e.event_date,
        time: e.event_time ?? null,
        venue: e.venue_name ?? null,
        city: e.venue_city ?? null,
        state: e.venue_state ?? null,
        url: e.ticket_url ?? null,
      })) || [];

      const ceNorm: Normalized[] = filteredCustom.map((e) => ({
        key: `ce:${e.id}`,
        source: 'Custom',
        artist_name: e.artist_name,
        title: e.event_title,
        date: e.event_date,
        time: e.event_time ?? null,
        venue: e.venue_name ?? null,
        city: e.venue_city ?? null,
        state: e.venue_state ?? null,
        url: e.ticket_url ?? null,
      }));

      // Deduplicate by artist + date + venue to avoid overlap
      const seen = new Set<string>();
      const combined = [...ceNorm, ...tmNorm].filter((e) => {
        const k = `${e.artist_name}|${e.date}|${e.venue || ''}`.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      combined.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
      return combined;
    },
  });

  if (loadingSpins || loadingTop || isLoading) {
    return <div className="px-4 py-8 text-center text-muted-foreground">Loading events…</div>;
  }
  if (error) {
    return <div className="px-4 py-8 text-center text-destructive">Failed to load events.</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        No upcoming events in the next 60 days for artists this station plays.
      </div>
    );
  }

  return (
    <section aria-labelledby="station-events-heading" className="space-y-3">
      <h2 id="station-events-heading" className="text-lg font-semibold tracking-tight">
        Events from artists we play — next 60 days
      </h2>
      <div className="space-y-2">
        {data.map((e) => (
          <Card key={e.key} className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                {formatDateTime(e.date, e.time)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{e.title}</span>
                  {e.source === 'Custom' && (
                    <Badge variant="secondary">{e.source}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {e.artist_name}
                </div>
                {(e.venue || e.city || e.state) && (
                  <div className="text-sm text-muted-foreground">
                    {[e.venue, e.city, e.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
            {e.url && (
              <Button asChild size="sm" variant="default">
                <a href={e.url} target="_blank" rel="noopener noreferrer" aria-label={`Get tickets for ${e.title}`}>
                  Get Tickets
                </a>
              </Button>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default StationEventsTab;
