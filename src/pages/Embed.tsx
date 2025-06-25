
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
  const theme = searchParams.get('theme') || 'dark'; // Default to dark theme like homepage
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  // Apply theme and styling to match homepage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    
    // Match homepage styling exactly
    document.body.className = `embed-container w-full h-screen m-0 p-0 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`;
    document.body.style.cssText = `
      height: ${height !== 'auto' ? `${height}px` : '100vh'};
      overflow: hidden;
      margin: 0;
      padding: 0;
      background-color: ${theme === 'dark' ? '#111827' : '#ffffff'};
    `;
  }, [theme, height]);

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex-1 overflow-hidden">
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
