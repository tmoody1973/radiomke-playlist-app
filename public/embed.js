
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
    layout: 'list'
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.SpinitinonConfig || {});

  // Base URL for API calls
  const BASE_URL = window.location.protocol + '//' + window.location.host;

  // CSS styles for the widget
  const CSS = `
    .spinitron-widget {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      color: ${config.theme === 'dark' ? '#ffffff' : '#374151'};
      background-color: ${config.theme === 'dark' ? '#1f2937' : '#ffffff'};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      ${config.height !== 'auto' ? `height: ${config.height}px; overflow-y: auto;` : ''}
    }
    
    .spinitron-widget * {
      box-sizing: border-box;
    }
    
    .spinitron-search {
      padding: 16px;
      border-bottom: 1px solid ${config.theme === 'dark' ? '#374151' : '#e5e7eb'};
    }
    
    .spinitron-search input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid ${config.theme === 'dark' ? '#4b5563' : '#d1d5db'};
      border-radius: 6px;
      background-color: ${config.theme === 'dark' ? '#374151' : '#ffffff'};
      color: ${config.theme === 'dark' ? '#ffffff' : '#374151'};
      font-size: 14px;
    }
    
    .spinitron-search input:focus {
      outline: none;
      border-color: ${config.theme === 'dark' ? '#6366f1' : '#3b82f6'};
      box-shadow: 0 0 0 2px ${config.theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
    }
    
    .spinitron-playlist {
      ${config.layout === 'grid' ? 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 16px;' : ''}
    }
    
    .spinitron-song {
      ${config.layout === 'list' ? 'border-bottom: 1px solid ' + (config.theme === 'dark' ? '#374151' : '#e5e7eb') + ';' : 'border: 1px solid ' + (config.theme === 'dark' ? '#374151' : '#e5e7eb') + '; border-radius: 6px;'}
      padding: ${config.compact ? '8px 16px' : '16px'};
      ${config.layout === 'grid' ? 'text-align: center;' : ''}
    }
    
    .spinitron-song:hover {
      background-color: ${config.theme === 'dark' ? '#374151' : '#f9fafb'};
    }
    
    .spinitron-song-title {
      font-weight: 600;
      font-size: ${config.compact ? '14px' : '16px'};
      margin: 0 0 4px 0;
    }
    
    .spinitron-song-artist {
      color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      font-size: ${config.compact ? '12px' : '14px'};
      margin: 0 0 4px 0;
    }
    
    .spinitron-song-time {
      color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      font-size: 12px;
      margin: 0;
    }
    
    .spinitron-song-image {
      width: ${config.compact ? '40px' : '60px'};
      height: ${config.compact ? '40px' : '60px'};
      object-fit: cover;
      border-radius: 4px;
      ${config.layout === 'list' ? 'float: left; margin-right: 12px;' : 'margin: 0 auto 8px; display: block;'}
    }
    
    .spinitron-load-more {
      text-align: center;
      padding: 16px;
    }
    
    .spinitron-load-more button {
      background-color: ${config.theme === 'dark' ? '#3b82f6' : '#2563eb'};
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .spinitron-load-more button:hover {
      background-color: ${config.theme === 'dark' ? '#2563eb' : '#1d4ed8'};
    }
    
    .spinitron-load-more button:disabled {
      background-color: ${config.theme === 'dark' ? '#4b5563' : '#9ca3af'};
      cursor: not-allowed;
    }
    
    .spinitron-loading {
      text-align: center;
      padding: 32px;
      color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
    }
    
    .spinitron-error {
      text-align: center;
      padding: 32px;
      color: ${config.theme === 'dark' ? '#f87171' : '#dc2626'};
    }
  `;

  // Create and inject CSS
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Create song element
  function createSongElement(song) {
    const songDiv = document.createElement('div');
    songDiv.className = 'spinitron-song';
    
    let imageHtml = '';
    if (song.image && !config.compact) {
      imageHtml = `<img src="${song.image}" alt="${song.song}" class="spinitron-song-image" onerror="this.style.display='none'">`;
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

  // Fetch songs from API
  async function fetchSongs(offset = 0, limit = 5, searchQuery = '') {
    try {
      const params = new URLSearchParams({
        station: config.station,
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (config.startDate) params.append('startDate', config.startDate);
      if (config.endDate) params.append('endDate', config.endDate);

      const response = await fetch(`${BASE_URL}/api/songs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      
      const data = await response.json();
      return data.songs || [];
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  // Main widget class
  class SpinitinonWidget {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.songs = [];
      this.filteredSongs = [];
      this.displayCount = Math.min(parseInt(config.maxItems) || 20, 20);
      this.searchQuery = '';
      this.loading = false;
      
      if (!this.container) {
        console.error('Spinitron Widget: Container element not found');
        return;
      }
      
      this.init();
    }

    async init() {
      injectCSS();
      this.render();
      await this.loadSongs();
      
      if (config.autoUpdate) {
        setInterval(() => this.loadSongs(), 30000); // Update every 30 seconds
      }
    }

    render() {
      this.container.className = 'spinitron-widget';
      this.container.innerHTML = `
        ${config.showSearch ? `
          <div class="spinitron-search">
            <input type="text" placeholder="Search songs..." id="spinitron-search-input">
          </div>
        ` : ''}
        <div class="spinitron-playlist" id="spinitron-playlist"></div>
        <div class="spinitron-load-more" id="spinitron-load-more" style="display: none;">
          <button id="spinitron-load-more-btn">Load More</button>
        </div>
      `;

      if (config.showSearch) {
        const searchInput = this.container.querySelector('#spinitron-search-input');
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.filterSongs();
        });
      }

      const loadMoreBtn = this.container.querySelector('#spinitron-load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => this.loadMore());
      }
    }

    async loadSongs() {
      if (this.loading) return;
      
      this.loading = true;
      const playlistDiv = this.container.querySelector('#spinitron-playlist');
      
      if (this.songs.length === 0) {
        playlistDiv.innerHTML = '<div class="spinitron-loading">Loading playlist...</div>';
      }

      try {
        const maxItems = config.maxItems === 'unlimited' ? 1000 : parseInt(config.maxItems) || 20;
        const songs = await fetchSongs(0, maxItems);
        this.songs = songs;
        this.filterSongs();
      } catch (error) {
        playlistDiv.innerHTML = '<div class="spinitron-error">Failed to load playlist</div>';
      }
      
      this.loading = false;
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
      
      this.displayCount = Math.min(this.filteredSongs.length, 20);
      this.updateDisplay();
    }

    loadMore() {
      const newDisplayCount = Math.min(this.displayCount + 5, this.filteredSongs.length);
      this.displayCount = newDisplayCount;
      this.updateDisplay();
    }

    updateDisplay() {
      const playlistDiv = this.container.querySelector('#spinitron-playlist');
      const loadMoreDiv = this.container.querySelector('#spinitron-load-more');
      const loadMoreBtn = this.container.querySelector('#spinitron-load-more-btn');
      
      if (this.filteredSongs.length === 0) {
        playlistDiv.innerHTML = '<div class="spinitron-loading">No songs found</div>';
        loadMoreDiv.style.display = 'none';
        return;
      }

      const songsToShow = this.filteredSongs.slice(0, this.displayCount);
      playlistDiv.innerHTML = '';
      
      songsToShow.forEach(song => {
        playlistDiv.appendChild(this.createSongElement(song));
      });

      // Show/hide load more button
      if (this.displayCount < this.filteredSongs.length && config.maxItems !== 'unlimited') {
        loadMoreDiv.style.display = 'block';
        loadMoreBtn.disabled = this.loading;
        loadMoreBtn.textContent = this.loading ? 'Loading...' : 'Load More';
      } else {
        loadMoreDiv.style.display = 'none';
      }
    }

    createSongElement(song) {
      return createSongElement(song);
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new SpinitinonWidget('spinitron-playlist-widget');
    });
  } else {
    new SpinitinonWidget('spinitron-playlist-widget');
  }
})();
