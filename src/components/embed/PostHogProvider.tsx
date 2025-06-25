
import React, { useEffect } from 'react';

interface PostHogProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  stationId?: string;
  embedUrl?: string;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ 
  children, 
  theme = 'light',
  stationId,
  embedUrl
}) => {
  useEffect(() => {
    // Initialize PostHog with the provided snippet
    const initPostHog = () => {
      // PostHog initialization script
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Ie Ts Ms Ee Es Rs capture Ge calculateEventProperties Os register register_once register_for_session unregister unregister_for_session js getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Ds Fs createPersonProfile Ls Ps opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Cs debug I As getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      
      // Initialize PostHog with your project key
      window.posthog.init('phc_96OYMfVqVINCtjzTZPCPfUuSvlZMrZ8N6YZmmMvBJ1L', {
        api_host: 'https://us.i.posthog.com',
        defaults: '2025-05-24',
        person_profiles: 'identified_only',
        // Enable surveys and feedback features
        enable_surveys: true,
        enable_feedback: true,
        // Capture more detailed events
        capture_pageview: true,
        capture_pageleave: true,
        // Theme-based configuration
        ui: {
          theme: theme === 'dark' ? 'dark' : 'light'
        }
      });

      // Track embed initialization
      window.posthog.capture('embed_widget_loaded', {
        station_id: stationId,
        theme: theme,
        embed_url: embedUrl,
        parent_url: window.parent !== window ? document.referrer : window.location.href,
        timestamp: new Date().toISOString()
      });

      // Apply theme-based styling for PostHog surveys and feedback
      const style = document.createElement('style');
      style.textContent = `
        /* PostHog Survey Styling */
        .PostHogSurvey {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          ${theme === 'dark' ? `
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border: 1px solid #374151 !important;
          ` : `
            background-color: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #e5e7eb !important;
          `}
        }
        
        .PostHogSurvey button {
          ${theme === 'dark' ? `
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          ` : `
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          `}
        }
        
        .PostHogSurvey input, .PostHogSurvey textarea {
          ${theme === 'dark' ? `
            background-color: #374151 !important;
            color: #f9fafb !important;
            border: 1px solid #4b5563 !important;
          ` : `
            background-color: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #d1d5db !important;
          `}
        }
      `;
      document.head.appendChild(style);
    };

    // Only initialize if PostHog hasn't been initialized yet
    if (!window.posthog || !window.posthog.__SV) {
      initPostHog();
    }

    // Cleanup function
    return () => {
      // PostHog cleanup is handled automatically
    };
  }, [theme, stationId, embedUrl]);

  return <>{children}</>;
};

// Type declaration for PostHog
declare global {
  interface Window {
    posthog: any;
  }
}
