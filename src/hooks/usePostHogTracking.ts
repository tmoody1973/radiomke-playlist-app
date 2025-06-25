
import { useCallback } from 'react';
import posthog from 'posthog-js';

interface TrackingContext {
  stationId: string;
  theme: string;
  layout: string;
  compact: boolean;
}

export const usePostHogTracking = (context: TrackingContext) => {
  const trackSongPlay = useCallback((artist: string, song: string, trackId: string) => {
    posthog.capture('song_played', {
      artist,
      song,
      track_id: trackId,
      ...context,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    posthog.capture('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount,
      ...context,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  const trackLoadMore = useCallback((currentCount: number, newCount: number) => {
    posthog.capture('load_more_clicked', {
      current_count: currentCount,
      new_count: newCount,
      ...context,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  const trackThemeChange = useCallback((newTheme: string) => {
    posthog.capture('theme_changed', {
      old_theme: context.theme,
      new_theme: newTheme,
      station_id: context.stationId,
      layout: context.layout,
      compact: context.compact,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  const trackArtistEvents = useCallback((artistName: string, eventCount: number) => {
    posthog.capture('artist_events_viewed', {
      artist_name: artistName,
      event_count: eventCount,
      ...context,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  const trackError = useCallback((error: string, context_info?: any) => {
    posthog.capture('embed_error', {
      error_message: error,
      context_info,
      ...context,
      timestamp: new Date().toISOString()
    });
  }, [context]);

  return {
    trackSongPlay,
    trackSearch,
    trackLoadMore,
    trackThemeChange,
    trackArtistEvents,
    trackError
  };
};
