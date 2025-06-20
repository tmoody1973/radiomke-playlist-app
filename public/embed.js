
(function() {
  'use strict';
  
  // Load dependencies in order
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Get base URL for loading other scripts
  const SCRIPT_TAG = document.querySelector('script[src*="embed.js"]');
  const SCRIPT_SRC = SCRIPT_TAG ? SCRIPT_TAG.src : '';
  const BASE_PATH = SCRIPT_SRC ? SCRIPT_SRC.replace('embed.js', '') : '';

  // Load all dependencies
  function loadDependencies(callback) {
    loadScript(BASE_PATH + 'embed-config.js', () => {
      loadScript(BASE_PATH + 'embed-styles.js', () => {
        loadScript(BASE_PATH + 'embed-api.js', () => {
          loadScript(BASE_PATH + 'embed-utils.js', () => {
            loadScript(BASE_PATH + 'embed-widget.js', callback);
          });
        });
      });
    });
  }

  // Initialize widget when all dependencies are loaded
  function initializeWidget() {
    const { config, BASE_URL } = window.EmbedConfig;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new window.SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
      });
    } else {
      new window.SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
    }
  }

  // Load dependencies and initialize
  loadDependencies(initializeWidget);
})();
