
(function() {
  'use strict';
  
  // Check if we're inside an iframe
  const isInIframe = window !== window.parent;

  // Function to send height updates to parent window
  function sendHeightUpdate() {
    if (isInIframe) {
      const height = document.body.scrollHeight;
      window.parent.postMessage({
        type: 'spinitron-resize',
        height: height
      }, '*');
    }
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Create song element
  function createSongElement(song, config) {
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

  // Export to global scope
  window.EmbedUtils = {
    sendHeightUpdate,
    formatDate,
    createSongElement
  };
})();
