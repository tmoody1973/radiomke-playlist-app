
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RelatedTracksResponse } from "@/types/related";


type Params = {
  trackId?: string;
  isrc?: string;
  artist?: string;
  song?: string;
  stationId?: string;     // for DB write-back
  spinitronId?: number;   // for DB write-back
};

export function useRelatedTracks(params: Params, enabled: boolean = true) {
  const { trackId, isrc, artist, song, stationId, spinitronId } = params;

  return useQuery({
    queryKey: ["related-tracks", trackId, isrc, artist, song, stationId, spinitronId],
    queryFn: async (): Promise<RelatedTracksResponse> => {
      console.log("🔎 Fetching related tracks", { trackId, isrc, artist, song });
      let resolvedTrackId = trackId;
      let resolvedArtistId: string | undefined;

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

            // Write back to DB if we have identifiers and original input lacked trackId
            if (!trackId && stationId && typeof spinitronId === 'number') {
              try {
                const payload: any = {
                  spotify_track_id: resolvedTrackId,
                };
                const ed = enhanceData.data;
                if (ed.spotify_artist_id) resolvedArtistId = ed.spotify_artist_id as string;
                if (ed.spotify_album_id) payload.spotify_album_id = ed.spotify_album_id;
                if (ed.spotify_artist_id) payload.spotify_artist_id = ed.spotify_artist_id;
                if (ed.image) payload.image = ed.image;
                if (ed.release) payload.release = ed.release;
                if (ed.enhanced_metadata) payload.enhanced_metadata = ed.enhanced_metadata;

                const { error: updateError } = await supabase
                  .from('songs')
                  .update(payload)
                  .eq('station_id', stationId)
                  .eq('spinitron_id', spinitronId);
                if (updateError) {
                  console.error('❌ Failed to write back spotify_track_id:', updateError);
                } else {
                  console.log('📝 Wrote spotify_track_id to DB', { stationId, spinitronId, resolvedTrackId });
                }
              } catch (wbErr) {
                console.error('DB write-back error:', wbErr);
              }
            }
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
        body: { trackId: resolvedTrackId, isrc, artistId: resolvedArtistId },
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
