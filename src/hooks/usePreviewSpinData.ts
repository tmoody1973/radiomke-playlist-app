import { useState, useEffect } from 'react';
import { useEmbedCache } from './useEmbedCache';
import { Spin } from '@/types/spinData';

interface PreviewSpinDataProps {
  stationId: string;
  maxItems?: number;
}

// Static preview data for immediate loading
const generatePreviewData = (stationId: string, count: number = 5): Spin[] => {
  const sampleArtists = [
    'The Beatles', 'Miles Davis', 'Radiohead', 'Stevie Wonder', 'Nina Simone',
    'Led Zeppelin', 'Joni Mitchell', 'Prince', 'David Bowie', 'Aretha Franklin'
  ];
  
  const sampleSongs = [
    'Sample Song 1', 'Demo Track', 'Preview Music', 'Test Audio', 'Example Tune',
    'Mock Recording', 'Placeholder Song', 'Sample Audio', 'Demo Music', 'Preview Track'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: 900000 + i,
    artist: sampleArtists[i % sampleArtists.length],
    song: `${sampleSongs[i % sampleSongs.length]} ${i + 1}`,
    start: new Date(Date.now() - (i * 3 * 60 * 1000)).toISOString(),
    duration: 180 + (i * 30),
    release: i % 3 === 0 ? 'Sample Album' : undefined,
    label: i % 4 === 0 ? 'Demo Records' : undefined,
    image: undefined,
  }));
};

export const usePreviewSpinData = ({ stationId, maxItems = 5 }: PreviewSpinDataProps) => {
  const [spins, setSpins] = useState<Spin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useEmbedCache<Spin[]>(`preview_spins_${stationId}`);

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get cached data first
        const cacheKey = `${stationId}_${maxItems}`;
        let cachedData = cache.get(cacheKey);
        
        if (cachedData && cachedData.length > 0) {
          setSpins(cachedData.slice(0, maxItems));
          setIsLoading(false);
          return;
        }

        // Generate static preview data for immediate display
        const previewData = generatePreviewData(stationId, maxItems);
        setSpins(previewData);
        
        // Cache the preview data
        cache.set(cacheKey, previewData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Preview data error:', err);
        setError('Failed to load preview data');
        
        // Fallback to static data even on error
        const fallbackData = generatePreviewData(stationId, maxItems);
        setSpins(fallbackData);
        setIsLoading(false);
      }
    };

    loadPreviewData();
  }, [stationId, maxItems]);

  return {
    spins,
    isLoading,
    error,
    totalCount: spins.length,
    hasNextPage: false,
    loadMore: () => Promise.resolve(),
  };
};