
import { useSearchParams } from 'react-router-dom';
import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';
import { useEffect } from 'react';

const Embed = () => {
  const [searchParams] = useSearchParams();
  
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
  
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  // Apply theme and styling - completely isolated from global theme
  useEffect(() => {
    console.log('Embed theme effect triggered:', theme);
    
    // Force override any global theme by removing all theme-related classes
    document.documentElement.className = '';
    document.body.className = '';
    
    // Apply embed-specific theme directly to elements
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Apply styles directly to override any CSS custom properties
    const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    const textColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
    
    // Force these styles to override any global theme
    document.documentElement.style.cssText = `
      --background: ${theme === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
      --foreground: ${theme === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
      --card: ${theme === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
      --card-foreground: ${theme === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
      overflow: visible !important;
      height: 100%;
      background-color: ${bgColor} !important;
    `;

    document.body.className = `embed-container ${theme}`;
    document.body.style.cssText = `
      height: ${height !== 'auto' ? `${height}px` : '100vh'};
      overflow: visible !important;
      margin: 0;
      padding: 0;
      background-color: ${bgColor} !important;
      color: ${textColor} !important;
      min-height: ${height !== 'auto' ? `${height}px` : '100vh'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    // Send height updates to parent frame for dynamic resizing
    const sendHeightUpdate = () => {
      if (height !== 'auto') {
        const specifiedHeight = parseInt(height);
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'spinitron-resize',
            height: specifiedHeight
          }, '*');
        }
        return;
      }
      
      const contentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'spinitron-resize',
          height: contentHeight
        }, '*');
      }
    };

    setTimeout(sendHeightUpdate, 1000);
    
    const observer = new MutationObserver(sendHeightUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [theme, height]);

  // Create inline styles to completely override any global theme
  const containerStyles = {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    color: theme === 'dark' ? '#f8fafc' : '#1e293b',
    overflow: 'visible'
  };

  return (
    <div style={containerStyles}>
      <div className="flex-1" style={{ overflow: 'visible' }}>
        <SpinitinonPlaylist 
          stationId={stationId}
          autoUpdate={autoUpdate}
          showSearch={showSearch}
          maxItems={maxItems}
          compact={compact}
          startDate={startDate}
          endDate={endDate}
          layout={layout}
        />
      </div>
    </div>
  );
};

export default Embed;
