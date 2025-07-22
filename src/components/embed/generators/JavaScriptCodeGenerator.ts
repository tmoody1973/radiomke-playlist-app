
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
  // Use the actual Supabase URL for external embeds
  const supabaseUrl = 'https://ftrivovjultfayttemce.supabase.co';
  const embedConfig = {
    station: config.selectedStation,
    autoUpdate: config.autoUpdate,
    showSearch: config.showSearch,
    maxItems: config.unlimitedSongs ? 'unlimited' : Math.min(config.maxItems, 20), // Cap at 20 for performance
    compact: config.compact,
    height: config.height,
    theme: config.theme,
    layout: config.layout,
    ...(config.enableDateSearch && config.startDate && { startDate: config.startDate.toISOString() }),
    ...(config.enableDateSearch && config.endDate && { endDate: config.endDate.toISOString() })
  };

  return `<!-- Spinitron Playlist Widget -->
<div 
  id="spinitron-playlist-widget-${Date.now()}"
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
></div>

<script>
(function() {
  'use strict';
  
  // Load optimized embed script
  if (!window.SpinitinonEmbedLoading) {
    window.SpinitinonEmbedLoading = true;
    
    var script = document.createElement('script');
    script.src = '${supabaseUrl}/embed-optimized.js';
    script.async = true;
    script.onload = function() {
      // Initialize any widgets that are ready
      if (window.SpinitinonEmbedInit) {
        window.SpinitinonEmbedInit();
      }
    };
    script.onerror = function() {
      // Fallback to legacy embed
      var fallback = document.createElement('script');
      fallback.src = '${supabaseUrl}/embed.js';
      fallback.async = true;
      document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
  } else {
    // Script already loading or loaded, try to initialize
    setTimeout(function() {
      if (window.SpinitinonEmbedInit) {
        window.SpinitinonEmbedInit();
      }
    }, 100);
  }
})();
</script>`;
};
