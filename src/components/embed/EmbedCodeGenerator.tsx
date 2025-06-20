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
  // Use the actual Supabase URL instead of window.location.origin for external embeds
  const supabaseUrl = 'https://ftrivovjultfayttemce.supabase.co';
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
<div id="spinitron-playlist-widget-${Date.now()}"></div>

<script>
(function() {
  'use strict';
  
  // Generate unique ID for this widget instance
  var widgetId = 'spinitron-playlist-widget-' + Date.now();
  var container = document.currentScript.previousElementSibling;
  container.id = widgetId;
  
  // Configuration for this widget
  var config = ${JSON.stringify(embedConfig, null, 2)};
  var baseUrl = '${supabaseUrl}';
  
  // Prevent multiple loading
  if (window.SpinitinonWidgetInstances) {
    window.SpinitinonWidgetInstances.push({id: widgetId, config: config});
  } else {
    window.SpinitinonWidgetInstances = [{id: widgetId, config: config}];
  }
  
  // Check if main script is already loaded
  if (window.SpinitinonWidgetLoaded) {
    // Main script already loaded, initialize this widget
    if (window.SpinitinonWidget) {
      new window.SpinitinonWidget(widgetId, config, baseUrl);
    }
    return;
  }
  
  // Mark as loading
  window.SpinitinonWidgetLoaded = true;
  
  // Complete widget implementation inline to avoid loading issues
  function loadWidget() {
    // Inline CSS injection
    var css = \`
      .spinitron-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
        color: \${config.theme === 'dark' ? '#ffffff' : '#374151'};
        background-color: \${config.theme === 'dark' ? '#1f2937' : '#ffffff'};
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        \${config.height !== 'auto' ? 'height: ' + config.height + 'px; overflow-y: auto;' : ''}
      }
      .spinitron-widget * { box-sizing: border-box; }
      .spinitron-search {
        padding: 16px;
        border-bottom: 1px solid \${config.theme === 'dark' ? '#374151' : '#e5e7eb'};
      }
      .spinitron-search input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid \${config.theme === 'dark' ? '#4b5563' : '#d1d5db'};
        border-radius: 6px;
        background-color: \${config.theme === 'dark' ? '#374151' : '#ffffff'};
        color: \${config.theme === 'dark' ? '#ffffff' : '#374151'};
        font-size: 14px;
      }
      .spinitron-song {
        border-bottom: 1px solid \${config.theme === 'dark' ? '#374151' : '#e5e7eb'};
        padding: \${config.compact ? '8px 16px' : '16px'};
      }
      .spinitron-song:hover {
        background-color: \${config.theme === 'dark' ? '#374151' : '#f9fafb'};
      }
      .spinitron-song-title {
        font-weight: 600;
        font-size: \${config.compact ? '14px' : '16px'};
        margin: 0 0 4px 0;
      }
      .spinitron-song-artist {
        color: \${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        font-size: \${config.compact ? '12px' : '14px'};
        margin: 0 0 4px 0;
      }
      .spinitron-loading {
        text-align: center;
        padding: 32px;
        color: \${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      }
      .spinitron-error {
        text-align: center;
        padding: 32px;
        color: \${config.theme === 'dark' ? '#f87171' : '#dc2626'};
      }
    \`;
    
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // Simple widget implementation
    function createWidget(containerId, config, baseUrl) {
      var container = document.getElementById(containerId);
      if (!container) {
        console.error('Spinitron Widget: Container not found');
        return;
      }
      
      container.className = 'spinitron-widget';
      container.innerHTML = '<div class="spinitron-loading">Loading playlist...</div>';
      
      // Fetch songs
      fetch(baseUrl + '/functions/v1/spinitron-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o'
        },
        body: JSON.stringify({
          endpoint: 'spins',
          station: config.station,
          count: config.maxItems === 'unlimited' ? '100' : config.maxItems.toString(),
          offset: '0',
          use_cache: 'false'
        })
      })
      .then(function(response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(function(data) {
        var songs = data.items || [];
        var html = '';
        
        if (config.showSearch) {
          html += '<div class="spinitron-search"><input type="text" placeholder="Search songs..." onkeyup="filterSongs(this.value)"></div>';
        }
        
        html += '<div class="spinitron-playlist">';
        songs.forEach(function(song) {
          html += '<div class="spinitron-song">';
          html += '<div class="spinitron-song-title">' + (song.song || 'Unknown Song') + '</div>';
          html += '<div class="spinitron-song-artist">' + (song.artist || 'Unknown Artist') + '</div>';
          html += '</div>';
        });
        html += '</div>';
        
        container.innerHTML = html;
      })
      .catch(function(error) {
        console.error('Error loading playlist:', error);
        container.innerHTML = '<div class="spinitron-error">Failed to load playlist. Please try again later.</div>';
      });
    }
    
    // Initialize all widget instances
    if (window.SpinitinonWidgetInstances) {
      window.SpinitinonWidgetInstances.forEach(function(instance) {
        createWidget(instance.id, instance.config, baseUrl);
      });
    }
  }
  
  // Load widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    // Give WordPress/Elementor a moment to finish rendering
    setTimeout(loadWidget, 500);
  }
})();
</script>`;
};
