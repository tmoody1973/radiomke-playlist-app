import { supabase } from '@/integrations/supabase/client';
import { Spin, SpinDatabaseRecord, SpinApiResponse } from '@/types/spinData';

export class SpinDataService {
  static async searchDatabaseSpins(
    stationId: string,
    maxItems: number,
    searchTerm: string,
    startDate: string,
    endDate: string,
    dateSearchEnabled: boolean
  ): Promise<Spin[]> {
    console.log('Searching database with filters:', {
      station: stationId,
      search: searchTerm,
      startDate: dateSearchEnabled ? startDate : '',
      endDate: dateSearchEnabled ? endDate : '',
      maxItems
    });

    let query = supabase
      .from('songs')
      .select('*')
      .eq('station_id', stationId)
      .order('start_time', { ascending: false })
      .limit(maxItems);

    // Add search filter if there's a search term
    if (searchTerm) {
      query = query.or(`artist.ilike.%${searchTerm}%,song.ilike.%${searchTerm}%`);
    }

    // Add date filters if enabled
    if (dateSearchEnabled) {
      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('start_time', endDate);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database search error:', error);
      throw error;
    }

    console.log('Database search results:', data?.length || 0, 'songs found');

    // Transform database results to match API format
    return (data || []).map(song => this.transformDatabaseRecordToSpin(song));
  }

  static async fetchApiSpins(
    stationId: string,
    maxItems: number,
    searchTerm: string,
    startDate: string,
    endDate: string,
    dateSearchEnabled: boolean
  ): Promise<Spin[]> {
    const effectiveStartDate = dateSearchEnabled ? startDate : '';
    const effectiveEndDate = dateSearchEnabled ? endDate : '';
    
    console.log('Fetching live spins with params:', {
      endpoint: 'spins',
      station: stationId,
      count: maxItems.toString(),
      search: searchTerm,
      start: effectiveStartDate,
      end: effectiveEndDate,
      dateSearchEnabled,
      timestamp: new Date().toISOString()
    });

    // Fetch fresh data from API
    const { data: apiData, error: apiError } = await supabase.functions.invoke('spinitron-proxy', {
      body: {
        endpoint: 'spins',
        station: stationId,
        count: maxItems.toString(),
        search: searchTerm,
        start: effectiveStartDate,
        end: effectiveEndDate,
        use_cache: 'false',
        _cache_bust: Date.now().toString()
      }
    });

    if (apiError) {
      console.error('Error fetching from API:', apiError);
      throw apiError;
    }

    const apiSpins = (apiData as SpinApiResponse)?.items || [];
    console.log('Received API spins:', apiSpins.length, 'for station:', stationId);

    return apiSpins.map(spin => ({
      id: spin.id,
      artist: spin.artist,
      song: spin.song,
      start: spin.start,
      duration: spin.duration || 0,
      composer: '',
      label: spin.label || '',
      release: spin.release || '',
      image: spin.image || ''
    }));
  }

  static async getDatabaseFallback(
    stationId: string,
    maxItems: number
  ): Promise<Spin[]> {
    console.log('API failed, falling back to database cache');
    
    const { data: fallbackData, error: dbError } = await supabase
      .from('songs')
      .select('*')
      .eq('station_id', stationId)
      .order('start_time', { ascending: false })
      .limit(maxItems);

    if (dbError) {
      console.error('Database fallback also failed:', dbError);
      throw dbError;
    }

    return (fallbackData || []).map(song => this.transformDatabaseRecordToSpin(song));
  }

  static async getRecentDatabaseSpins(stationId: string): Promise<Spin[]> {
    // Get recent songs from database to ensure we don't miss any
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentDbSpins } = await supabase
      .from('songs')
      .select('*')
      .eq('station_id', stationId)
      .gte('start_time', oneHourAgo)
      .order('start_time', { ascending: false });

    return (recentDbSpins || []).map(song => this.transformDatabaseRecordToSpin(song));
  }

  static mergeApiAndDatabaseSpins(
    apiSpins: Spin[],
    recentDbSpins: Spin[],
    maxItems: number
  ): Spin[] {
    // Merge API data with recent database data, removing duplicates
    const allSpins = new Map();
    
    // Add API spins first (they take priority)
    apiSpins.forEach(spin => {
      allSpins.set(spin.id, spin);
    });

    // Add recent database spins that aren't already in API results
    recentDbSpins.forEach(dbSpin => {
      if (!allSpins.has(dbSpin.id)) {
        allSpins.set(dbSpin.id, dbSpin);
      }
    });

    // Convert back to array and sort by start time (most recent first)
    const mergedSpins = Array.from(allSpins.values()).sort((a, b) => 
      new Date(b.start).getTime() - new Date(a.start).getTime()
    );

    console.log('Merged spins total:', mergedSpins.length);
    return mergedSpins.slice(0, maxItems);
  }

  private static transformDatabaseRecordToSpin(song: SpinDatabaseRecord): Spin {
    return {
      id: song.spinitron_id,
      artist: song.artist,
      song: song.song,
      start: song.start_time,
      duration: song.duration || 0,
      composer: '',
      label: song.label || '',
      release: song.release || '',
      image: song.image || '',
      spotify_track_id: song.spotify_track_id || undefined,
    };
  }

  static async fetchSpins(
    stationId: string,
    maxItems: number,
    debouncedSearchTerm: string,
    startDate: string,
    endDate: string,
    dateSearchEnabled: boolean,
    hasActiveFilters: boolean,
    offset: number = 0
  ): Promise<Spin[]> {
    // If we have active filters (search term or date filters), search the database
    if (hasActiveFilters) {
      return this.searchDatabaseSpins(
        stationId,
        maxItems,
        debouncedSearchTerm,
        startDate,
        endDate,
        dateSearchEnabled
      );
    }

    // For live data, use pagination-aware fetching
    try {
      // Reduce initial fetch to 100 songs instead of 1000 for better performance
      const effectiveMaxItems = Math.min(maxItems, 100);
      
      const apiSpins = await this.fetchApiSpins(
        stationId,
        effectiveMaxItems,
        debouncedSearchTerm,
        startDate,
        endDate,
        dateSearchEnabled
      );

      const recentDbSpins = await this.getRecentDatabaseSpins(stationId);

      return this.mergeApiAndDatabaseSpins(apiSpins, recentDbSpins, effectiveMaxItems);
    } catch (apiError) {
      // Fallback to database if API fails
      return this.getDatabaseFallback(stationId, maxItems);
    }
  }
}