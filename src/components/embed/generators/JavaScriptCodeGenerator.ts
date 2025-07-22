
interface EmbedConfig {
  selectedStation: string;
  autoUpdate: boolean;
  showSearch: boolean;
  maxItems: number;
  unlimitedSongs: boolean;
  compact: boolean;
  height: string;
  theme: string;
  layout: string;
  enableDateSearch: boolean;
  startDate?: Date;
  endDate?: Date;
  customColors?: {
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    linkColor: string;
    borderColor: string;
  };
}

export const generateJavaScriptCode = (config: EmbedConfig): string => {
  // Use the actual base URL for external embeds
  const baseUrl = window.location.origin;
  const stationName = config.selectedStation === 'hyfin' ? 'HYFIN' : '88Nine';
  const widgetId = `spinitron-playlist-widget-${Date.now()}`;
  
  const embedConfig = {
    station: config.selectedStation,
    autoUpdate: config.autoUpdate,
    showSearch: config.showSearch,
    maxItems: config.unlimitedSongs ? 'unlimited' : Math.min(config.maxItems, 20),
    compact: config.compact,
    height: config.height,
    theme: config.theme,
    layout: config.layout,
    ...(config.enableDateSearch && config.startDate && { startDate: config.startDate.toISOString() }),
    ...(config.enableDateSearch && config.endDate && { endDate: config.endDate.toISOString() })
  };

  // Generate theme-aware styling
  const isDark = config.theme === 'dark';
  const colors = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    textColor: isDark ? '#cbd5e1' : '#1f2937',
    headingColor: isDark ? '#f8fafc' : '#1f2937',
    linkColor: '#3b82f6',
    borderColor: isDark ? '#475569' : '#e5e7eb',
    cardBg: isDark ? '#1e293b' : '#ffffff'
  };

  return `<!-- Radio Milwaukee ${stationName} Playlist Widget - JavaScript Embed -->
<!-- 
  Seamless JavaScript embed for ${stationName} radio playlist
  This embeds directly into your page without iframe boundaries
  Automatically inherits your site's styling while maintaining functionality
-->

<!-- SEO-Friendly Content -->
<div class="radio-milwaukee-embed-wrapper">
  <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 600; color: ${colors.headingColor};">
    Live Radio Playlist - ${stationName}
  </h3>
  <p style="margin: 0 0 1rem 0; color: ${colors.textColor}; line-height: 1.5; font-size: 0.875rem;">
    Currently playing songs from Radio Milwaukee's ${stationName} station. 
    Discover new music and see what's trending on Milwaukee radio.
  </p>
  
  <!-- Widget Container -->
  <div 
    id="${widgetId}"
    class="spinitron-playlist-widget"
    data-station="${embedConfig.station}"
    data-auto-update="${embedConfig.autoUpdate}"
    data-show-search="${embedConfig.showSearch}"
    data-max-items="${embedConfig.maxItems}"
    data-compact="${embedConfig.compact}"
    data-height="${embedConfig.height}"
    data-theme="${embedConfig.theme}"
    data-layout="${embedConfig.layout}"
    ${embedConfig.startDate ? `data-start-date="${embedConfig.startDate}"` : ''}
    ${embedConfig.endDate ? `data-end-date="${embedConfig.endDate}"` : ''}
    style="
      min-height: ${config.height !== 'auto' ? config.height + 'px' : '400px'}; 
      background-color: ${colors.backgroundColor}; 
      border: 1px solid ${colors.borderColor}; 
      border-radius: 8px; 
      padding: 1rem;
      font-family: inherit;
    "
  >
    <!-- Loading placeholder -->
    <div style="text-align: center; padding: 2rem; color: ${colors.textColor};">
      <p>Loading ${stationName} playlist...</p>
      <noscript>
        <p style="color: #dc2626; margin-top: 1rem;">
          JavaScript is required to display the live playlist. 
          <a href="${baseUrl}/embed?station=${config.selectedStation}&theme=${config.theme}" 
             target="_blank" 
             style="color: ${colors.linkColor};">
            View playlist in new window →
          </a>
        </p>
      </noscript>
    </div>
  </div>
</div>

<!-- Structured Data for SEO -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RadioStation",
  "name": "Radio Milwaukee - ${stationName}",
  "url": "${baseUrl}",
  "description": "Live playlist showing currently playing songs from Radio Milwaukee's ${stationName} station",
  "broadcastServiceTier": "FM",
  "parentService": {
    "@type": "RadioChannel",
    "name": "${stationName}",
    "description": "Milwaukee's independent radio station"
  },
  "genre": ["Alternative", "Indie", "Local Music"],
  "inLanguage": "en-US",
  "potentialAction": {
    "@type": "ListenAction",
    "target": "${baseUrl}/embed?station=${config.selectedStation}"
  }
}
</script>

<!-- Widget Initialization Script -->
<script>
(function() {
  'use strict';
  
  // Configuration for this widget instance
  const widgetConfig = {
    containerId: '${widgetId}',
    baseUrl: '${baseUrl}',
    config: ${JSON.stringify(embedConfig, null, 2)}
  };
  
  // Initialize widget queue if not already present
  window.SpinitinonEmbedQueue = window.SpinitinonEmbedQueue || [];
  window.SpinitinonEmbedQueue.push(widgetConfig);
  
  // Check if the embed script is already loading/loaded
  if (!window.SpinitinonEmbedLoading) {
    window.SpinitinonEmbedLoading = true;
    
    // Load the optimized embed script
    const script = document.createElement('script');
    script.src = '${baseUrl}/embed-optimized.js';
    script.async = true;
    
    script.onload = function() {
      console.log('✅ Spinitron embed script loaded successfully');
    };
    
    script.onerror = function() {
      console.warn('⚠️ Failed to load embed script, trying fallback...');
      
      // Fallback to the basic embed script
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '${baseUrl}/embed.js';
      fallbackScript.async = true;
      
      fallbackScript.onload = function() {
        console.log('✅ Fallback embed script loaded');
      };
      
      fallbackScript.onerror = function() {
        console.error('❌ Failed to load Spinitron embed scripts');
        
        // Show error message in the widget container
        const container = document.getElementById('${widgetId}');
        if (container) {
          container.innerHTML = \`
            <div style="text-align: center; padding: 2rem; color: #dc2626;">
              <p><strong>Unable to load playlist</strong></p>
              <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                Please check your internet connection or 
                <a href="${baseUrl}" target="_blank" style="color: ${colors.linkColor};">
                  visit our website directly
                </a>
              </p>
            </div>
          \`;
        }
      };
      
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
  }
})();
</script>

<!-- Optional: Custom Styling for Seamless Integration -->
<style>
/* These styles help the widget blend seamlessly with your site */
.radio-milwaukee-embed-wrapper {
  margin: 1rem 0;
  font-family: inherit; /* Inherits your site's font */
}

.radio-milwaukee-embed-wrapper h3 {
  font-family: inherit;
  margin: 0 0 0.5rem 0;
}

.radio-milwaukee-embed-wrapper p {
  font-family: inherit;
  margin: 0 0 1rem 0;
}

/* Widget container styling */
.spinitron-playlist-widget {
  transition: all 0.2s ease-in-out;
}

.spinitron-playlist-widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .radio-milwaukee-embed-wrapper {
    margin: 0.5rem 0;
  }
  
  .spinitron-playlist-widget {
    padding: 0.75rem;
    border-radius: 6px;
  }
}

/* Dark theme support (if your site has dark mode) */
@media (prefers-color-scheme: dark) {
  .radio-milwaukee-embed-wrapper h3,
  .radio-milwaukee-embed-wrapper p {
    color: inherit; /* Use your site's dark mode colors */
  }
}
</style>

<!-- 
  Troubleshooting Tips:
  
  1. If the widget doesn't load, check the console for error messages
  
  2. Common issues and solutions:
     - CORS issues: The widget needs to load from ${baseUrl}
     - Script loading: Ensure your site allows third-party scripts
     - Content blockers: Disable any ad blockers that might interfere
  
  3. Debug mode: Add this line to your page to enable debug logging:
     <script>window.SpinitinonEmbedDebugMode = true;</script>
  
  4. For additional help, visit ${baseUrl}
-->`;
};
