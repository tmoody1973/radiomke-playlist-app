
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { generateEmbedUrl, generateIframeCode } from './EmbedCodeGenerator';

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

interface EmbedCodeTabsProps {
  config: EmbedConfig;
  onCopy: (text: string) => void;
}

const EmbedCodeTabs = ({ config, onCopy }: EmbedCodeTabsProps) => {
  const embedUrl = generateEmbedUrl(config);
  const iframeCode = generateIframeCode(config);

  return (
    <div className="space-y-3">
      <Label>Embed Code</Label>
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground mb-2">
          Auto-resizing iframe - adjusts height automatically when content changes
        </div>
        <Textarea
          value={iframeCode}
          readOnly
          className="font-mono text-sm"
          rows={12}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => onCopy(iframeCode)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy iFrame Code
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(embedUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeTabs;
