
import BasicConfiguration from './configuration/BasicConfiguration';
import DisplayConfiguration from './configuration/DisplayConfiguration';
import DateSearchConfiguration from './configuration/DateSearchConfiguration';
import ThemeCustomizer from './ThemeCustomizer';

interface Station {
  id: string;
  name: string;
}

interface CustomColors {
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  linkColor: string;
  borderColor: string;
}

interface EmbedConfigurationProps {
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
  startDate?: Date;
  setStartDate: (value: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (value: Date | undefined) => void;
  customColors?: CustomColors;
  setCustomColors: (colors: CustomColors | undefined) => void;
}

const EmbedConfiguration = ({
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
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  customColors,
  setCustomColors,
}: EmbedConfigurationProps) => {
  return (
    <div className="space-y-6">
      <BasicConfiguration
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
      />

      <DisplayConfiguration
        height={height}
        setHeight={setHeight}
        theme={theme}
        setTheme={setTheme}
        layout={layout}
        setLayout={setLayout}
      />

      <DateSearchConfiguration
        enableDateSearch={enableDateSearch}
        setEnableDateSearch={setEnableDateSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <ThemeCustomizer
        customColors={customColors}
        onColorsChange={setCustomColors}
      />
    </div>
  );
};

export default EmbedConfiguration;
