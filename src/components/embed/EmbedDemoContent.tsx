
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EmbedConfiguration from './EmbedConfiguration';
import EmbedCodeTabs from './EmbedCodeTabs';
import EmbedPreview from './EmbedPreview';

interface Station {
  id: string;
  name: string;
}

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

interface EmbedDemoContentProps {
  stations: Station[];
  selectedStation: string;
  setSelectedStation: (value: string) => void;
  autoUpdate: boolean;
  setAutoUpdate: (value: boolean) => void;
  showSearch: boolean;
  setShowSearch: (value: boolean) => void;
  maxItems: number;
  setMaxItems: (value: number) => void;
  unlimitedSongs: boolean;
  setUnlimitedSongs: (value: boolean) => void;
  compact: boolean;
  setCompact: (value: boolean) => void;
  height: string;
  setHeight: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  layout: string;
  setLayout: (value: string) => void;
  enableDateSearch: boolean;
  setEnableDateSearch: (value: boolean) => void;
  enableYouTube: boolean;
  setEnableYouTube: (value: boolean) => void;
  showHeader: boolean;
  setShowHeader: (value: boolean) => void;
  startDate?: Date;
  setStartDate: (value: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (value: Date | undefined) => void;
  embedConfig: EmbedConfig;
}

const EmbedDemoContent = ({
  stations,
  selectedStation,
  setSelectedStation,
  autoUpdate,
  setAutoUpdate,
  showSearch,
  setShowSearch,
  maxItems,
  setMaxItems,
  unlimitedSongs,
  setUnlimitedSongs,
  compact,
  setCompact,
  height,
  setHeight,
  theme,
  setTheme,
  layout,
  setLayout,
  enableDateSearch,
  setEnableDateSearch,
  enableYouTube,
  setEnableYouTube,
  showHeader,
  setShowHeader,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  embedConfig,
}: EmbedDemoContentProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
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
            enableYouTube={enableYouTube}
            setEnableYouTube={setEnableYouTube}
            showHeader={showHeader}
            setShowHeader={setShowHeader}
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
  );
};

export default EmbedDemoContent;
