
import { useSearchParams } from 'react-router-dom';
import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';

const Embed = () => {
  const [searchParams] = useSearchParams();
  
  // Extract parameters from URL
  const stationId = searchParams.get('station') || 'hyfin'; // Default to HYFIN
  const autoUpdate = searchParams.get('autoUpdate') !== 'false';
  const showSearch = searchParams.get('showSearch') !== 'false';
  const maxItems = parseInt(searchParams.get('maxItems') || '20');
  const compact = searchParams.get('compact') === 'true';
  const height = searchParams.get('height') || 'auto';
  const theme = searchParams.get('theme') || 'light';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  // Validate layout parameter to ensure it matches the expected type
  const layoutParam = searchParams.get('layout');
  const layout: 'list' | 'grid' = layoutParam === 'grid' ? 'grid' : 'list';

  return (
    <div 
      className={`embed-container w-full h-screen ${theme === 'dark' ? 'dark' : ''}`}
      style={{ 
        height: height !== 'auto' ? `${height}px` : '100vh',
        overflow: 'hidden'
      }}
    >
      <div className="h-full bg-background p-2 sm:p-4 flex flex-col">
        <div className="flex-1 min-h-0">
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
    </div>
  );
};

export default Embed;
