
// Optimized embed loader - automatically falls back to the bundled version
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;
  window.SpinitinonEmbedDebug = false; // Set to true for debugging

  // Get base URL for loading scripts
  function getBaseUrl() {
    const scriptTag = document.querySelector('script[src*="embed.js"]');
    if (scriptTag && scriptTag.src) {
      try {
        return new URL(scriptTag.src).origin;
      } catch (e) {
        console.error('Error parsing script URL:', e);
      }
    }
    return window.location.origin;
  }

  const BASE_PATH = getBaseUrl();
  
  if (window.SpinitinonEmbedDebug) {
    console.log('Spinitron Embed: Base URL determined as', BASE_PATH);
  }

  // Try to load optimized bundle first, fallback to individual scripts
  function loadOptimizedScript() {
    const script = document.createElement('script');
    script.src = BASE_PATH + '/embed-optimized.js';
    script.async = true;
    
    script.onload = function() {
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron optimized embed loaded successfully');
      }
      
      // Process any queued widgets
      if (window.SpinitinonEmbedQueue && Array.isArray(window.SpinitinonEmbedQueue)) {
        if (window.SpinitinonEmbedInit) {
          window.SpinitinonEmbedQueue.forEach(config => {
            window.SpinitinonEmbedInit(config);
          });
          window.SpinitinonEmbedQueue = [];
        }
      }
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
    
    loadScript(BASE_PATH + '/embed-config.js', scriptLoaded);
    loadScript(BASE_PATH + '/embed-styles.js', scriptLoaded);
    loadScript(BASE_PATH + '/embed-api.js', scriptLoaded);
    loadScript(BASE_PATH + '/embed-utils.js', scriptLoaded);
    loadScript(BASE_PATH + '/embed-widget.js', scriptLoaded);
  }

  function initializeLegacyWidget() {
    if (!window.EmbedConfig || !window.SpinitinonWidget) {
      console.error('Spinitron widget dependencies not properly loaded');
      return;
    }
    
    try {
      const { config, BASE_URL } = window.EmbedConfig;
      
      function createWidget() {
        // Look for all containers with IDs matching the pattern
        const containers = document.querySelectorAll('[id*="spinitron-playlist-widget"]');
        
        if (window.SpinitinonEmbedDebug) {
          console.log(`Spinitron Embed: Found ${containers.length} widget containers`);
        }
        
        containers.forEach(container => {
          if (container.dataset.initialized === 'true') return;
          
          // Get configuration from data attributes or use defaults
          const containerConfig = {
            station: container.dataset.station || config.station,
            autoUpdate: container.dataset.autoUpdate !== 'false',
            showSearch: container.dataset.showSearch !== 'false',
            maxItems: container.dataset.maxItems || config.maxItems,
            compact: container.dataset.compact === 'true',
            height: container.dataset.height || config.height,
            theme: container.dataset.theme || config.theme,
            layout: container.dataset.layout || config.layout
          };
          
          container.dataset.initialized = 'true';
          new window.SpinitinonWidget(container.id, containerConfig, BASE_URL);
        });
        
        // Fallback for legacy container
        const legacyContainer = document.getElementById('spinitron-playlist-widget');
        if (legacyContainer && legacyContainer.dataset.initialized !== 'true') {
          legacyContainer.dataset.initialized = 'true';
          new window.SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
        }
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
      } else {
        setTimeout(createWidget, 0);
      }
      
      // Process any queued widgets
      if (window.SpinitinonEmbedQueue && Array.isArray(window.SpinitinonEmbedQueue)) {
        window.SpinitinonEmbedQueue.forEach(widgetConfig => {
          if (!document.getElementById(widgetConfig.containerId)) {
            console.warn(`Container with ID ${widgetConfig.containerId} not found for queued widget`);
            return;
          }
          
          const container = document.getElementById(widgetConfig.containerId);
          if (container.dataset.initialized === 'true') return;
          
          container.dataset.initialized = 'true';
          new window.SpinitinonWidget(widgetConfig.containerId, widgetConfig.config, widgetConfig.baseUrl);
        });
        
        // Clear the queue
        window.SpinitinonEmbedQueue = [];
      }
    } catch (error) {
      console.error('Error initializing Spinitron widget:', error);
    }
  }

  // Start with optimized loader
  loadOptimizedScript();
  
  // Add debug toggle function
  window.SpinitinonEmbedDebugMode = function(enable) {
    window.SpinitinonEmbedDebug = enable === true;
    console.log(`Spinitron Embed: Debug mode ${window.SpinitinonEmbedDebug ? 'enabled' : 'disabled'}`);
  };
})();
