
// Optimized embed loader - automatically falls back to the bundled version
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;

  // Get base URL for loading scripts
  const SCRIPT_TAG = document.querySelector('script[src*="embed.js"]');
  const SCRIPT_SRC = SCRIPT_TAG ? SCRIPT_TAG.src : '';
  const BASE_PATH = SCRIPT_SRC ? SCRIPT_SRC.replace('embed.js', '') : window.location.origin + '/';

  // Try to load optimized bundle first, fallback to individual scripts
  function loadOptimizedScript() {
    const script = document.createElement('script');
    script.src = BASE_PATH + 'embed-optimized.js';
    script.async = true;
    
    script.onload = function() {
      console.log('Spinitron optimized embed loaded successfully');
    };
    
    script.onerror = function() {
      console.warn('Optimized embed failed, falling back to individual scripts');
      loadLegacyScripts();
    };
    
    document.head.appendChild(script);
  }

  // Fallback to individual script loading
  function loadLegacyScripts() {
    let loadedCount = 0;
    const totalScripts = 5;
    const errors = [];
    
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
    
    function scriptLoaded(error) {
      if (error) errors.push(error);
      loadedCount++;
      
      if (loadedCount === totalScripts) {
        if (errors.length === 0) {
          initializeLegacyWidget();
        } else {
          console.error('Failed to load Spinitron widget dependencies');
        }
      }
    }
    
    loadScript(BASE_PATH + 'embed-config.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-styles.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-api.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-utils.js', scriptLoaded);
    loadScript(BASE_PATH + 'embed-widget.js', scriptLoaded);
  }

  function initializeLegacyWidget() {
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
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
      } else {
        setTimeout(createWidget, 100);
      }
    } catch (error) {
      console.error('Error initializing Spinitron widget:', error);
    }
  }

  // Start with optimized loader
  loadOptimizedScript();
})();
