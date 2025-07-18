
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
  customColors?: {
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    linkColor: string;
    borderColor: string;
  };
}

export const generateEmbedUrl = (config: EmbedConfig): string => {
  const params = new URLSearchParams();
  
  // Always include station, even if it's the default
  params.append('station', config.selectedStation);
  
  if (!config.autoUpdate) params.append('autoUpdate', 'false');
  if (!config.showSearch) params.append('showSearch', 'false');
  if (!config.unlimitedSongs && config.maxItems !== 20) params.append('maxItems', config.maxItems.toString());
  if (config.unlimitedSongs) params.append('maxItems', 'unlimited');
  if (config.compact) params.append('compact', 'true');
  if (config.height !== 'auto') params.append('height', config.height);
  
  // Always include theme parameter to ensure proper theming
  params.append('theme', config.theme);
  
  if (config.layout !== 'list') params.append('layout', config.layout);
  if (config.enableDateSearch && config.startDate) params.append('startDate', config.startDate.toISOString());
  if (config.enableDateSearch && config.endDate) params.append('endDate', config.endDate.toISOString());
  
  // Add a cache-busting parameter to ensure iframe reloads when theme changes
  params.append('_t', Date.now().toString());

  const baseUrl = window.location.origin;
  return `${baseUrl}/embed?${params.toString()}`;
};
