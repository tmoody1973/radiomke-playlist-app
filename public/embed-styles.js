
(function() {
  'use strict';
  
  function injectCSS(config) {
    const isDark = config.theme === 'dark';
    
    const css = `
      .spinitron-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
        color: ${isDark ? '#ffffff' : '#374151'};
        background-color: ${isDark ? '#1f2937' : '#ffffff'};
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        ${config.height !== 'auto' ? `height: ${config.height}px; overflow-y: auto;` : ''}
      }
      .spinitron-widget * { box-sizing: border-box; }
      .spinitron-search {
        padding: 16px;
        border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
      }
      .spinitron-search input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
        border-radius: 6px;
        background-color: ${isDark ? '#374151' : '#ffffff'};
        color: ${isDark ? '#ffffff' : '#374151'};
        font-size: 14px;
      }
      .spinitron-song {
        border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
        padding: ${config.compact ? '8px 16px' : '16px'};
      }
      .spinitron-song:hover {
        background-color: ${isDark ? '#374151' : '#f9fafb'};
      }
      .spinitron-song-title {
        font-weight: 600;
        font-size: ${config.compact ? '14px' : '16px'};
        margin: 0 0 4px 0;
      }
      .spinitron-song-artist {
        color: ${isDark ? '#9ca3af' : '#6b7280'};
        font-size: ${config.compact ? '12px' : '14px'};
        margin: 0 0 4px 0;
      }
      .spinitron-loading {
        text-align: center;
        padding: 32px;
        color: ${isDark ? '#9ca3af' : '#6b7280'};
      }
      .spinitron-error {
        text-align: center;
        padding: 32px;
        color: ${isDark ? '#f87171' : '#dc2626'};
      }
      .spinitron-load-more {
        padding: 16px;
        text-align: center;
        border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
      }
      .spinitron-load-more button {
        background-color: ${isDark ? '#4b5563' : '#f3f4f6'};
        color: ${isDark ? '#ffffff' : '#374151'};
        border: 1px solid ${isDark ? '#6b7280' : '#d1d5db'};
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      .spinitron-load-more button:hover {
        background-color: ${isDark ? '#6b7280' : '#e5e7eb'};
      }
      .spinitron-footer {
        text-align: center;
        padding: 12px 16px;
        border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
        font-size: 12px;
        color: ${isDark ? '#9ca3af' : '#6b7280'};
        background-color: ${isDark ? '#111827' : '#f9fafb'};
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // Export to global scope
  window.EmbedStyles = {
    injectCSS
  };
})();
