
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;
  
  // Load dependencies in order
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    script.onerror = function() {
      console.error('Failed to load script:', src);
      if (callback) callback(new Error('Script load failed'));
    };
    document.head.appendChild(script);
  }

  // Get base URL for loading other scripts
  const SCRIPT_TAG = document.querySelector('script[src*="embed.js"]');
  const SCRIPT_SRC = SCRIPT_TAG ? SCRIPT_TAG.src : '';
  const BASE_PATH = SCRIPT_SRC ? SCRIPT_SRC.replace('embed.js', '') : window.location.origin + '/';

  // Load all dependencies with error handling
  function loadDependencies(callback) {
    let loadedCount = 0;
    const totalScripts = 5;
    const errors = [];
    
    function scriptLoaded(error) {
      if (error) errors.push(error);
      loadedCount++;
      
      if (loadedCount === totalScripts) {
        if (errors.length > 0) {
          console.error('Some scripts failed to load:', errors);
        }
        callback(errors.length === 0);
      }
    }
    
    loadScript(BASE_PATH + 'embed-config.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-styles.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-api.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-utils.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-widget.js', scriptLoaded);
  }

  // Initialize widget when all dependencies are loaded
  function initializeWidget(success) {
    if (!success) {
      console.error('Failed to load Spinitron widget dependencies');
      return;
    }
    
    // Check if required objects are available
    if (!window.EmbedConfig || !window.SpinitinonWidget) {
      console.error('Spinitron widget dependencies not properly loaded');
      return;
    }
    
    try {
      const { config, BASE_URL } = window.EmbedConfig;
      
      function createWidget() {
        const container = document.getElementById('spinitron-playlist-widget');
        if (!container) {
          console.error('Spinitron widget container not found');
          return;
        }
        
        new window.SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
      } else {
        // DOM is already ready, but give a small delay for WordPress/Elementor
        setTimeout(createWidget, 100);
      }
    } catch (error) {
      console.error('Error initializing Spinitron widget:', error);
    }
  }

  // Load dependencies and initialize
  loadDependencies(initializeWidget);
})();
