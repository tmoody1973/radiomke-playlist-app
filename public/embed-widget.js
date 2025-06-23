(function() {
  'use strict';
  
  // Main widget class
  class SpinitinonWidget {
    constructor(containerId, config, baseUrl) {
      this.container = document.getElementById(containerId);
      this.config = config;
      this.baseUrl = baseUrl;
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
      window.EmbedStyles.injectCSS(this.config);
      this.render();
      await this.loadSongs();
      
      // Send initial height update
      setTimeout(window.EmbedUtils.sendHeightUpdate, 100);
      
      if (this.config.autoUpdate) {
        setInterval(() => this.loadSongs(), 30000); // Update every 30 seconds
      }
    }

    render() {
      this.container.className = 'spinitron-widget';
      this.container.innerHTML = `
        ${this.config.showSearch ? `
          <div class="spinitron-search">
            <input type="text" placeholder="Search songs..." id="spinitron-search-input">
          </div>
        ` : ''}
        <div class="spinitron-playlist" id="spinitron-playlist"></div>
        <div class="spinitron-load-more" id="spinitron-load-more" style="display: none;">
          <button id="spinitron-load-more-btn">Load More</button>
        </div>
      `;

      if (this.config.showSearch) {
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
        const maxItems = this.config.maxItems === 'unlimited' ? 1000 : parseInt(this.config.maxItems) || 20;
        const songs = await window.EmbedAPI.fetchSongs(this.baseUrl, this.config, 0, maxItems);
        this.songs = songs;
        this.filterSongs();
      } catch (error) {
        playlistDiv.innerHTML = '<div class="spinitron-error">Failed to load playlist. Please check your connection and try again.</div>';
      }
      
      this.loading = false;
      
      // Send height update after loading
      setTimeout(window.EmbedUtils.sendHeightUpdate, 100);
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
      const newDisplayCount = Math.min(this.displayCount + 10, this.filteredSongs.length);
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
        setTimeout(window.EmbedUtils.sendHeightUpdate, 100);
        return;
      }

      const songsToShow = this.filteredSongs.slice(0, this.displayCount);
      playlistDiv.innerHTML = '';
      
      songsToShow.forEach(song => {
        playlistDiv.appendChild(this.createSongElement(song));
      });

      // Show/hide load more button
      if (this.displayCount < this.filteredSongs.length && this.config.maxItems !== 'unlimited') {
        loadMoreDiv.style.display = 'block';
        loadMoreBtn.disabled = this.loading;
        loadMoreBtn.textContent = this.loading ? 'Loading...' : 'Load More';
      } else {
        loadMoreDiv.style.display = 'none';
      }
      
      // Send height update after display changes
      setTimeout(window.EmbedUtils.sendHeightUpdate, 100);
    }

    createSongElement(song) {
      return window.EmbedUtils.createSongElement(song, this.config);
    }
  }

  // Export to global scope
  window.SpinitinonWidget = SpinitinonWidget;
})();
