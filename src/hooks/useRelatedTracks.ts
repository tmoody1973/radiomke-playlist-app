
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RelatedTracksResponse } from "@/types/related";


type Params = {
  trackId?: string;
  isrc?: string;
  artist?: string;
  song?: string;
};

export function useRelatedTracks(params: Params, enabled: boolean = true) {
  const { trackId, isrc, artist, song } = params;

  return useQuery({
    queryKey: ["related-tracks", trackId, isrc, artist, song],
    queryFn: async (): Promise<RelatedTracksResponse> => {
      console.log("🔎 Fetching related tracks", { trackId, isrc, artist, song });
      let resolvedTrackId = trackId;

      // If we don't have a trackId or ISRC but have artist/song, try to enhance via Spotify
      if (!resolvedTrackId && !isrc && artist && song) {
        try {
          const { data: enhanceData, error: enhanceError } = await supabase.functions.invoke("spotify-enhance", {
            body: { artist, song },
          });
          if (enhanceError) {
            console.error("spotify-enhance function error:", enhanceError);
          } else if (enhanceData?.found && enhanceData?.data?.spotify_track_id) {
            resolvedTrackId = enhanceData.data.spotify_track_id as string;
            console.log("✅ Resolved Spotify track id from enhance:", resolvedTrackId);
          } else {
            console.warn("spotify-enhance did not return a track id", enhanceData);
          }
        } catch (e) {
          console.error("spotify-enhance invocation failed:", e);
        }
      }

      if (!resolvedTrackId && !isrc) {
        // Nothing to query with
        return { items: [], source: "cache", cacheKey: "no-input" } as RelatedTracksResponse;
      }

      const { data, error } = await supabase.functions.invoke("related-tracks", {
        body: { trackId: resolvedTrackId, isrc },
      });
      if (error) {
        console.error("related-tracks function error:", error);
        throw error;
      }
      return data as RelatedTracksResponse;
    },
    enabled: enabled && (!!trackId || !!isrc || (!!artist && !!song)),
    staleTime: 1000 * 60 * 60, // 1 hour (client cache)
    gcTime: 1000 * 60 * 60 * 2,
    meta: {
      onError: (err: any) => {
        console.error("useRelatedTracks error:", err);
      },
    },
  });
}
