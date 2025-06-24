
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateEmbedUrl } from './EmbedCodeGenerator';

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
  const embedUrl = generateEmbedUrl(config);

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
