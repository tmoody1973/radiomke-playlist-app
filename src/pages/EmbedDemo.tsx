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
import EmbedInstructions from '@/components/embed/EmbedInstructions';

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
  const [scrollSpeed, setScrollSpeed] = useState(60);
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
    scrollSpeed,
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
                scrollSpeed={scrollSpeed}
                setScrollSpeed={setScrollSpeed}
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

        <div className="mt-8 text-center">
          <EmbedInstructions />
        </div>
      </div>
    </div>
  );
};

export default EmbedDemo;
