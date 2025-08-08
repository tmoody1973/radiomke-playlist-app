
export interface RelatedTrack {
  trackId: string;
  title: string;
  artist: string;
  artwork: string | null;
  previewUrl: string | null;
  links: {
    spotify?: string;
    album?: string;
    artist?: string;
  };
}

export interface RelatedTracksResponse {
  items: RelatedTrack[];
  source: "spotify" | "fallback" | "cache";
  cacheKey: string;
}
