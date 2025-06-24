
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { useSpotifyData } from '@/hooks/useSpotifyData';

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
  // Check Spotify first for priority system
  const { spotifyData: spotifyData, loading: spotifyLoading } = useSpotifyData(artist, song);
  const { youtubeData, loading: youtubeLoading } = useYouTubeData(artist, song);

  // Enhanced debugging with priority logic
  console.log(`🎬 YouTubePreviewButton DEBUG for ${artist} - ${song}:`, {
    spotifyLoading,
    hasSpotifyPreview: !!spotifyData?.previewUrl,
    youtubeLoading,
    hasYouTubeVideo: !!youtubeData?.videoId,
    trackId,
    fromCache: youtubeData?.fromCache,
    priority: 'YouTube (fallback when no Spotify)'
  });

  // Priority System: Only show YouTube if Spotify is not available
  if (spotifyLoading) {
    // Wait for Spotify check to complete before deciding
    return null;
  }

  if (spotifyData?.previewUrl) {
    // Spotify preview is available, don't show YouTube button
    console.log(`⚡ Spotify preview available for ${artist} - ${song}, hiding YouTube button`);
    return null;
  }

  // Show loading state while fetching YouTube data (only when Spotify is not available)
  if (youtubeLoading) {
    console.log(`⏳ Loading YouTube data for ${artist} - ${song} (Spotify not available)`);
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`${size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-red-600/80 text-white`}
        disabled
      >
        <Loader2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
      </Button>
    );
  }

  // If no YouTube data or no video ID, don't show button
  if (!youtubeData?.videoId) {
    console.log(`❌ No YouTube video available for ${artist} - ${song} (and no Spotify preview)`, {
      youtubeData,
      hasData: !!youtubeData,
      hasVideoId: youtubeData?.videoId,
      fromCache: youtubeData?.fromCache
    });
    return null;
  }

  console.log(`✅ YouTube video found for ${artist} - ${song} (Spotify not available):`, {
    videoId: youtubeData.videoId,
    fromCache: youtubeData.fromCache
  });

  const isThisTrackPlaying = currentlyPlaying === trackId;
  const isThisTrackLoading = isLoading === trackId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎬 Playing YouTube video for ${artist} - ${song}`, {
      embedUrl: youtubeData.embedUrl,
      fromCache: youtubeData.fromCache
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
      title={`Play ${song} by ${artist} on YouTube${youtubeData.fromCache ? ' (cached)' : ''} - Fallback`}
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
