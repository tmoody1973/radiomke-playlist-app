
(function() {
  'use strict';
  
  // Default configuration
  const defaultConfig = {
    station: 'hyfin',
    autoUpdate: true,
    showSearch: true,
    maxItems: 20,
    compact: false,
    height: 'auto',
    theme: 'light',
    layout: 'list',
    enableYouTube: true
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.SpinitinonConfig || {});

  // Base URL for API calls - use the origin where the script is hosted
  const SCRIPT_TAG = document.querySelector('script[src*="embed.js"]');
  const SCRIPT_SRC = SCRIPT_TAG ? SCRIPT_TAG.src : '';
  const BASE_URL = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : window.location.origin;

  // Export to global scope
  window.EmbedConfig = {
    config,
    BASE_URL
  };
})();
