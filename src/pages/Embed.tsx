
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
  const theme = searchParams.get('theme') || 'light'; // Default to light to match homepage
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  // Apply theme and styling to match homepage
  useEffect(() => {
    // Remove all theme-related classes first
    document.documentElement.classList.remove('dark', 'light');
    document.body.classList.remove('dark', 'light');
    
    // Apply the correct theme classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
    // For light mode, we explicitly don't add 'dark' class to ensure Tailwind uses light mode
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Match homepage styling with orange accent colors
    const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    const textColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
    
    document.body.className = `embed-container w-full m-0 p-0`;
    document.body.style.cssText = `
      height: ${height !== 'auto' ? `${height}px` : '100vh'};
      overflow: visible !important;
      margin: 0;
      padding: 0;
      background-color: ${bgColor};
      color: ${textColor};
      min-height: ${height !== 'auto' ? `${height}px` : '100vh'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    document.documentElement.style.cssText = `
      overflow: visible !important;
      height: 100%;
      background-color: ${bgColor};
    `;

    // Send height updates to parent frame for dynamic resizing
    const sendHeightUpdate = () => {
      // If height is specified, use that exact height for external embeds
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
      
      // For auto height, calculate based on actual content
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

  // Create dynamic classes based on theme to force re-render
  const containerClasses = theme === 'dark' 
    ? 'min-h-full flex flex-col dark bg-slate-900 text-slate-100'
    : 'min-h-full flex flex-col bg-white text-slate-900';

  return (
    <div className={containerClasses} style={{ overflow: 'visible' }}>
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
