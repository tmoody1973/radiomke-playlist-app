
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useSpotifyData } from '@/hooks/useSpotifyData';

interface AudioPreviewButtonProps {
  artist: string;
  song: string;
  trackId: string;
  currentlyPlaying: string | null;
  isLoading: string | null;
  onPlay: (previewUrl: string, trackId: string) => void;
  size?: 'sm' | 'md';
}

export const AudioPreviewButton = ({
  artist,
  song,
  trackId,
  currentlyPlaying,
  isLoading,
  onPlay,
  size = 'sm'
}: AudioPreviewButtonProps) => {
  const { spotifyData } = useSpotifyData(artist, song);

  if (!spotifyData?.previewUrl) {
    return null;
  }

  const isThisTrackPlaying = currentlyPlaying === trackId;
  const isThisTrackLoading = isLoading === trackId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(spotifyData.previewUrl!, trackId);
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className={`${buttonSize} rounded-full bg-black/20 hover:bg-black/40 text-white transition-all`}
      disabled={isThisTrackLoading}
    >
      {isThisTrackLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isThisTrackPlaying ? (
        <Pause className={`${iconSize} fill-current`} />
      ) : (
        <Play className={`${iconSize} fill-current`} />
      )}
    </Button>
  );
};
