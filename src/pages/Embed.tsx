
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
  const theme = searchParams.get('theme') || 'dark';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  // Apply theme and styling with proper overflow handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    
    // Ensure body allows overflow and proper height
    document.body.className = `embed-container w-full m-0 p-0 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`;
    document.body.style.cssText = `
      height: ${height !== 'auto' ? `${height}px` : '100vh'};
      overflow: visible !important;
      margin: 0;
      padding: 0;
      background-color: ${theme === 'dark' ? '#111827' : '#ffffff'};
      min-height: ${height !== 'auto' ? `${height}px` : '100vh'};
    `;

    // Ensure html element also allows overflow
    document.documentElement.style.cssText = `
      overflow: visible !important;
      height: 100%;
    `;

    // Send height updates to parent frame for dynamic resizing
    const sendHeightUpdate = () => {
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
          height: contentHeight + 50 // Add padding for Load More button
        }, '*');
      }
    };

    // Send initial height
    setTimeout(sendHeightUpdate, 1000);
    
    // Send height updates when content changes
    const observer = new MutationObserver(sendHeightUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [theme, height]);

  return (
    <div className={`min-h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
         style={{ overflow: 'visible' }}>
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
