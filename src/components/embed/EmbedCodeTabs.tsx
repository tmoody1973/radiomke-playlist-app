
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, ExternalLink } from 'lucide-react';
import { generateEmbedUrl, generateIframeCode, generateJavaScriptCode } from './EmbedCodeGenerator';

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
  enableYouTube: boolean;
  showHeader: boolean;
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
  const jsCode = generateJavaScriptCode(config);

  return (
    <div className="space-y-3">
      <Label>Embed Code</Label>
      <Tabs defaultValue="iframe" className="w-full">
        <TabsList>
          <TabsTrigger value="iframe">iFrame</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        </TabsList>

        <TabsContent value="iframe" className="space-y-3">
          <div className="text-sm text-muted-foreground mb-2">
            Auto-resizing iframe — adjusts height automatically when content changes
          </div>
          <Textarea value={iframeCode} readOnly className="font-mono text-sm" rows={12} />
          <div className="flex gap-2">
            <Button onClick={() => onCopy(iframeCode)} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy iFrame Code
            </Button>
            <Button variant="outline" onClick={() => window.open(embedUrl, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-3">
          <div className="text-sm text-muted-foreground mb-2">
            JavaScript embed renders directly in-page for better UX and SEO. Includes JSON-LD and a noscript fallback.
          </div>
          <Textarea value={jsCode} readOnly className="font-mono text-sm" rows={12} />
          <div className="flex gap-2">
            <Button onClick={() => onCopy(jsCode)} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy JavaScript
            </Button>
            <Button variant="outline" onClick={() => window.open(embedUrl, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmbedCodeTabs;
