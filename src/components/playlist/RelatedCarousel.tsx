
import React from "react";
import { useRelatedTracks } from "@/hooks/useRelatedTracks";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

interface Props {
  trackId?: string; // Spotify track id preferred
  isrc?: string;    // Alternate input
  title?: string;   // Optional heading override
  className?: string;
}

const RelatedCarousel: React.FC<Props> = ({ trackId, isrc, title = "You might also like", className }) => {
  const { data } = useRelatedTracks({ trackId, isrc }, !!trackId || !!isrc);

  if (!data?.items?.length) return null;

  return (
    <div className={className}>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="pl-0">
            {data.items.map((t) => (
              <CarouselItem key={t.trackId} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                <Card className="p-2 hover:bg-accent/40 transition-colors">
                  <div className="w-full">
                    <div className="aspect-square overflow-hidden rounded-md bg-muted">
                      {t.artwork ? (
                        <img
                          src={t.artwork}
                          alt={`${t.title} cover`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No artwork
                        </div>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 bg-background/90 backdrop-blur border" />
          <CarouselNext className="-right-3 bg-background/90 backdrop-blur border" />
        </Carousel>
      </div>
    </div>
  );
};

export default RelatedCarousel;
