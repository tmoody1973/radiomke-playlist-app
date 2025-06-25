
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useSpotifyData } from '@/hooks/useSpotifyData';

interface EnhancedAlbumArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIconSize?: string;
  artist: string;
  song: string;
}

export const EnhancedAlbumArtwork = ({ 
  src, 
  alt, 
  className = "w-12 h-12",
  fallbackIconSize = "w-4 h-4",
  artist,
  song
}: EnhancedAlbumArtworkProps) => {
  const [imageError, setImageError] = useState(false);
  const { spotifyData, loading } = useSpotifyData(artist, song);

  // Use Spotify artwork if available, otherwise fall back to original
  const finalImageSrc = spotifyData?.albumArt || src;

  // Reset error state when image source changes
  useEffect(() => {
    setImageError(false);
  }, [finalImageSrc]);

  // Show fallback icon when no image or error
  if (!finalImageSrc || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center rounded-md ${className}`}>
        <Music className={`${fallbackIconSize} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <img
      src={finalImageSrc}
      alt={alt}
      className={`rounded-md object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};
