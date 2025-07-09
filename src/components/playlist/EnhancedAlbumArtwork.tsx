
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

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
  className = "",
  fallbackIconSize = "w-6 h-6",
  artist,
  song
}: EnhancedAlbumArtworkProps) => {
  const [imageError, setImageError] = useState(false);

  // Use the provided image source
  const finalImageSrc = src;

  // Reset error state when image source changes
  useEffect(() => {
    setImageError(false);
  }, [finalImageSrc]);

  // Show fallback icon when no image or error
  if (!finalImageSrc || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Music className={`${fallbackIconSize} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <img
      src={finalImageSrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};
