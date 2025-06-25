
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateEmbedUrl } from './EmbedCodeGenerator';
import { useEffect, useState } from 'react';

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

const EmbedPreview = ({ config }: EmbedPreviewProps) => {
  const [key, setKey] = useState(0);
  const embedUrl = generateEmbedUrl(config);

  // Force iframe to reload when theme changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [config.theme, config.layout, config.height]);

  // Calculate proper iframe height with extra padding for Load More button
  const baseHeight = parseInt(config.height) || 600;
  const iframeHeight = baseHeight + 100; // Add extra space for Load More button

  return (
    <Card className="h-full flex flex-col border-orange-200 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <div 
          className="border-2 border-orange-300 rounded-lg flex-1 relative shadow-lg"
          style={{
            backgroundColor: '#ffffff',
            minHeight: `${iframeHeight}px`,
            overflow: 'visible !important',
            boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)'
          }}
        >
          <iframe
            key={key}
            src={embedUrl}
            width="100%"
            height={`${iframeHeight}px`}
            style={{ 
              border: 'none',
              display: 'block',
              backgroundColor: 'transparent',
              overflow: 'visible !important',
              borderRadius: '6px'
            }}
            title="Playlist Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            scrolling="yes"
          />
        </div>
        <div className="mt-3 text-sm text-muted-foreground bg-gradient-to-r from-orange-100 to-orange-50 p-2 rounded border border-orange-200">
          <span className="font-medium text-orange-800">Preview Settings:</span> 
          <span className="text-orange-700">
            Theme: {config.theme} | Height: {config.height}px | Layout: {config.layout}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedPreview;
