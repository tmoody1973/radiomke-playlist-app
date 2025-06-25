
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
        <CardTitle className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div 
          className="border border-orange-200 rounded-lg flex-1 relative shadow-sm bg-white"
          style={{
            minHeight: `${iframeHeight}px`,
            overflow: 'visible'
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
              overflow: 'visible',
              borderRadius: '6px'
            }}
            title="Playlist Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            scrolling="yes"
          />
        </div>
        <div className="mt-3 text-sm text-gray-600 bg-orange-50 rounded-md p-2 border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="font-medium text-orange-800">Theme: {config.theme}</span>
            <span className="font-medium text-orange-800">Height: {config.height}px</span>
            <span className="font-medium text-orange-800">Layout: {config.layout}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedPreview;
