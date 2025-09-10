
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
  enableYouTube: boolean;
  showHeader: boolean;
  showLoadMore: boolean;
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
  const supabaseUrl = typeof window !== 'undefined' && window.location ? window.location.origin : '';
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
  } as const;

  // Build an embed page URL for noscript fallback
  const params = new URLSearchParams();
  params.append('station', embedConfig.station);
  if (!embedConfig.autoUpdate) params.append('autoUpdate', 'false');
  if (!embedConfig.showSearch) params.append('showSearch', 'false');
  if (embedConfig.maxItems !== 'unlimited' && embedConfig.maxItems !== 20) params.append('maxItems', String(embedConfig.maxItems));
  if (embedConfig.maxItems === 'unlimited') params.append('maxItems', 'unlimited');
  if (embedConfig.compact) params.append('compact', 'true');
  if (embedConfig.height !== 'auto') params.append('height', String(embedConfig.height));
  params.append('theme', embedConfig.theme);
  if (embedConfig.layout !== 'list') params.append('layout', embedConfig.layout);
  if ((embedConfig as any).startDate) params.append('startDate', (embedConfig as any).startDate);
  if ((embedConfig as any).endDate) params.append('endDate', (embedConfig as any).endDate);
  const embedPageUrl = `${supabaseUrl}/embed?${params.toString()}`;

return `<!-- Spinitron Playlist Widget (JavaScript) -->
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
  ${(embedConfig as any).startDate ? `data-start-date="${(embedConfig as any).startDate}"` : ''}
  ${(embedConfig as any).endDate ? `data-end-date="${(embedConfig as any).endDate}"` : ''}
></div>

<script>
(function() {
  'use strict';
  // Load optimized embed script with fallback
  if (!window.SpinitinonEmbedLoading) {
    window.SpinitinonEmbedLoading = true;
    var script = document.createElement('script');
    script.src = '${supabaseUrl}/embed-optimized.js';
    script.async = true;
    script.onload = function() {
      if (window.SpinitinonEmbedInit) window.SpinitinonEmbedInit();
    };
    script.onerror = function() {
      var fallback = document.createElement('script');
      fallback.src = '${supabaseUrl}/embed.js';
      fallback.async = true;
      document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
  } else {
    setTimeout(function() {
      if (window.SpinitinonEmbedInit) window.SpinitinonEmbedInit();
    }, 100);
  }
})();
</script>

<noscript>
  <!-- No-JS fallback for accessibility and SEO crawlers without JS -->
  <iframe src="${embedPageUrl}" style="border:0;width:100%;height:600px" loading="lazy"></iframe>
</noscript>`;
};
