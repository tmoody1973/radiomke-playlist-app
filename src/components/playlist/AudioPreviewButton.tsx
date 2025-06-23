
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
  const { spotifyData, loading } = useSpotifyData(artist, song);

  // Debug logging
  console.log(`AudioPreviewButton for ${artist} - ${song}:`, {
    loading,
    spotifyData,
    hasPreviewUrl: !!spotifyData?.previewUrl
  });

  // Show loading state while fetching Spotify data
  if (loading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`${size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-black/20 text-white`}
        disabled
      >
        <Loader2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
      </Button>
    );
  }

  // If no Spotify data or no preview URL, don't show button
  if (!spotifyData?.previewUrl) {
    console.log(`No preview available for ${artist} - ${song}`);
    return null;
  }

  const isThisTrackPlaying = currentlyPlaying === trackId;
  const isThisTrackLoading = isLoading === trackId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Playing preview for ${artist} - ${song}`, spotifyData.previewUrl);
    onPlay(spotifyData.previewUrl!, trackId);
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className={`${buttonSize} rounded-full bg-green-600 hover:bg-green-700 text-white transition-all shadow-md border border-green-500`}
      disabled={isThisTrackLoading}
      title={`Preview ${song} by ${artist}`}
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
