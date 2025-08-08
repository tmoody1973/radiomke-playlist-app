export interface Spin {
  id: number;
  artist: string;
  song: string;
  start: string;
  duration: number;
  composer?: string;
  label?: string;
  release?: string;
  image?: string;
  spotify_track_id?: string;
}

export interface UseSpinDataProps {
  stationId: string;
  maxItems: number;
  debouncedSearchTerm: string;
  startDate: string;
  endDate: string;
  dateSearchEnabled: boolean;
  autoUpdate: boolean;
  hasActiveFilters: boolean;
  offset?: number;
}

export interface PaginatedSpinData {
  spins: Spin[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number;
}

export interface SpinDatabaseRecord {
  spinitron_id: number;
  artist: string;
  song: string;
  start_time: string;
  duration: number | null;
  label: string | null;
  release: string | null;
  image: string | null;
  spotify_track_id: string | null;
}

export interface SpinApiResponse {
  items: Array<{
    id: number;
    artist: string;
    song: string;
    start: string;
    duration?: number;
    label?: string;
    release?: string;
    image?: string;
  }>;
}