import { useSearchParams } from 'react-router-dom';
import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';
import { useEffect, useState } from 'react';

const OptimizedEmbed = () => {
  const [searchParams] = useSearchParams();
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  
  // Extract parameters from URL
  const stationId = searchParams.get('station') || 'hyfin';
  const autoUpdate = searchParams.get('autoUpdate') !== 'false';
  const showSearch = searchParams.get('showSearch') !== 'false';
  const maxItemsParam = searchParams.get('maxItems') || '20';
  const maxItems = maxItemsParam === 'unlimited' ? 1000 : parseInt(maxItemsParam);
  const compact = searchParams.get('compact') === 'true';
  const height = searchParams.get('height') || 'auto';
  const theme = searchParams.get('theme') || 'light';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const isPreview = searchParams.get('preview') === 'true';
  
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  // Listen for config updates via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'config-update') {
        setCurrentConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Notify parent when loaded
  useEffect(() => {
    const notifyLoaded = () => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'embed-loaded'
        }, '*');
      }
    };

    // Notify when component mounts
    setTimeout(notifyLoaded, 100);

    // Set up error handling
    const handleError = () => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'embed-error',
          message: 'Failed to load embed content'
        }, '*');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Use current config from postMessage if available, otherwise use URL params
  const effectiveConfig = currentConfig || {
    stationId,
    autoUpdate: isPreview ? false : autoUpdate, // Disable auto-update in preview
    showSearch,
    maxItems: isPreview ? Math.min(maxItems, 10) : maxItems, // Limit items in preview
    compact,
    height,
    theme,
    layout,
    startDate,
    endDate
  };

  // Apply theme and styling - completely isolated from global theme
  useEffect(() => {
    const applyTheme = (themeValue: string) => {
      console.log('Optimized embed theme effect triggered:', themeValue);
      
      // Force override any global theme by removing all theme-related classes
      document.documentElement.className = '';
      document.body.className = '';
      
      // Apply embed-specific theme directly to elements
      if (themeValue === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      // Apply styles directly to override any CSS custom properties
      const bgColor = themeValue === 'dark' ? '#0f172a' : '#ffffff';
      const textColor = themeValue === 'dark' ? '#f8fafc' : '#1e293b';
      
      // Scrollbar colors based on theme
      const scrollbarTrack = themeValue === 'dark' ? '#1e293b' : '#f1f5f9';
      const scrollbarThumb = themeValue === 'dark' ? '#475569' : '#cbd5e1';
      const scrollbarThumbHover = themeValue === 'dark' ? '#64748b' : '#94a3b8';
      
      // Force these styles to override any global theme
      document.documentElement.style.cssText = `
        --background: ${themeValue === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
        --foreground: ${themeValue === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
        --card: ${themeValue === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
        --card-foreground: ${themeValue === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
        overflow: visible !important;
        height: 100%;
        background-color: ${bgColor} !important;
      `;

      // Add scrollbar styling directly to the document
      let scrollbarStyle = document.getElementById('embed-scrollbar-style');
      if (scrollbarStyle) {
        scrollbarStyle.remove();
      }
      
      scrollbarStyle = document.createElement('style');
      scrollbarStyle.id = 'embed-scrollbar-style';
      scrollbarStyle.textContent = `
        /* Webkit scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${scrollbarTrack} !important;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${scrollbarThumb} !important;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarThumbHover} !important;
        }
        
        /* Firefox scrollbars */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${scrollbarThumb} ${scrollbarTrack};
        }
      `;
      
      document.head.appendChild(scrollbarStyle);

      document.body.className = `embed-container ${themeValue}`;
      document.body.style.cssText = `
        height: ${effectiveConfig.height !== 'auto' ? `${effectiveConfig.height}px` : '100vh'};
        overflow: visible !important;
        margin: 0;
        padding: 0;
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
        min-height: ${effectiveConfig.height !== 'auto' ? `${effectiveConfig.height}px` : '100vh'};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      `;
    };

    applyTheme(effectiveConfig.theme);
  }, [effectiveConfig.theme, effectiveConfig.height]);

  // Create inline styles to completely override any global theme
  const containerStyles = {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: effectiveConfig.theme === 'dark' ? '#0f172a' : '#ffffff',
    color: effectiveConfig.theme === 'dark' ? '#f8fafc' : '#1e293b',
    overflow: 'visible'
  };

  return (
    <div style={containerStyles}>
      <div className="flex-1" style={{ overflow: 'visible' }}>
        <SpinitinonPlaylist 
          stationId={effectiveConfig.stationId}
          autoUpdate={effectiveConfig.autoUpdate}
          showSearch={effectiveConfig.showSearch}
          maxItems={effectiveConfig.maxItems}
          compact={effectiveConfig.compact}
          startDate={effectiveConfig.startDate}
          endDate={effectiveConfig.endDate}
          layout={effectiveConfig.layout}
        />
      </div>
    </div>
  );
};

export default OptimizedEmbed;