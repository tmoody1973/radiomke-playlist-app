
import { useSearchParams } from 'react-router-dom';
import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';

const Embed = () => {
  const [searchParams] = useSearchParams();
  
  // Extract parameters from URL
  const stationId = searchParams.get('station') || '';
  const autoUpdate = searchParams.get('autoUpdate') !== 'false';
  const showSearch = searchParams.get('showSearch') !== 'false';
  const maxItems = parseInt(searchParams.get('maxItems') || '20');
  const compact = searchParams.get('compact') === 'true';
  const height = searchParams.get('height') || 'auto';
  const theme = searchParams.get('theme') || 'light';

  return (
    <div 
      className={`embed-container ${theme === 'dark' ? 'dark' : ''}`}
      style={{ 
        height: height !== 'auto' ? `${height}px` : 'auto',
        minHeight: compact ? '300px' : '400px'
      }}
    >
      <div className="min-h-full bg-background p-2 sm:p-4 overflow-auto">
        <SpinitinonPlaylist 
          stationId={stationId}
          autoUpdate={autoUpdate}
          showSearch={showSearch}
          maxItems={maxItems}
          compact={compact}
        />
      </div>
    </div>
  );
};

export default Embed;
