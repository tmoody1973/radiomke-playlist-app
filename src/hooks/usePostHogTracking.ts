
import { useCallback } from 'react';

interface TrackingProperties {
  [key: string]: any;
}

export const usePostHogTracking = () => {
  const trackEvent = useCallback((eventName: string, properties?: TrackingProperties) => {
    if (window.posthog) {
      window.posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      });
    }
  }, []);

  const trackSongPlay = useCallback((artist: string, song: string, stationId?: string) => {
    trackEvent('embed_song_played', {
      artist,
      song,
      station_id: stationId,
      interaction_type: 'play'
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('embed_search_performed', {
      search_query: query,
      results_count: resultsCount,
      interaction_type: 'search'
    });
  }, [trackEvent]);

  const trackLoadMore = useCallback((currentCount: number, totalCount: number) => {
    trackEvent('embed_load_more_clicked', {
      current_items: currentCount,
      total_items: totalCount,
      interaction_type: 'load_more'
    });
  }, [trackEvent]);

  const trackThemeChange = useCallback((newTheme: string) => {
    trackEvent('embed_theme_changed', {
      new_theme: newTheme,
      interaction_type: 'theme_change'
    });
  }, [trackEvent]);

  const trackLayoutChange = useCallback((newLayout: string) => {
    trackEvent('embed_layout_changed', {
      new_layout: newLayout,
      interaction_type: 'layout_change'
    });
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent('embed_error_occurred', {
      error_message: error,
      error_context: context,
      interaction_type: 'error'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackSongPlay,
    trackSearch,
    trackLoadMore,
    trackThemeChange,
    trackLayoutChange,
    trackError
  };
};
