import React, { useMemo } from 'react';
import { ListItem } from './ListItem';
import { GridItem } from './GridItem';

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
  station_id?: string;
  is_manual?: boolean;
}

interface YouTubePlayer {
  currentlyPlaying: string | null;
  isLoading: string | null;
  playVideo: (embedUrl: string, trackId: string) => void;
  stopVideo: () => void;
}

interface PlaylistContentProps {
  displayedSpins: Spin[];
  layout: 'list' | 'grid';
  compact: boolean;
  stationId: string;
  isCurrentlyPlaying: (spin: any, index: number) => boolean;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  youtubePlayer: YouTubePlayer;
  enableYouTube?: boolean;
}

// Normalize a string for fuzzy comparison (strip parentheticals, punctuation,
// stop-words, lowercase). Mirrors the edge-function normalize logic.
function normalizeTitle(s: string): string {
  return (s || '')
    .toLowerCase()
    // Strip diacritics so "Motörhead" == "Motorhead", "Beyoncé" == "Beyonce".
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*[\(\[][^)\]]*[\)\]]\s*/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w && !['the', 'a', 'an', 'and', 'of'].includes(w))
    .join(' ');
}

export const PlaylistContent = ({
  displayedSpins,
  layout,
  compact,
  stationId,
  isCurrentlyPlaying,
  formatTime,
  formatDate,
  youtubePlayer,
  enableYouTube = true,
}: PlaylistContentProps) => {
  // For each normalized song title played by 2+ distinct artists in the
  // current list, treat the earliest-played artist as the "original" and
  // flag every other artist's version as a cover. Spins are displayed
  // newest-first, so the original is the LAST occurrence in the list.
  const originalArtistBySong = useMemo(() => {
    const songToArtists = new Map<string, Set<string>>();
    const songToOriginalArtist = new Map<string, string>();
    // Walk oldest → newest so the original (earliest) wins the slot.
    for (let i = displayedSpins.length - 1; i >= 0; i--) {
      const spin = displayedSpins[i];
      const songKey = normalizeTitle(spin.song);
      const artistKey = normalizeTitle(spin.artist);
      if (!songKey || !artistKey) continue;
      if (!songToArtists.has(songKey)) songToArtists.set(songKey, new Set());
      songToArtists.get(songKey)!.add(artistKey);
      if (!songToOriginalArtist.has(songKey)) {
        songToOriginalArtist.set(songKey, artistKey);
      }
    }
    const result = new Map<string, string>();
    songToArtists.forEach((artists, song) => {
      if (artists.size > 1) {
        result.set(song, songToOriginalArtist.get(song)!);
      }
    });
    return result;
  }, [displayedSpins]);

  const isCoverSpin = (spin: Spin) => {
    const songKey = normalizeTitle(spin.song);
    const originalArtist = originalArtistBySong.get(songKey);
    if (!originalArtist) return false;
    return normalizeTitle(spin.artist) !== originalArtist;
  };

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedSpins.map((spin, index) => (
          <GridItem
            key={`${spin.id}-${spin.start}`}
            spin={spin}
            index={index}
            isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
            formatTime={formatTime}
            youtubePlayer={youtubePlayer}
            enableYouTube={enableYouTube}
            isCover={isCoverSpin(spin)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayedSpins.map((spin, index) => (
        <ListItem
          key={`${spin.id}-${spin.start}`}
          spin={spin}
          index={index}
          isCurrentlyPlaying={isCurrentlyPlaying(spin, index)}
          compact={compact}
          formatTime={formatTime}
          formatDate={formatDate}
          youtubePlayer={youtubePlayer}
          stationId={stationId}
          enableYouTube={enableYouTube}
          isCover={isCoverSpin(spin)}
        />
      ))}
    </div>
  );
};
