
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useOptimizedYouTubeData } from '@/hooks/useOptimizedYouTubeData';

interface YouTubePreviewButtonProps {
  artist: string;
  song: string;
  trackId: string;
  currentlyPlaying: string | null;
  isLoading: string | null;
  onPlay: (embedUrl: string, trackId: string) => void;
  size?: 'sm' | 'md';
}

export const YouTubePreviewButton = ({
  artist,
  song,
  trackId,
  currentlyPlaying,
  isLoading,
  onPlay,
  size = 'sm'
}: YouTubePreviewButtonProps) => {
  const { youtubeData, loading } = useOptimizedYouTubeData(artist, song);

  // Show loading state while fetching YouTube data
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

  // If no YouTube data or no video ID, don't show button
  if (!youtubeData?.videoId) {
    return null;
  }

  const isThisTrackPlaying = currentlyPlaying === trackId;
  const isThisTrackLoading = isLoading === trackId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎬 Playing YouTube video for ${artist} - ${song}`, {
      embedUrl: youtubeData.embedUrl,
      videoId: youtubeData.videoId
    });
    onPlay(youtubeData.embedUrl!, trackId);
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className={`${buttonSize} rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md border border-red-500`}
      disabled={isThisTrackLoading}
      title={`Play ${song} by ${artist} on YouTube`}
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
