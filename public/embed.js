
// Optimized embed loader - automatically falls back to the bundled version
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;
  window.SpinitinonEmbedDebug = false; // Set to true for debugging

  // Hardcoded Supabase URL for API calls - this is the primary source of truth
  const SUPABASE_URL = 'https://ftrivovjultfayttemce.supabase.co';

  // Get base URL - ALWAYS use hardcoded Supabase URL for both scripts and API
  function getBaseUrl() {
    // CRITICAL: Always return the hardcoded Supabase URL 
    // This prevents issues when embedded on external WordPress sites
    if (window.SpinitinonEmbedDebug) {
      console.log('Spinitron Embed: Using hardcoded Supabase URL:', SUPABASE_URL);
    }
    return SUPABASE_URL;
  }

  const BASE_PATH = getBaseUrl();
  
  if (window.SpinitinonEmbedDebug) {
    console.log('Spinitron Embed: Base URL determined as', BASE_PATH);
  }

  // Try to load optimized bundle first, fallback to individual scripts
  function loadOptimizedScript() {
    // WordPress compatibility mode - add timestamp to avoid caching issues
    const cacheBuster = '?_t=' + new Date().getTime();
    const script = document.createElement('script');
    script.src = BASE_PATH + '/embed-optimized.js' + cacheBuster;
    script.async = true;
    
    script.onload = function() {
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron optimized embed loaded successfully');
      }
      
      // Process any queued widgets
      if (window.SpinitinonEmbedQueue && Array.isArray(window.SpinitinonEmbedQueue)) {
        if (window.SpinitinonEmbedInit) {
          window.SpinitinonEmbedQueue.forEach(config => {
            // Make sure the base URL is set correctly
            if (!config.baseUrl) {
              config.baseUrl = BASE_PATH;
            }
            window.SpinitinonEmbedInit(config);
          });
          window.SpinitinonEmbedQueue = [];
        }
      }
    };
    
    script.onerror = function(e) {
      console.warn('Optimized embed failed, falling back to individual scripts', e);
      loadLegacyScripts();
    };
    
    document.head.appendChild(script);
  }

  // Fallback to individual script loading
  function loadLegacyScripts() {
    let loadedCount = 0;
    const totalScripts = 5;
    const errors = [];
    const cacheBuster = '?_t=' + new Date().getTime(); // Add timestamp to avoid WordPress caching issues
    
    function loadScript(src, callback) {
      const script = document.createElement('script');
      script.src = src + cacheBuster;
      script.async = true;
      script.onload = callback;
      script.onerror = function(e) {
        console.error('Failed to load script:', src, e);
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
          console.error('Failed to load Spinitron widget dependencies', errors);
          
          // Show error in all widget containers
          const containers = document.querySelectorAll('[id*="spinitron-playlist-widget"]');
          containers.forEach(container => {
            container.innerHTML = `
              <div style="text-align: center; padding: 2rem; color: #dc2626;">
                <p><strong>Unable to load playlist</strong></p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                  Failed to load required scripts from ${BASE_PATH}
                </p>
                <p style="font-size: 0.75rem; margin-top: 1rem;">
                  <a href="${SUPABASE_URL}/embed-demo" target="_blank" rel="noopener">
                    Visit the embed configuration page
                  </a>
                </p>
              </div>
            `;
          });
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
      const { config } = window.EmbedConfig;
      
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
          
          // Always use the hardcoded Supabase URL for API calls
          const apiUrl = SUPABASE_URL;
          
          container.dataset.initialized = 'true';
          new window.SpinitinonWidget(container.id, containerConfig, apiUrl);
        });
        
        // Fallback for legacy container
        const legacyContainer = document.getElementById('spinitron-playlist-widget');
        if (legacyContainer && legacyContainer.dataset.initialized !== 'true') {
          legacyContainer.dataset.initialized = 'true';
          new window.SpinitinonWidget('spinitron-playlist-widget', config, SUPABASE_URL);
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
          
          // Always use the hardcoded Supabase URL for API calls
          const apiUrl = SUPABASE_URL;
          
          container.dataset.initialized = 'true';
          new window.SpinitinonWidget(widgetConfig.containerId, widgetConfig.config, apiUrl);
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
