
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
}

export const generateEmbedUrl = (config: EmbedConfig): string => {
  const params = new URLSearchParams();
  if (config.selectedStation !== 'hyfin') params.append('station', config.selectedStation);
  if (!config.autoUpdate) params.append('autoUpdate', 'false');
  if (!config.showSearch) params.append('showSearch', 'false');
  if (!config.unlimitedSongs && config.maxItems !== 20) params.append('maxItems', config.maxItems.toString());
  if (config.unlimitedSongs) params.append('maxItems', 'unlimited');
  if (config.compact) params.append('compact', 'true');
  if (config.height !== 'auto') params.append('height', config.height);
  if (config.theme !== 'light') params.append('theme', config.theme);
  if (config.layout !== 'list') params.append('layout', config.layout);
  if (config.enableDateSearch && config.startDate) params.append('startDate', config.startDate.toISOString());
  if (config.enableDateSearch && config.endDate) params.append('endDate', config.endDate.toISOString());

  const baseUrl = window.location.origin;
  return `${baseUrl}/embed?${params.toString()}`;
};

export const generateIframeCode = (config: EmbedConfig): string => {
  const embedUrl = generateEmbedUrl(config);
  return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="${config.height}px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="Spinitron Live Playlist"
  id="spinitron-iframe">
</iframe>

<script>
  // Auto-resize iframe based on content
  window.addEventListener('message', function(event) {
    if (event.data.type === 'spinitron-resize') {
      const iframe = document.getElementById('spinitron-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`;
};

export const generateJavaScriptCode = (config: EmbedConfig): string => {
  const baseUrl = window.location.origin;
  const embedConfig = {
    station: config.selectedStation,
    autoUpdate: config.autoUpdate,
    showSearch: config.showSearch,
    maxItems: config.unlimitedSongs ? 'unlimited' : config.maxItems,
    compact: config.compact,
    height: config.height,
    theme: config.theme,
    layout: config.layout,
    ...(config.enableDateSearch && config.startDate && { startDate: config.startDate.toISOString() }),
    ...(config.enableDateSearch && config.endDate && { endDate: config.endDate.toISOString() })
  };

  return `<!-- Spinitron Playlist Widget -->
<div id="spinitron-playlist-widget"></div>

<script>
(function() {
  // Ensure we don't load multiple times
  if (window.SpinitinonWidgetLoaded) return;
  window.SpinitinonWidgetLoaded = true;
  
  // Set configuration
  window.SpinitinonConfig = ${JSON.stringify(embedConfig, null, 2)};
  
  // Function to load script dynamically
  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    script.onerror = function() {
      console.error('Failed to load Spinitron widget script');
    };
    document.head.appendChild(script);
  }
  
  // Load the main embed script
  loadScript('${baseUrl}/embed.js', function() {
    console.log('Spinitron widget loaded successfully');
  });
})();
</script>`;
};
