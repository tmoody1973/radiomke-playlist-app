
import { useEmbedDemoState } from '@/hooks/useEmbedDemoState';
import Navigation from '@/components/Navigation';
import EmbedDemoHeader from '@/components/embed/EmbedDemoHeader';
import EmbedInstructionCards from '@/components/embed/EmbedInstructionCards';
import EmbedDemoContent from '@/components/embed/EmbedDemoContent';
import EmbedDemoLoading from '@/components/embed/EmbedDemoLoading';
import EmbedDemoError from '@/components/embed/EmbedDemoError';
import SEORecommendations from '@/components/embed/SEORecommendations';

const EmbedDemo = () => {
  const embedState = useEmbedDemoState();

  if (embedState.loading) {
    return <EmbedDemoLoading />;
  }

  if (embedState.error) {
    return <EmbedDemoError error={embedState.error} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4">
        <div className="container mx-auto py-8 max-w-6xl">
          <EmbedDemoHeader />
          <EmbedInstructionCards />
          
          <EmbedDemoContent
            stations={embedState.stations}
            selectedStation={embedState.selectedStation}
            setSelectedStation={embedState.setSelectedStation}
            autoUpdate={embedState.autoUpdate}
            setAutoUpdate={embedState.setAutoUpdate}
            showSearch={embedState.showSearch}
            setShowSearch={embedState.setShowSearch}
            maxItems={embedState.maxItems}
            setMaxItems={embedState.setMaxItems}
            unlimitedSongs={embedState.unlimitedSongs}
            setUnlimitedSongs={embedState.setUnlimitedSongs}
            compact={embedState.compact}
            setCompact={embedState.setCompact}
            height={embedState.height}
            setHeight={embedState.setHeight}
            theme={embedState.theme}
            setTheme={embedState.setTheme}
            layout={embedState.layout}
            setLayout={embedState.setLayout}
            enableDateSearch={embedState.enableDateSearch}
            setEnableDateSearch={embedState.setEnableDateSearch}
            enableYouTube={embedState.enableYouTube}
            setEnableYouTube={embedState.setEnableYouTube}
            showHeader={embedState.showHeader}
            setShowHeader={embedState.setShowHeader}
            showLoadMore={embedState.showLoadMore}
            setShowLoadMore={embedState.setShowLoadMore}
            startDate={embedState.startDate}
            setStartDate={embedState.setStartDate}
            endDate={embedState.endDate}
            setEndDate={embedState.setEndDate}
            embedConfig={embedState.embedConfig}
          />

          {/* SEO Information Section - moved below embed code */}
          <div className="mb-8">
            <SEORecommendations />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedDemo;
