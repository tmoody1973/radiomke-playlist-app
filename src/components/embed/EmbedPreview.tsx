
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border rounded-lg overflow-hidden"
          style={{
            backgroundColor: '#f8f9fa',
            isolation: 'isolate'
          }}
        >
          <iframe
            key={key}
            src={embedUrl}
            width="100%"
            height={`${config.height}px`}
            style={{ 
              border: 'none',
              display: 'block',
              backgroundColor: 'transparent'
            }}
            title="Playlist Preview"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
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
