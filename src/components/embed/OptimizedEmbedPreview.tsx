import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePreviewUrl } from './EmbedCodeGenerator';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';

interface EmbedConfig {
  selectedStation: string;
  autoUpdate: boolean;
  showSearch: boolean;
  maxItems: number;
  unlimitedSongs: boolean;
  compact: boolean;
  height: string;
  theme: string;
  layout: string;
  enableDateSearch: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface EmbedPreviewProps {
  config: EmbedConfig;
}

const OptimizedEmbedPreview = ({ config }: EmbedPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<EmbedConfig>(config);
  
  // Debounced config updates to prevent rapid iframe reloads
  const debouncedUpdateConfig = useCallback((newConfig: EmbedConfig) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const lastConfig = lastConfigRef.current;
      
      // Check if we need a full reload (station change) or can use postMessage
      const needsReload = (
        newConfig.selectedStation !== lastConfig.selectedStation ||
        newConfig.enableDateSearch !== lastConfig.enableDateSearch ||
        (newConfig.startDate?.getTime() !== lastConfig.startDate?.getTime()) ||
        (newConfig.endDate?.getTime() !== lastConfig.endDate?.getTime())
      );
      
      if (needsReload) {
        setIsLoading(true);
        setKey(prev => prev + 1);
      } else {
        // Use postMessage for cosmetic changes
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'config-update',
            config: newConfig
          }, '*');
        }
      }
      
      lastConfigRef.current = newConfig;
    }, 300); // 300ms debounce
  }, []);

  // Update config when props change
  useEffect(() => {
    debouncedUpdateConfig(config);
  }, [config, debouncedUpdateConfig]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Preview received message:', event.data);
      if (event.data.type === 'embed-loaded') {
        console.log('Embed loaded successfully');
        setIsLoading(false);
        setError(null);
      } else if (event.data.type === 'embed-error') {
        console.log('Embed error:', event.data.message);
        setError(event.data.message || 'Failed to load preview');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Generate preview URL with optimization flags and cache-busting
  const embedUrl = generatePreviewUrl({
    ...config,
    maxItems: Math.min(config.maxItems, 10), // Limit to 10 items for preview
    autoUpdate: false, // Disable auto-update in preview
  });

  const iframeHeight = parseInt(config.height) || 600;

  const retryLoad = () => {
    setError(null);
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  return (
    <Card className="h-full flex flex-col bg-slate-900 border-slate-700">
      <CardHeader className="bg-slate-900 border-b border-slate-700">
        <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
          Live Preview
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 bg-slate-900 p-4">
        <div 
          className="border border-slate-600 rounded-lg flex-1 relative shadow-lg bg-slate-800"
          style={{
            minHeight: `${iframeHeight}px`,
            overflow: 'hidden'
          }}
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 p-4 space-y-3">
              <Skeleton className="h-8 w-full bg-slate-700" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded bg-slate-700" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-slate-700" />
                      <Skeleton className="h-3 w-1/2 bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 p-4 flex items-center justify-center">
              <Alert className="max-w-sm">
                <AlertDescription className="text-center">
                  {error}
                  <button 
                    onClick={retryLoad}
                    className="block mt-2 mx-auto text-orange-400 hover:text-orange-300 underline"
                  >
                    Retry
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            key={`optimized-embed-${key}`}
            src={embedUrl}
            width="100%"
            height={`${iframeHeight}px`}
            style={{ 
              border: 'none',
              display: 'block',
              backgroundColor: config.theme === 'dark' ? '#1e293b' : '#ffffff',
              borderRadius: '6px',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
            title="Playlist Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="eager"
            scrolling="yes"
            onLoad={() => {
              console.log('Iframe onLoad fired');
              // Reduced fallback timeout to 1 second
              setTimeout(() => {
                if (isLoading) {
                  console.log('Fallback: forcing loading to false after 1 second');
                  setIsLoading(false);
                }
              }, 1000);
            }}
          />
        </div>
        
        <div className="mt-3 text-sm text-slate-300 bg-slate-800 rounded-md p-3 border border-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-medium text-orange-400">Theme: {config.theme}</span>
            <span className="font-medium text-orange-400">Height: {config.height}px</span>
            <span className="font-medium text-orange-400">Layout: {config.layout}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 text-center">
            Preview shows max 10 items • Full functionality in production embed
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedEmbedPreview;