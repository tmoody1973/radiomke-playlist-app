import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmbedConfiguration from '@/components/embed/EmbedConfiguration';
import EmbedCodeTabs from '@/components/embed/EmbedCodeTabs';
import EmbedPreview from '@/components/embed/EmbedPreview';
import SEORecommendations from '@/components/embed/SEORecommendations';

interface Station {
  id: string;
  name: string;
}

const EmbedDemo = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState('hyfin');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [maxItems, setMaxItems] = useState(20);
  const [unlimitedSongs, setUnlimitedSongs] = useState(false);
  const [compact, setCompact] = useState(false);
  const [height, setHeight] = useState('600');
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState('list');
  const [enableDateSearch, setEnableDateSearch] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch available stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('stations')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching stations:', error);
          setError('Failed to load stations. Please try refreshing the page.');
        } else if (data && data.length > 0) {
          setStations(data);
        } else {
          setError('No stations found. Please check your configuration.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const embedConfig = {
    selectedStation,
    autoUpdate,
    showSearch,
    maxItems,
    unlimitedSongs,
    compact,
    height,
    theme,
    layout,
    enableDateSearch,
    startDate,
    endDate,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Loading...</h1>
            <p className="text-muted-foreground">Setting up your embed demo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8 max-w-6xl">
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">SEO-Optimized Embed Generator</h1>
          <p className="text-xl text-muted-foreground">
            Create search engine friendly playlist embeds with built-in SEO features
          </p>
        </div>

        {/* Instructions moved to two columns */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">How to Use</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>SEO-Enhanced iFrame:</strong> Includes structured data, fallback content, and contextual information</p>
                <p>1. Select your preferred radio station from the available options</p>
                <p>2. Customize the settings below to match your needs</p>
                <p>3. Copy the generated SEO-friendly embed code</p>
                <p>4. Follow the SEO recommendations below for best results</p>
                <p><strong>Search Engine Benefits:</strong> Better indexing, rich snippets, and improved page relevance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">📏 Height Recommendations</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>600px:</strong> Shows 7-8 songs (compact, good for sidebars)</p>
                <p><strong>700px:</strong> Shows 9-10 songs (balanced height)</p>
                <p><strong>800px:</strong> Shows 11-13 songs (recommended for main content)</p>
                <p><strong>1200px:</strong> Shows all 15 songs without scrolling (very tall)</p>
                <p className="text-sm mt-3 text-blue-600 dark:text-blue-400">💡 Most websites work best with 700-800px height</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <EmbedConfiguration
                stations={stations}
                selectedStation={selectedStation}
                setSelectedStation={setSelectedStation}
                autoUpdate={autoUpdate}
                setAutoUpdate={setAutoUpdate}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                maxItems={maxItems}
                setMaxItems={setMaxItems}
                unlimitedSongs={unlimitedSongs}
                setUnlimitedSongs={setUnlimitedSongs}
                compact={compact}
                setCompact={setCompact}
                height={height}
                setHeight={setHeight}
                theme={theme}
                setTheme={setTheme}
                layout={layout}
                setLayout={setLayout}
                enableDateSearch={enableDateSearch}
                setEnableDateSearch={setEnableDateSearch}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />

              <div className="mt-6">
                <EmbedCodeTabs
                  config={embedConfig}
                  onCopy={copyToClipboard}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <EmbedPreview config={embedConfig} />
        </div>

        {/* SEO Information Section - moved below embed code */}
        <div className="mb-8">
          <SEORecommendations />
        </div>
      </div>
    </div>
  );
};

export default EmbedDemo;
