import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useSongLinks } from '@/hooks/useSongLinks';
import { LinkIcon } from 'lucide-react';

interface StreamingLinksProps {
  artist: string;
  song: string;
  spotifyTrackId?: string;
  isrc?: string;
  size?: 'sm' | 'md';
}

const providersOrder = [
  { key: 'spotify', label: 'Spotify' },
  { key: 'appleMusic', label: 'Apple Music' },
  { key: 'youtubeMusic', label: 'YouTube Music' },
  { key: 'amazonMusic', label: 'Amazon Music' },
  { key: 'tidal', label: 'TIDAL' },
  { key: 'deezer', label: 'Deezer' },
  { key: 'soundcloud', label: 'SoundCloud' },
  { key: 'youtube', label: 'YouTube' },
];

export const StreamingLinks: React.FC<StreamingLinksProps> = ({ artist, song, spotifyTrackId, isrc, size = 'md' }) => {
  const { loading, error, data, source, statusCode, fetchLinks } = useSongLinks();
  const [open, setOpen] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

useEffect(() => {
  if (open && !loadedOnce && spotifyTrackId) {
    fetchLinks({ spotifyTrackId, artist, title: song, isrc: isrc || null });
    setLoadedOnce(true);
  }
}, [open, loadedOnce, fetchLinks, spotifyTrackId, artist, song, isrc]);

  const btnSize = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className={`${btnSize}`} aria-label="Listen on your favorite platform">
          <LinkIcon className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} />
          Listen
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium">Streaming links</div>
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {!loading && data && data.linksByPlatform && (
            <div className="grid grid-cols-1 gap-2">
              {providersOrder.map((p) => {
                const link = (data.linksByPlatform as any)[p.key];
                if (!link?.url) return null;
                return (
                  <a
                    key={p.key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between rounded-md border bg-card text-card-foreground hover:bg-accent px-3 py-2 transition-colors"
                  >
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="text-xs text-muted-foreground">Open</span>
                  </a>
                );
              })}
            </div>
          )}
{!loading && !data && (
            <div className="text-sm text-muted-foreground">
              {spotifyTrackId ? 'No links found.' : 'Streaming links unavailable: missing Spotify ID for this track.'}
            </div>
          )}
          {!loading && data && (!data.linksByPlatform || providersOrder.every(p => !(data.linksByPlatform as any)[p.key])) && (
            <div className="text-sm text-muted-foreground">No links available for this track.</div>
          )}
{error && (
  <div className="text-sm text-destructive">
    {statusCode === 429 ? 'Rate limit hit—please try again in a few seconds.' : error}
  </div>
)}
{source && (
  <div className="text-[10px] text-muted-foreground">Source: {source}</div>
)}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StreamingLinks;
