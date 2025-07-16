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

  // Notify parent when loaded - immediate and simple
  useEffect(() => {
    console.log('OptimizedEmbed: Component mounted, notifying parent');
    
    const notifyLoaded = () => {
      if (window.parent !== window) {
        console.log('OptimizedEmbed: Sending embed-loaded message');
        window.parent.postMessage({ type: 'embed-loaded' }, '*');
      }
    };

    // Immediate notification
    notifyLoaded();
    
    // Backup notification after a short delay
    const backupTimeout = setTimeout(notifyLoaded, 500);

    // Error handling
    const handleError = (error: ErrorEvent) => {
      console.error('OptimizedEmbed error:', error);
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'embed-error',
          message: error.message || 'Failed to load embed content'
        }, '*');
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      clearTimeout(backupTimeout);
      window.removeEventListener('error', handleError);
    };
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

  // Apply simple theme class - much simpler approach
  useEffect(() => {
    console.log('Applying theme:', effectiveConfig.theme);
    
    // Simple theme application
    if (effectiveConfig.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveConfig.theme]);

  // Simple container styling
  const containerClass = `min-h-full ${effectiveConfig.theme === 'dark' ? 'dark' : ''}`;

  return (
    <div className={containerClass}>
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
  );
};

export default OptimizedEmbed;