
import { User } from 'lucide-react';
import { useSpotifyData } from '@/hooks/useSpotifyData';

interface Spin {
  id: number;
  artist: string;
  song: string;
  start: string;
  duration: number;
  composer?: string;
  label?: string;
  release?: string;
  image?: string;
}

interface EnhancedSongInfoProps {
  spin: Spin;
  compact?: boolean;
}

export const EnhancedSongInfo = ({ 
  spin, 
  compact = false 
}: EnhancedSongInfoProps) => {
  const { spotifyData } = useSpotifyData(spin.artist, spin.song);

  // Use Spotify data if available, otherwise fall back to original
  const displayTitle = spotifyData?.trackName || spin.song;
  const displayArtist = spotifyData?.artistName || spin.artist;
  const displayAlbum = spotifyData?.albumName || spin.release;

  return (
    <div className="flex-1 min-w-0">
      <h3 className={`font-semibold truncate ${compact ? "text-sm" : ""}`}>
        {displayTitle}
      </h3>
      <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
        <User className="inline h-3 w-3 mr-1" />
        {displayArtist}
      </p>
      {spin.composer && (
        <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
          Composer: {spin.composer}
        </p>
      )}
      {spin.label && (
        <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
          Label: {spin.label}
        </p>
      )}
      {displayAlbum && (
        <p className={`text-muted-foreground truncate ${compact ? "text-xs" : "text-sm"}`}>
          Album: {displayAlbum}
        </p>
      )}
    </div>
  );
};
