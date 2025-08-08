
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RelatedTracksResponse } from "@/types/related";

export function useRelatedTracks(params: { trackId?: string; isrc?: string }, enabled: boolean = true) {
  const { trackId, isrc } = params;

  return useQuery({
    queryKey: ["related-tracks", trackId, isrc],
    queryFn: async (): Promise<RelatedTracksResponse> => {
      console.log("🔎 Fetching related tracks", { trackId, isrc });
      const { data, error } = await supabase.functions.invoke("related-tracks", {
        body: { trackId, isrc },
      });
      if (error) {
        console.error("related-tracks function error:", error);
        throw error;
      }
      return data as RelatedTracksResponse;
    },
    enabled: enabled && (!!trackId || !!isrc),
    staleTime: 1000 * 60 * 60, // 1 hour (client cache)
    gcTime: 1000 * 60 * 60 * 2,
    meta: {
      onError: (err: any) => {
        console.error("useRelatedTracks error:", err);
      },
    },
  });
}
