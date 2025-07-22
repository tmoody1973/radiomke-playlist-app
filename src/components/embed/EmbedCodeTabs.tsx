
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, Code, Globe } from 'lucide-react';
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
  const javascriptCode = generateJavaScriptCode(config);

  return (
    <div className="space-y-3">
      <Label>Embed Code Options</Label>
      
      <Tabs defaultValue="iframe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="iframe" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            iFrame Embed
          </TabsTrigger>
          <TabsTrigger value="javascript" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JavaScript Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iframe" className="space-y-3 mt-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">iFrame Embed (Recommended for most websites)</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Easy to implement - just copy and paste</li>
              <li>Works with any CMS (WordPress, Squarespace, etc.)</li>
              <li>Auto-resizing iframe adjusts height automatically</li>
              <li>Isolated from your site's CSS - no conflicts</li>
              <li>Includes SEO-friendly structured data</li>
            </ul>
          </div>
          <Textarea
            value={iframeCode}
            readOnly
            className="font-mono text-sm"
            rows={15}
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
        </TabsContent>

        <TabsContent value="javascript" className="space-y-3 mt-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">JavaScript Embed (Advanced - Seamless Integration)</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Seamless visual integration with your website</li>
              <li>Better performance than iframe</li>
              <li>Inherits your site's styling naturally</li>
              <li>More customization options available</li>
              <li>Requires JavaScript to be enabled</li>
            </ul>
          </div>
          <Textarea
            value={javascriptCode}
            readOnly
            className="font-mono text-sm"
            rows={15}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onCopy(javascriptCode)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy JavaScript Code
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(embedUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Preview
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Implementation Notes:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Place the HTML div where you want the playlist to appear</li>
              <li>• The JavaScript will automatically load and initialize</li>
              <li>• Multiple widgets can be placed on the same page</li>
              <li>• Widget inherits your site's fonts and basic styling</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmbedCodeTabs;
