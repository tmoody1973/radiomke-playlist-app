
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div 
          className="border rounded-lg flex-1 relative"
          style={{
            backgroundColor: '#f8f9fa',
            minHeight: `${iframeHeight}px`,
            overflow: 'visible' // Allow content to overflow if needed
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
              overflow: 'visible' // Ensure iframe content can overflow
            }}
            title="Playlist Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            scrolling="yes" // Enable scrolling
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Theme: {config.theme} | Height: {config.height}px | Layout: {config.layout}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedPreview;
