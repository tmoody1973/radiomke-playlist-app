
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmbedDemo = () => {
  const [stationId, setStationId] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [maxItems, setMaxItems] = useState(20);
  const [compact, setCompact] = useState(false);
  const [height, setHeight] = useState('600');
  const [theme, setTheme] = useState('light');
  const { toast } = useToast();

  const generateEmbedUrl = () => {
    const params = new URLSearchParams();
    if (stationId) params.append('station', stationId);
    if (!autoUpdate) params.append('autoUpdate', 'false');
    if (!showSearch) params.append('showSearch', 'false');
    if (maxItems !== 20) params.append('maxItems', maxItems.toString());
    if (compact) params.append('compact', 'true');
    if (height !== 'auto') params.append('height', height);
    if (theme !== 'light') params.append('theme', theme);

    const baseUrl = window.location.origin;
    return `${baseUrl}/embed?${params.toString()}`;
  };

  const generateIframeCode = () => {
    const embedUrl = generateEmbedUrl();
    return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="${height}px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="Spinitron Live Playlist">
</iframe>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Embed Your Playlist</h1>
          <p className="text-xl text-muted-foreground">
            Customize and embed the Spinitron playlist widget on your website
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="station">Station ID (optional)</Label>
                <Input
                  id="station"
                  placeholder="Leave empty for default station"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxItems">Max Items</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    min="5"
                    max="100"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value) || 20)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="300"
                    max="1000"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoUpdate">Auto Update</Label>
                  <Switch
                    id="autoUpdate"
                    checked={autoUpdate}
                    onCheckedChange={setAutoUpdate}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showSearch">Show Search</Label>
                  <Switch
                    id="showSearch"
                    checked={showSearch}
                    onCheckedChange={setShowSearch}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="compact">Compact Mode</Label>
                  <Switch
                    id="compact"
                    checked={compact}
                    onCheckedChange={setCompact}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Dark Theme</Label>
                  <Switch
                    id="theme"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Embed Code</Label>
                <Textarea
                  value={generateIframeCode()}
                  readOnly
                  className="font-mono text-sm"
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(generateIframeCode())}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(generateEmbedUrl(), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={generateEmbedUrl()}
                  width="100%"
                  height={`${height}px`}
                  style={{ border: 'none' }}
                  title="Playlist Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">How to Use</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Customize the settings above to match your needs</p>
                <p>2. Copy the generated embed code</p>
                <p>3. Paste it into your website's HTML where you want the playlist to appear</p>
                <p>4. The widget will automatically update with live playlist data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmbedDemo;
