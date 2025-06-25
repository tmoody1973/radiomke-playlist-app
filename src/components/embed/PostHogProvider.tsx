
import { useEffect } from 'react';
import posthog from 'posthog-js';

interface PostHogProviderProps {
  children: React.ReactNode;
  theme: string;
  stationId: string;
  layout: string;
  compact: boolean;
}

export const PostHogProvider = ({ 
  children, 
  theme, 
  stationId, 
  layout, 
  compact 
}: PostHogProviderProps) => {
  useEffect(() => {
    // Initialize PostHog - you'll need to replace with your actual API key
    posthog.init('phc_YOUR_API_KEY_HERE', {
      api_host: 'https://us.i.posthog.com', // or your self-hosted instance
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll manually track embed loads
      disable_session_recording: false,
      loaded: (posthog) => {
        // Track embed initialization
        posthog.capture('embed_loaded', {
          station_id: stationId,
          theme: theme,
          layout: layout,
          compact: compact,
          embed_url: window.location.href,
          parent_url: document.referrer || 'direct'
        });
      }
    });

    // Apply theme-specific styling to PostHog elements
    const applyPostHogStyling = () => {
      const style = document.createElement('style');
      style.id = 'posthog-embed-styling';
      style.textContent = `
        /* PostHog survey styling to match embed theme */
        .PostHogSurvey {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
        
        .PostHogSurvey__content {
          background-color: ${theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'} !important;
          border: 1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'} !important;
          border-radius: 8px !important;
          box-shadow: ${theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'} !important;
        }
        
        .PostHogSurvey__question {
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'} !important;
        }
        
        .PostHogSurvey__button {
          background-color: ${theme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-weight: 500 !important;
        }
        
        .PostHogSurvey__button:hover {
          background-color: ${theme === 'dark' ? '#2563eb' : '#1d4ed8'} !important;
        }
        
        .PostHogSurvey__input {
          background-color: ${theme === 'dark' ? '#334155' : '#ffffff'} !important;
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'} !important;
          border: 1px solid ${theme === 'dark' ? '#64748b' : '#d1d5db'} !important;
          border-radius: 4px !important;
          padding: 8px 12px !important;
        }
        
        .PostHogSurvey__close {
          color: ${theme === 'dark' ? '#94a3b8' : '#6b7280'} !important;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('posthog-embed-styling');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
    };

    // Apply styling after a short delay to ensure PostHog is loaded
    setTimeout(applyPostHogStyling, 1000);

    return () => {
      // Clean up styling on unmount
      const style = document.getElementById('posthog-embed-styling');
      if (style) {
        style.remove();
      }
    };
  }, [theme, stationId, layout, compact]);

  return <>{children}</>;
};
