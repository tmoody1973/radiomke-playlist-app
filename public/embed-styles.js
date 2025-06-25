
(function() {
  'use strict';
  
  // CSS styles generator
  function generateCSS(config) {
    return `
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
  }

  // Create and inject CSS
  function injectCSS(config) {
    const style = document.createElement('style');
    style.textContent = generateCSS(config);
    document.head.appendChild(style);
  }

  // Export to global scope
  window.EmbedStyles = {
    injectCSS
  };
})();
