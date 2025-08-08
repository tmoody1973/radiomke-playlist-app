
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};

type RelatedItem = {
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
};

type RelatedResponse = {
  items: RelatedItem[];
  source: "spotify" | "fallback" | "cache";
  cacheKey: string;
};

async function getSpotifyToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) return null;

  const tokenResp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResp.ok) {
    console.error("Failed to get Spotify token:", await tokenResp.text());
    return null;
  }

  const { access_token } = await tokenResp.json();
  return access_token as string;
}

async function searchTrackIdByISRC(isrc: string, token: string): Promise<string | null> {
  const url = `https://api.spotify.com/v1/search?q=isrc:${encodeURIComponent(isrc)}&type=track&limit=1`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) {
    console.error("Spotify ISRC search failed:", await resp.text());
    return null;
  }
  const data = await resp.json();
  const id = data?.tracks?.items?.[0]?.id || null;
  return id;
}

function normalizeSpotifyItems(tracks: any[]): RelatedItem[] {
  return (tracks || []).map((t: any) => {
    const artwork =
      t?.album?.images?.[0]?.url ||
      t?.album?.images?.[1]?.url ||
      t?.album?.images?.[2]?.url ||
      null;
    const primaryArtist = t?.artists?.[0];
    return {
      trackId: t?.id,
      title: t?.name,
      artist: primaryArtist?.name || "",
      artwork,
      previewUrl: t?.preview_url || null,
      links: {
        spotify: t?.external_urls?.spotify,
        album: t?.album?.external_urls?.spotify,
        artist: primaryArtist?.external_urls?.spotify,
      },
    } as RelatedItem;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { trackId, isrc, artistId } = await req.json().catch(() => ({}));
    if (!trackId && !isrc) {
      return new Response(
        JSON.stringify({ error: "Missing trackId or isrc" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build cache key (include artist when present)
    const seedPart = trackId ? `track:${trackId}` : `isrc:${isrc}`;
    const cacheKey = `related:${seedPart}${artistId ? `:artist:${artistId}` : ""}`;

    // 1) Check cache (valid TTL)
    const { data: cached, error: cacheErr } = await supabase
      .from("api_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cacheErr) {
      console.error("api_cache lookup error:", cacheErr);
    }

    if (cached?.payload) {
      const payload: RelatedResponse = { ...cached.payload, source: "cache", cacheKey };
      return new Response(
        JSON.stringify(payload),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400",
          },
        }
      );
    }

    // 2) Try Spotify Recommendations
    let items: RelatedItem[] | null = null;
    let source: "spotify" | "fallback" = "fallback";

    const token = await getSpotifyToken();
    let seedTrackId = trackId as string | null;

    if (!seedTrackId && isrc && token) {
      seedTrackId = await searchTrackIdByISRC(isrc, token);
    }

    // Attempt to resolve a seed artist id
    let seedArtistId: string | null = (artistId as string) || null;

    if (!seedArtistId && seedTrackId) {
      // Try DB first for enhanced_metadata
      const { data: seedSongRow, error: seedSongErr } = await supabase
        .from("songs")
        .select("enhanced_metadata")
        .eq("spotify_track_id", seedTrackId)
        .limit(1)
        .maybeSingle();
      if (seedSongErr) console.error("songs enhanced_metadata lookup error:", seedSongErr);
      seedArtistId = seedSongRow?.enhanced_metadata?.all_artists?.[0]?.id || null;
    }

    if (token && (seedTrackId || seedArtistId)) {
      // If still no artist id but we have a track id, fetch track details from Spotify
      let seedArtistName: string | null = null;
      if (!seedArtistId && seedTrackId) {
        try {
          const trackResp = await fetch(`https://api.spotify.com/v1/tracks/${encodeURIComponent(seedTrackId)}?market=US`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (trackResp.ok) {
            const trackData = await trackResp.json();
            seedArtistId = trackData?.artists?.[0]?.id || null;
            seedArtistName = trackData?.artists?.[0]?.name || null;
          } else {
            console.error("Spotify track fetch failed:", trackResp.status, await trackResp.text());
          }
        } catch (e) {
          console.error("Spotify track fetch failed:", e);
        }
      }

      const params = new URLSearchParams();
      params.set("limit", "12");
      params.set("market", "US");
      if (seedTrackId) params.set("seed_tracks", seedTrackId);
      if (seedArtistId) params.set("seed_artists", seedArtistId);

      const recUrl = `https://api.spotify.com/v1/recommendations?${params.toString()}`;
      const recResp = await fetch(recUrl, { headers: { Authorization: `Bearer ${token}` } });

      const extractArtistId = (artistUrl?: string) => {
        if (!artistUrl) return null;
        const m = artistUrl.match(/\/artist\/([a-zA-Z0-9]+)(?:[?#].*)?$/);
        return m?.[1] || null;
      };

      if (recResp.ok) {
        const recData = await recResp.json();
        let firstBatch = normalizeSpotifyItems(recData?.tracks || []);
        // Filter: remove seed track, remove same-artist as seed artist, and dedupe by trackId
        const seen = new Set<string>();
        firstBatch = (firstBatch || []).filter((i) => {
          if (!i.trackId || i.trackId === seedTrackId) return false;
          const itemArtistId = extractArtistId(i.links?.artist);
          if (seedArtistId && itemArtistId && itemArtistId === seedArtistId) return false;
          if (seedArtistName && i.artist && i.artist.toLowerCase() === seedArtistName.toLowerCase()) return false;
          if (seen.has(i.trackId)) return false;
          seen.add(i.trackId);
          return true;
        });

        items = firstBatch;
        source = "spotify";

        // If too few items, enrich via related artists recommendations
        if ((items?.length || 0) < 6 && seedArtistId) {
          try {
            const relResp = await fetch(`https://api.spotify.com/v1/artists/${encodeURIComponent(seedArtistId)}/related-artists`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (relResp.ok) {
              const relData = await relResp.json();
              const relatedIds: string[] = (relData?.artists || [])
                .map((a: any) => a?.id)
                .filter((id: string | null) => !!id && id !== seedArtistId)
                .slice(0, 5);

              if (relatedIds.length) {
                const rp = new URLSearchParams();
                rp.set("limit", "12");
                rp.set("market", "US");
                rp.set("seed_artists", relatedIds.join(","));
                const moreUrl = `https://api.spotify.com/v1/recommendations?${rp.toString()}`;
                const moreResp = await fetch(moreUrl, { headers: { Authorization: `Bearer ${token}` } });
                if (moreResp.ok) {
                  const moreData = await moreResp.json();
                  const moreItems = normalizeSpotifyItems(moreData?.tracks || []);
                  for (const i of moreItems) {
                    if (!i.trackId) continue;
                    const itemArtistId = extractArtistId(i.links?.artist);
                    if (seedArtistId && itemArtistId && itemArtistId === seedArtistId) continue;
                    if (seedArtistName && i.artist && i.artist.toLowerCase() === seedArtistName.toLowerCase()) continue;
                    if (seen.has(i.trackId)) continue;
                    seen.add(i.trackId);
                    items!.push(i);
                  }
                } else {
                  console.error("Related-artist recommendations failed:", moreResp.status, await moreResp.text());
                }
              }
            } else {
              console.error("Fetch related artists failed:", relResp.status, await relResp.text());
            }
          } catch (e) {
            console.error("Related artists enrichment failed:", e);
          }
        }
      } else {
        console.error("Spotify recommendations failed:", recResp.status, await recResp.text());
      }
    }

    // 3) Fallback via our DB: "more by this artist"
    if (!items || items.length === 0) {
      let artistName: string | null = null;

      if (seedTrackId) {
        // Try to derive artist from songs table (where spotify_track_id = seedTrackId)
        const { data: songRow, error: songErr } = await supabase
          .from("songs")
          .select("artist, song, image, spotify_track_id, spotify_album_id, enhanced_metadata")
          .eq("spotify_track_id", seedTrackId)
          .limit(1)
          .maybeSingle();

        if (songErr) console.error("songs lookup error:", songErr);
        artistName = songRow?.artist || null;

        if (artistName) {
          const { data: moreSongs, error: moreErr } = await supabase
            .from("songs")
            .select("artist, song, image, spotify_track_id, enhanced_metadata")
            .ilike("artist", artistName)
            .order("created_at", { ascending: false })
            .limit(12);

          if (moreErr) {
            console.error("fallback songs query error:", moreErr);
          } else {
            const normalized = (moreSongs || []).map((s: any) => ({
              trackId: s.spotify_track_id || `${s.artist}-${s.song}`.toLowerCase().replace(/[^a-z0-9]/g, ""),
              title: s.song,
              artist: s.artist,
              artwork: s.image || null,
              previewUrl: null,
              links: {},
            })) as RelatedItem[];

            items = normalized;
            source = "fallback";
          }
        }
      }
    }

    const payload: RelatedResponse = {
      items: items || [],
      source,
      cacheKey,
    };

    // 4) Cache the result for 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: upsertErr } = await supabase
      .from("api_cache")
      .upsert(
        { cache_key: cacheKey, payload, expires_at: expiresAt },
        { onConflict: "cache_key" }
      );

    if (upsertErr) {
      console.error("api_cache upsert error:", upsertErr);
    }

    return new Response(
      JSON.stringify(payload),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e: any) {
    console.error("related-tracks error:", e?.message || e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
