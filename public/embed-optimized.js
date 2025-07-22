(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.SpinitinonEmbedInitialized) {
    return;
  }
  window.SpinitinonEmbedInitialized = true;

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

  // Get base URL for API calls
  const SCRIPT_TAG = document.querySelector('script[src*="embed-optimized.js"]') || 
                     document.querySelector('script[src*="embed.js"]');
  const SCRIPT_SRC = SCRIPT_TAG ? SCRIPT_TAG.src : '';
  const BASE_URL = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : 'https://ftrivovjultfayttemce.supabase.co';

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
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function createSongElement(song, config) {
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

      const response = await fetch(`${BASE_URL}/functions/v1/spinitron-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
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
      console.error('Error fetching songs:', error);
      throw error;
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
      accentHover: isDark ? '#2563eb' : '#1d4ed8'
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
        color: ${isDark ? '#f87171' : '#dc2626'};
        background-color: ${colors.background};
        font-size: 14px;
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
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============= WIDGET CLASS =============
  class SpinitinonWidget {
    constructor(containerId, config, baseUrl) {
      this.container = document.getElementById(containerId);
      this.config = Object.assign({}, defaultConfig, config);
      this.baseUrl = baseUrl || BASE_URL;
      this.songs = [];
      this.filteredSongs = [];
      this.displayCount = Math.min(parseInt(this.config.maxItems) || 8, 8);
      this.searchQuery = '';
      this.loading = false;
      this.hasLoadedInitial = false;
      
      if (!this.container) {
        console.error('Spinitron Widget: Container element not found');
        return;
      }
      
      this.init();
    }

    async init() {
      // Inject CSS immediately
      injectCSS(this.config);
      
      // Render loading state immediately
      this.renderLoading();
      
      // Load initial songs with smaller batch
      await this.loadSongs(true);
      
      // Send initial height update
      setTimeout(sendHeightUpdate, 100);
      
      // Set up auto-update with longer interval (60 seconds instead of 30)
      if (this.config.autoUpdate) {
        setInterval(() => this.loadSongs(), 60000);
      }
    }

    renderLoading() {
      this.container.className = 'spinitron-widget';
      this.container.innerHTML = `
        ${this.config.showSearch ? `
          <div class="spinitron-search">
            <input type="text" placeholder="Search songs..." id="spinitron-search-input">
          </div>
        ` : ''}
        <div class="spinitron-playlist" id="spinitron-playlist">
          <div class="spinitron-loading">Loading playlist...</div>
        </div>
      `;

      if (this.config.showSearch) {
        const searchInput = this.container.querySelector('#spinitron-search-input');
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.filterSongs();
        });
      }
    }

    async loadSongs(isInitial = false) {
      if (this.loading) return;
      
      this.loading = true;
      const playlistDiv = this.container.querySelector('#spinitron-playlist');

      try {
        // Load smaller initial batch for faster first paint with pagination support
        const loadCount = isInitial ? 5 : (this.config.maxItems === 'unlimited' ? 15 : parseInt(this.config.maxItems) || 8);
        const songs = await fetchSongs(this.config, 0, loadCount);
        
        this.songs = songs;
        this.hasLoadedInitial = true;
        this.filterSongs();
      } catch (error) {
        console.error('Failed to load songs:', error);
        playlistDiv.innerHTML = '<div class="spinitron-error">Failed to load playlist. Please try again later.</div>';
        
        // Retry after 5 seconds
        setTimeout(() => {
          if (!this.hasLoadedInitial) {
            this.loadSongs(isInitial);
          }
        }, 5000);
      }
      
      this.loading = false;
      setTimeout(sendHeightUpdate, 100);
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
      const playlistDiv = this.container.querySelector('#spinitron-playlist');
      
      if (this.filteredSongs.length === 0) {
        playlistDiv.innerHTML = '<div class="spinitron-loading">No songs found</div>';
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
          <button id="spinitron-load-more-btn" ${this.loading ? 'disabled' : ''}>
            ${this.loading ? 'Loading...' : 'Load More'}
          </button>
        `;
        
        const loadMoreBtn = loadMoreDiv.querySelector('#spinitron-load-more-btn');
        loadMoreBtn.addEventListener('click', () => this.loadMore());
        
        playlistDiv.appendChild(loadMoreDiv);
      }
      
      setTimeout(sendHeightUpdate, 100);
    }
  }

  // ============= INITIALIZATION =============
  function createWidget() {
    const containers = document.querySelectorAll('[id*="spinitron-playlist-widget"]');
    
    containers.forEach(container => {
      if (container.dataset.initialized) return;
      
      // Get configuration from data attributes or use defaults
      const config = {
        ...defaultConfig,
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
      
      container.dataset.initialized = 'true';
      new SpinitinonWidget(container.id, config, BASE_URL);
    });
    
    // Fallback for legacy containers
    const legacyContainer = document.getElementById('spinitron-playlist-widget');
    if (legacyContainer && !legacyContainer.dataset.initialized) {
      const config = Object.assign({}, defaultConfig, window.SpinitinonConfig || {});
      legacyContainer.dataset.initialized = 'true';
      new SpinitinonWidget('spinitron-playlist-widget', config, BASE_URL);
    }
  }

  // Initialize when DOM is ready with improved timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else if (document.readyState === 'interactive') {
    // DOM is ready but resources may still be loading
    setTimeout(createWidget, 50);
  } else {
    // DOM and resources are ready
    createWidget();
  }

  // Export for manual initialization if needed
  window.SpinitinonWidget = SpinitinonWidget;
  window.SpinitinonEmbedInit = createWidget;
})();