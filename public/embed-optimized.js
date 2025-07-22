(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;
  window.SpinitinonEmbedDebug = false; // Enable for troubleshooting

  // ============= CONFIGURATION =============
  const defaultConfig = {
    station: 'hyfin',
    autoUpdate: true,
    showSearch: true,
    maxItems: 8, // Reduced from 20 for faster initial load
    compact: false,
    height: 'auto',
    theme: 'light',
    layout: 'list'
  };

  // Hardcoded Supabase URL for API calls - this is the primary source of truth
  const SUPABASE_URL = 'https://ftrivovjultfayttemce.supabase.co';

  // Determine base URL more reliably for script loading
  function getBaseUrl() {
    // First, check if an API URL is explicitly set in the widget config
    const widgetContainer = document.querySelector('.spinitron-playlist-widget');
    if (widgetContainer && widgetContainer.dataset.apiUrl) {
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron Embed: Using explicitly configured API URL:', widgetContainer.dataset.apiUrl);
      }
      return widgetContainer.dataset.apiUrl;
    }

    // Next, try to get it from the embed script tag
    const scriptTags = [
      document.querySelector('script[src*="embed-optimized.js"]'),
      document.querySelector('script[src*="embed.js"]')
    ].filter(Boolean);
    
    if (scriptTags.length > 0) {
      const scriptSrc = scriptTags[0].src;
      try {
        const scriptOrigin = new URL(scriptSrc).origin;
        
        // Only use the script origin if it's from our Supabase domain
        if (scriptOrigin.includes('ftrivovjultfayttemce.supabase.co')) {
          if (window.SpinitinonEmbedDebug) {
            console.log('Spinitron Embed: Using script URL origin:', scriptOrigin);
          }
          return scriptOrigin;
        } else {
          if (window.SpinitinonEmbedDebug) {
            console.log('Spinitron Embed: Script is hosted on external domain, using hardcoded URL');
          }
        }
      } catch (e) {
        console.error('Error parsing script URL:', e);
      }
    }
    
    // Fallback to the hardcoded Supabase URL
    if (window.SpinitinonEmbedDebug) {
      console.log('Spinitron Embed: Using hardcoded Supabase URL:', SUPABASE_URL);
    }
    return SUPABASE_URL;
  }

  const BASE_URL = getBaseUrl();
  
  if (window.SpinitinonEmbedDebug) {
    console.log('Spinitron Embed: Base URL determined as', BASE_URL);
  }

  // ============= UTILITIES =============
  const isInIframe = window !== window.parent;

  function sendHeightUpdate() {
    if (isInIframe) {
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        400 // Minimum height
      );
      window.parent.postMessage({
        type: 'spinitron-resize',
        height: height
      }, '*');
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  function createSongElement(song, config) {
    if (!song) return document.createElement('div');
    
    const songDiv = document.createElement('div');
    songDiv.className = 'spinitron-song';
    
    let imageHtml = '';
    if (song.image && !config.compact) {
      // Lazy load images with loading placeholder
      imageHtml = `<img src="${song.image}" alt="${song.song || 'Song'}" class="spinitron-song-image" loading="lazy" onerror="this.style.display='none'">`;
    }

    songDiv.innerHTML = `
      ${imageHtml}
      <div class="spinitron-song-details">
        <div class="spinitron-song-title">${song.song || 'Unknown Song'}</div>
        <div class="spinitron-song-artist">${song.artist || 'Unknown Artist'}</div>
        ${!config.compact && song.start_time ? `<div class="spinitron-song-time">${formatDate(song.start_time)}</div>` : ''}
      </div>
    `;
    
    return songDiv;
  }

  // ============= API =============
  async function fetchSongs(config, offset = 0, limit = 8, searchQuery = '') {
    try {
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron Embed: Fetching songs with config:', config);
        console.log('Spinitron Embed: Using API URL:', BASE_URL);
      }

      const requestBody = {
        endpoint: 'spins',
        station: config.station,
        count: limit.toString(),
        offset: offset.toString(),
        search: searchQuery,
        use_cache: 'true', // Enable caching for better performance
        _cache_bust: Math.floor(Date.now() / 60000).toString() // Cache for 1 minute
      };
      
      if (config.startDate) requestBody.start = config.startDate;
      if (config.endDate) requestBody.end = config.endDate;

      // Add more detailed logging
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron Embed: API request to', `${BASE_URL}/functions/v1/spinitron-proxy`);
        console.log('Spinitron Embed: Request body:', requestBody);
      }

      // Implement retry logic for API calls
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const response = await fetch(`${BASE_URL}/functions/v1/spinitron-proxy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          
          if (window.SpinitinonEmbedDebug) {
            console.log('Spinitron Embed: API response received:', data);
          }
          
          if (!data || !data.items || !Array.isArray(data.items)) {
            throw new Error('Invalid API response format: ' + JSON.stringify(data));
          }
          
          return (data.items || []).map(item => ({
            id: item.id,
            song: item.song,
            artist: item.artist,
            start_time: item.start,
            duration: item.duration,
            image: item.image,
            release: item.release,
            label: item.label
          }));
        } catch (error) {
          retries++;
          console.error(`Spinitron Embed: Request failed (attempt ${retries}/${maxRetries}):`, error);
          
          if (retries >= maxRetries) {
            throw error;
          }
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retries), 8000);
          console.log(`Spinitron Embed: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  // Add retry mechanism with exponential backoff
  async function fetchWithRetry(fn, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        if (retries >= maxRetries) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        console.warn(`Retrying in ${delay}ms... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ============= STYLES =============
  function injectCSS(config) {
    const isDark = config.theme === 'dark';
    
    const colors = {
      background: isDark ? '#0f172a' : '#ffffff',
      cardBg: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f8fafc' : '#1f2937',
      textMuted: isDark ? '#cbd5e1' : '#6b7280',
      border: isDark ? '#475569' : '#e5e7eb',
      inputBg: isDark ? '#334155' : '#ffffff',
      inputBorder: isDark ? '#64748b' : '#d1d5db',
      inputText: isDark ? '#f8fafc' : '#1f2937',
      inputPlaceholder: isDark ? '#94a3b8' : '#9ca3af',
      hover: isDark ? '#334155' : '#f8fafc',
      accent: '#3b82f6',
      accentHover: isDark ? '#2563eb' : '#1d4ed8',
      error: isDark ? '#f87171' : '#dc2626'
    };
    
    const css = `
      .spinitron-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: ${colors.text};
        background-color: ${colors.background};
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid ${colors.border};
        ${config.height !== 'auto' ? `height: ${config.height}px; overflow-y: auto;` : ''}
        min-height: 300px;
        box-shadow: ${isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'};
      }
      
      .spinitron-widget * { box-sizing: border-box; }
      
      .spinitron-search {
        padding: 16px;
        background-color: ${colors.cardBg};
        border-bottom: 1px solid ${colors.border};
      }
      
      .spinitron-search input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid ${colors.inputBorder};
        border-radius: 8px;
        background-color: ${colors.inputBg};
        color: ${colors.inputText} !important;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .spinitron-search input::placeholder {
        color: ${colors.inputPlaceholder} !important;
        opacity: 1;
      }
      
      .spinitron-search input:focus {
        outline: none;
        border-color: ${colors.accent};
        box-shadow: 0 0 0 3px ${colors.accent}20;
      }
      
      .spinitron-playlist {
        background-color: ${colors.background};
        ${config.layout === 'grid' ? 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 16px;' : ''}
      }
      
      .spinitron-song {
        ${config.layout === 'list' ? 'border-bottom: 1px solid ' + colors.border + ';' : 'border: 1px solid ' + colors.border + '; border-radius: 8px; background-color: ' + colors.cardBg + ';'}
        padding: ${config.compact ? '12px 16px' : '16px'};
        transition: all 0.2s ease;
        background-color: ${config.layout === 'list' ? colors.background : colors.cardBg};
      }
      
      .spinitron-song:hover {
        background-color: ${colors.hover};
      }
      
      .spinitron-song-title {
        font-weight: 600;
        font-size: ${config.compact ? '14px' : '16px'};
        margin: 0 0 6px 0;
        color: ${colors.text} !important;
        line-height: 1.4;
      }
      
      .spinitron-song-artist {
        color: ${colors.textMuted} !important;
        font-size: ${config.compact ? '13px' : '14px'};
        margin: 0 0 4px 0;
        line-height: 1.3;
      }
      
      .spinitron-song-time {
        color: ${colors.textMuted} !important;
        font-size: 12px;
        margin: 0;
        opacity: 0.8;
      }
      
      .spinitron-song-image {
        width: ${config.compact ? '40px' : '50px'};
        height: ${config.compact ? '40px' : '50px'};
        object-fit: cover;
        border-radius: 6px;
        ${config.layout === 'list' ? 'float: left; margin-right: 12px;' : 'margin: 0 auto 8px; display: block;'}
      }
      
      .spinitron-loading {
        text-align: center;
        padding: 32px 16px;
        color: ${colors.textMuted};
        background-color: ${colors.background};
        font-size: 14px;
      }
      
      .spinitron-error {
        text-align: center;
        padding: 32px 16px;
        color: ${colors.error};
        background-color: ${colors.background};
        font-size: 14px;
      }
      
      .spinitron-error-actions {
        margin-top: 16px;
        text-align: center;
      }
      
      .spinitron-error-actions button {
        background-color: ${colors.accent};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .spinitron-error-actions button:hover {
        background-color: ${colors.accentHover};
      }
      
      .spinitron-load-more-inline {
        text-align: center;
        padding: 16px;
        background-color: ${colors.background};
      }
      
      .spinitron-load-more-inline button {
        background-color: ${colors.accent};
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
        max-width: 200px;
      }
      
      .spinitron-load-more-inline button:hover {
        background-color: ${colors.accentHover};
      }
      
      .spinitron-load-more-inline button:disabled {
        background-color: ${colors.textMuted};
        cursor: not-allowed;
      }
      
      .spinitron-widget::-webkit-scrollbar { width: 6px; }
      .spinitron-widget::-webkit-scrollbar-track { background: ${colors.border}; }
      .spinitron-widget::-webkit-scrollbar-thumb { background: ${colors.textMuted}; border-radius: 3px; }
      .spinitron-widget::-webkit-scrollbar-thumb:hover { background: ${colors.accent}; }
    `;
    
    // Create a unique ID for the style element to avoid duplicates
    const styleId = 'spinitron-embed-styles-' + Math.random().toString(36).substring(2, 9);
    
    // Remove any existing styles to prevent duplicates
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============= WIDGET CLASS =============
  class SpinitinonWidget {
    constructor(containerId, config, baseUrl) {
      this.container = document.getElementById(containerId);
      
      if (!this.container) {
        console.error(`Spinitron Widget: Container element not found with ID: ${containerId}`);
        return;
      }
      
      // Merge configuration from defaults and passed config
      this.config = Object.assign({}, defaultConfig, config || {});
      this.baseUrl = baseUrl || BASE_URL;
      this.songs = [];
      this.filteredSongs = [];
      this.displayCount = Math.min(parseInt(this.config.maxItems) || 8, 8);
      this.searchQuery = '';
      this.loading = false;
      this.hasLoadedInitial = false;
      this.retryCount = 0;
      this.maxRetries = 3;
      this.lastError = null;
      
      if (window.SpinitinonEmbedDebug) {
        console.log(`Spinitron Widget: Initializing widget with ID: ${containerId}`);
        console.log('Spinitron Widget: Configuration:', this.config);
        console.log('Spinitron Widget: Base URL:', this.baseUrl);
      }
      
      this.init();
    }

    async init() {
      // Inject CSS immediately
      injectCSS(this.config);
      
      // Render loading state immediately
      this.renderLoading();
      
      // Load initial songs with smaller batch
      try {
        await this.loadSongs(true);
      } catch (error) {
        console.error('Failed to load initial songs:', error);
        this.showError(`Failed to load playlist: ${this.getErrorMessage(error)}`, true);
      }
      
      // Send initial height update
      setTimeout(sendHeightUpdate, 100);
      
      // Set up auto-update with longer interval (60 seconds instead of 30)
      if (this.config.autoUpdate) {
        setInterval(() => this.loadSongs(), 60000);
      }
    }

    getErrorMessage(error) {
      if (!error) return 'Unknown error';
      
      // Extract specific error messages
      if (error.message && error.message.includes('404')) {
        return 'The playlist API endpoint was not found. This may be due to incorrect URL configuration.';
      }
      
      if (error.message && error.message.includes('Failed to fetch')) {
        return 'Network error. Please check your internet connection.';
      }
      
      return error.message || 'Unknown error';
    }

    renderLoading() {
      this.container.className = 'spinitron-widget';
      this.container.innerHTML = `
        ${this.config.showSearch ? `
          <div class="spinitron-search">
            <input type="text" placeholder="Search songs..." id="${this.container.id}-search-input">
          </div>
        ` : ''}
        <div class="spinitron-playlist" id="${this.container.id}-playlist">
          <div class="spinitron-loading">Loading playlist...</div>
        </div>
      `;

      if (this.config.showSearch) {
        const searchInput = this.container.querySelector(`#${this.container.id}-search-input`);
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterSongs();
          });
        }
      }
    }

    async loadSongs(isInitial = false) {
      if (this.loading) return;
      
      this.loading = true;
      const playlistDiv = this.container.querySelector(`#${this.container.id}-playlist`);
      if (!playlistDiv) {
        console.error('Playlist div not found');
        this.loading = false;
        return;
      }

      try {
        // Load smaller initial batch for faster first paint with pagination support
        const loadCount = isInitial ? 5 : (this.config.maxItems === 'unlimited' ? 15 : parseInt(this.config.maxItems) || 8);
        
        console.log('Spinitron Widget: Loading songs with base URL:', this.baseUrl);
        const songs = await fetchWithRetry(() => fetchSongs(this.config, 0, loadCount, this.searchQuery));
        
        this.songs = songs;
        this.hasLoadedInitial = true;
        this.lastError = null;
        this.filterSongs();
        this.retryCount = 0; // Reset retry count on successful load
      } catch (error) {
        console.error('Failed to load songs:', error);
        this.lastError = error;
        
        // Show error with retry button and detailed message
        this.showError(this.getErrorMessage(error), true);
        
        // Auto-retry with exponential backoff if it's the initial load
        if (!this.hasLoadedInitial && this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
          
          setTimeout(() => {
            if (!this.hasLoadedInitial) {
              this.loadSongs(isInitial);
            }
          }, delay);
        }
      }
      
      this.loading = false;
      setTimeout(sendHeightUpdate, 100);
    }

    showError(message, showRetry = false) {
      const playlistDiv = this.container.querySelector(`#${this.container.id}-playlist`);
      if (!playlistDiv) return;
      
      // Create a more user-friendly error message
      let errorHtml = `
        <div class="spinitron-error">
          <p><strong>Unable to load playlist</strong></p>
          <p style="margin-top: 0.5rem; font-size: 0.875rem;">${message}</p>
          <p style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.8;">
            Technical details: Error connecting to ${this.baseUrl}
          </p>
        </div>
      `;
      
      if (showRetry) {
        errorHtml += `
          <div class="spinitron-error-actions">
            <button id="${this.container.id}-retry-btn">Try Again</button>
          </div>
        `;
      }
      
      playlistDiv.innerHTML = errorHtml;
      
      if (showRetry) {
        const retryBtn = this.container.querySelector(`#${this.container.id}-retry-btn`);
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            playlistDiv.innerHTML = '<div class="spinitron-loading">Loading playlist...</div>';
            this.loadSongs(true);
          });
        }
      }
    }

    filterSongs() {
      if (!this.searchQuery) {
        this.filteredSongs = this.songs;
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredSongs = this.songs.filter(song => 
          (song.song || '').toLowerCase().includes(query) ||
          (song.artist || '').toLowerCase().includes(query)
        );
      }
      
      this.displayCount = Math.min(this.filteredSongs.length, this.hasLoadedInitial ? 8 : 5);
      this.updateDisplay();
    }

    loadMore() {
      const newDisplayCount = Math.min(this.displayCount + 8, this.filteredSongs.length);
      this.displayCount = newDisplayCount;
      this.updateDisplay();
    }

    updateDisplay() {
      const playlistDiv = this.container.querySelector(`#${this.container.id}-playlist`);
      if (!playlistDiv) return;
      
      if (this.filteredSongs.length === 0) {
        if (this.lastError) {
          this.showError(this.getErrorMessage(this.lastError), true);
        } else {
          playlistDiv.innerHTML = '<div class="spinitron-loading">No songs found</div>';
        }
        setTimeout(sendHeightUpdate, 100);
        return;
      }

      const songsToShow = this.filteredSongs.slice(0, this.displayCount);
      playlistDiv.innerHTML = '';
      
      songsToShow.forEach(song => {
        playlistDiv.appendChild(createSongElement(song, this.config));
      });

      // Add Load More button if there are more songs
      if (this.displayCount < this.filteredSongs.length) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.className = 'spinitron-load-more-inline';
        loadMoreDiv.innerHTML = `
          <button id="${this.container.id}-load-more-btn" ${this.loading ? 'disabled' : ''}>
            ${this.loading ? 'Loading...' : 'Load More'}
          </button>
        `;
        
        const loadMoreBtn = loadMoreDiv.querySelector(`#${this.container.id}-load-more-btn`);
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        playlistDiv.appendChild(loadMoreDiv);
      }
      
      setTimeout(sendHeightUpdate, 100);
    }
  }

  // ============= INITIALIZATION =============
  function createWidget() {
    // Look for all containers with IDs matching the pattern
    const containers = document.querySelectorAll('[id*="spinitron-playlist-widget"]');
    
    if (window.SpinitinonEmbedDebug) {
      console.log(`Spinitron Embed: Found ${containers.length} widget containers`);
    }
    
    containers.forEach(container => {
      if (container.dataset.initialized === 'true') {
        if (window.SpinitinonEmbedDebug) {
          console.log(`Spinitron Embed: Container ${container.id} already initialized, skipping`);
        }
        return;
      }
      
      // Get configuration from data attributes or use defaults
      const config = {
        station: container.dataset.station || defaultConfig.station,
        autoUpdate: container.dataset.autoUpdate !== 'false',
        showSearch: container.dataset.showSearch !== 'false',
        maxItems: container.dataset.maxItems || defaultConfig.maxItems,
        compact: container.dataset.compact === 'true',
        height: container.dataset.height || defaultConfig.height,
        theme: container.dataset.theme || defaultConfig.theme,
        layout: container.dataset.layout || defaultConfig.layout,
        startDate: container.dataset.startDate,
        endDate: container.dataset.endDate
      };
      
      // Get any explicit API URL configuration from the container
      const apiUrl = container.dataset.apiUrl || BASE_URL;
      
      if (window.SpinitinonEmbedDebug) {
        console.log(`Spinitron Embed: Initializing container ${container.id} with config:`, config);
        console.log(`Spinitron Embed: Using API URL:`, apiUrl);
      }
      
      container.dataset.initialized = 'true';
      new SpinitinonWidget(container.id, config, apiUrl);
    });
    
    // Process any queued widgets
    if (window.SpinitinonEmbedQueue && Array.isArray(window.SpinitinonEmbedQueue)) {
      window.SpinitinonEmbedQueue.forEach(widgetConfig => {
        if (!document.getElementById(widgetConfig.containerId)) {
          console.warn(`Spinitron Embed: Container with ID ${widgetConfig.containerId} not found for queued widget`);
          return;
        }
        
        const container = document.getElementById(widgetConfig.containerId);
        if (container.dataset.initialized === 'true') return;
        
        container.dataset.initialized = 'true';
        new SpinitinonWidget(
          widgetConfig.containerId, 
          widgetConfig.config, 
          widgetConfig.baseUrl || BASE_URL
        );
      });
      
      // Clear the queue
      window.SpinitinonEmbedQueue = [];
    }
    
    // Fallback for legacy containers
    const legacyContainer = document.getElementById('spinitron-playlist-widget');
    if (legacyContainer && legacyContainer.dataset.initialized !== 'true') {
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron Embed: Initializing legacy container');
      }
      
      const config = Object.assign({}, defaultConfig, window.SpinitinonConfig || {});
      legacyContainer.dataset.initialized = 'true';
      new SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
    }
  }

  // Initialize when DOM is ready with improved timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    // DOM is already ready
    setTimeout(createWidget, 0);
  }

  // Process any queued widgets immediately
  if (window.SpinitinonEmbedQueue && Array.isArray(window.SpinitinonEmbedQueue)) {
    window.SpinitinonEmbedQueue.forEach(widgetConfig => {
      if (!document.getElementById(widgetConfig.containerId)) {
        console.warn(`Spinitron Embed: Container with ID ${widgetConfig.containerId} not found for queued widget`);
        return;
      }
      
      const container = document.getElementById(widgetConfig.containerId);
      if (container.dataset.initialized === 'true') return;
      
      container.dataset.initialized = 'true';
      new SpinitinonWidget(
        widgetConfig.containerId, 
        widgetConfig.config, 
        widgetConfig.baseUrl || BASE_URL
      );
    });
    
    // Clear the queue
    window.SpinitinonEmbedQueue = [];
  }

  // Export for manual initialization if needed
  window.SpinitinonWidget = SpinitinonWidget;
  window.SpinitinonEmbedInit = function(widgetConfig) {
    if (!widgetConfig || !widgetConfig.containerId) {
      console.error('Spinitron Embed: Invalid widget configuration, containerId is required');
      return;
    }
    
    const container = document.getElementById(widgetConfig.containerId);
    if (!container) {
      console.error(`Spinitron Embed: Container with ID ${widgetConfig.containerId} not found`);
      return;
    }
    
    if (container.dataset.initialized === 'true') {
      console.warn(`Spinitron Embed: Container ${widgetConfig.containerId} already initialized, skipping`);
      return;
    }
    
    container.dataset.initialized = 'true';
    new SpinitinonWidget(
      widgetConfig.containerId, 
      widgetConfig.config, 
      widgetConfig.baseUrl || BASE_URL
    );
  };
  
  // Add debug toggle function
  window.SpinitinonEmbedDebugMode = function(enable) {
    window.SpinitinonEmbedDebug = enable === true;
    console.log(`Spinitron Embed: Debug mode ${window.SpinitinonEmbedDebug ? 'enabled' : 'disabled'}`);
  };
})();
