
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
            backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height={`${config.height}px`}
            style={{ 
              border: 'none',
              backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff'
            }}
            title="Playlist Preview"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedPreview;
