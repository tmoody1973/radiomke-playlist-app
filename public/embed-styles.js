
(function() {
  'use strict';
  
  // CSS styles generator
  function generateCSS(config) {
    const isDark = config.theme === 'dark';
    
    // Dark theme colors matching the preview
    const colors = {
      background: isDark ? '#0f172a' : '#ffffff',
      cardBg: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f8fafc' : '#374151',
      textMuted: isDark ? '#cbd5e1' : '#6b7280',
      border: isDark ? '#475569' : '#e5e7eb',
      inputBg: isDark ? '#334155' : '#ffffff',
      inputBorder: isDark ? '#64748b' : '#d1d5db',
      inputText: isDark ? '#f8fafc' : '#374151',
      hover: isDark ? '#334155' : '#f9fafb',
      accent: '#ea580c'
    };
    
    return `
      .spinitron-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: ${colors.text};
        background-color: ${colors.background};
        border-radius: 8px;
        overflow: hidden;
        ${config.height !== 'auto' ? `height: ${config.height}px; overflow-y: auto;` : ''}
        min-height: 400px;
      }
      
      .spinitron-widget * {
        box-sizing: border-box;
      }
      
      .spinitron-search {
        padding: 16px;
        background-color: ${colors.cardBg};
        border-bottom: 1px solid ${colors.border};
      }
      
      .spinitron-search input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid ${colors.inputBorder};
        border-radius: 6px;
        background-color: ${colors.inputBg};
        color: ${colors.inputText};
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .spinitron-search input::placeholder {
        color: ${colors.textMuted};
        opacity: 0.8;
      }
      
      .spinitron-search input:focus {
        outline: none;
        border-color: ${colors.accent};
        box-shadow: 0 0 0 2px ${colors.accent}20;
      }
      
      .spinitron-playlist {
        background-color: ${colors.background};
        ${config.layout === 'grid' ? 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 16px;' : ''}
      }
      
      .spinitron-song {
        ${config.layout === 'list' ? 'border-bottom: 1px solid ' + colors.border + ';' : 'border: 1px solid ' + colors.border + '; border-radius: 6px; background-color: ' + colors.cardBg + ';'}
        padding: ${config.compact ? '12px 16px' : '16px'};
        ${config.layout === 'grid' ? 'text-align: center;' : ''}
        transition: all 0.2s ease;
      }
      
      .spinitron-song:hover {
        background-color: ${colors.hover};
      }
      
      .spinitron-song-title {
        font-weight: 600;
        font-size: ${config.compact ? '14px' : '16px'};
        margin: 0 0 6px 0;
        color: ${colors.text};
        line-height: 1.4;
      }
      
      .spinitron-song-artist {
        color: ${colors.textMuted};
        font-size: ${config.compact ? '13px' : '14px'};
        margin: 0 0 4px 0;
        line-height: 1.3;
      }
      
      .spinitron-song-time {
        color: ${colors.textMuted};
        font-size: 12px;
        margin: 0;
        opacity: 0.8;
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
        padding: 20px 16px;
        background-color: ${colors.background};
        border-top: 1px solid ${colors.border};
      }
      
      .spinitron-load-more button {
        background-color: ${colors.accent};
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .spinitron-load-more button:hover {
        background-color: ${isDark ? '#dc2626' : '#c2410c'};
        transform: translateY(-1px);
      }
      
      .spinitron-load-more button:disabled {
        background-color: ${colors.textMuted};
        cursor: not-allowed;
        transform: none;
      }
      
      .spinitron-loading {
        text-align: center;
        padding: 40px 16px;
        color: ${colors.textMuted};
        background-color: ${colors.background};
      }
      
      .spinitron-error {
        text-align: center;
        padding: 40px 16px;
        color: ${isDark ? '#f87171' : '#dc2626'};
        background-color: ${colors.background};
      }
      
      /* Ensure proper scrolling */
      .spinitron-widget::-webkit-scrollbar {
        width: 6px;
      }
      
      .spinitron-widget::-webkit-scrollbar-track {
        background: ${colors.border};
      }
      
      .spinitron-widget::-webkit-scrollbar-thumb {
        background: ${colors.textMuted};
        border-radius: 3px;
      }
      
      .spinitron-widget::-webkit-scrollbar-thumb:hover {
        background: ${colors.accent};
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
