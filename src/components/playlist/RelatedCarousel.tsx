
import React, { useMemo, useState } from "react";
import { useRelatedTracks } from "@/hooks/useRelatedTracks";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListMusic } from "lucide-react";

interface Props {
  trackId?: string; // Spotify track id preferred
  isrc?: string;    // Alternate input
  artist?: string;  // Fallback input when no trackId/ISRC
  song?: string;    // Fallback input when no trackId/ISRC
  stationId?: string;   // For DB write-back
  spinitronId?: number; // For DB write-back
  title?: string;   // Optional heading override
  className?: string;
}

const RelatedCarousel: React.FC<Props> = ({ trackId, isrc, artist, song, stationId, spinitronId, title = "You might also like", className }) => {
  const { data } = useRelatedTracks({ trackId, isrc, artist, song, stationId, spinitronId }, !!trackId || !!isrc || (!!artist && !!song));
  const [expanded, setExpanded] = useState(false);

  const items = data?.items ?? [];

  const filteredItems = useMemo(() => {
    const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    const currentTitle = norm(song);
    const currentArtist = norm(artist);
    const seen = new Set<string>();

    return items.filter((t) => {
      const isSameTrack = trackId && t.trackId === trackId;
      const isSameTitleArtist = !!song && !!artist && norm(t.title) === currentTitle && norm(t.artist) === currentArtist;
      if (isSameTrack || isSameTitleArtist) return false;
      const key = t.trackId || `${norm(t.title)}|${norm(t.artist)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items, trackId, artist, song]);

  if (!filteredItems.length) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="related-carousel"
          className="text-xs"
        >
          <ListMusic className="mr-1" size={16} /> {expanded ? "Hide" : "Related"} ({filteredItems.length})
        </Button>
      </div>

      {expanded && (
        <div id="related-carousel" className="relative group animate-fade-in mt-2">
          <Carousel className="w-full">
            <CarouselContent className="pl-0">
              {filteredItems.map((t) => (
                <CarouselItem key={t.trackId || `${t.title}-${t.artist}` } className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/8">
                  <Card className="p-1 hover:bg-accent/30 transition-colors">
                    <div className="w-full">
                      <div className="aspect-square overflow-hidden rounded-md bg-muted">
                        {t.artwork ? (
                          <img
                            src={t.artwork}
                            alt={`${t.title} by ${t.artist} cover art`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                            No artwork
                          </div>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <div className="text-xs font-medium truncate" title={t.title}>{t.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate" title={t.artist}>{t.artist}</div>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-3 bg-background/90 backdrop-blur border opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" />
            <CarouselNext className="-right-3 bg-background/90 backdrop-blur border opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default RelatedCarousel;
