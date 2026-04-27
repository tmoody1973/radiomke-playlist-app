// SGmetadata poller for 88nine.
// Fetches the most-recent stream metadata from StreamGuys, detects songs that
// Spinitron missed (e.g. covers), inserts them into `songs`, and enriches via Spotify.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STATION_ID = "88nine";
// ±60 seconds match window vs. existing Spinitron songs.
const MATCH_WINDOW_MS = 60_000;

interface SgMetadataResponse {
  StreamTitle?: string;
  StreamUrl?: string;
  date?: string;
  timestamp?: number;
}

// Station imaging / promos that should never be treated as songs.
const PROMO_PATTERNS: RegExp[] = [
  /radio\s*milwaukee/i,
  /^88nine/i,
  /\b889\b/,
  /discover\s+new\s+music/i,
  /station\s+id/i,
  /underwriting/i,
  /promo/i,
];

// Specific (artist, song) pairs that are actually promos / imaging beds, not real spins.
const PROMO_TRACKS: Array<{ artist: string; song: string }> = [
  { artist: "Jimmy Eat World", song: "The Middle" },
];

function isPromo(artist: string, song: string): boolean {
  const combined = `${artist} ${song}`;
  if (PROMO_PATTERNS.some((re) => re.test(combined))) return true;
  const a = artist.trim().toLowerCase();
  const s = song.trim().toLowerCase();
  return PROMO_TRACKS.some((p) => p.artist.toLowerCase() === a && p.song.toLowerCase() === s);
}

function parseStreamTitle(title: string): { artist: string; song: string } | null {
  if (!title) return null;
  // Common formats: "Artist - Title", sometimes "Artist - Title (something)".
  const idx = title.indexOf(" - ");
  if (idx === -1) return null;
  const artist = title.slice(0, idx).trim();
  const song = title.slice(idx + 3).trim();
  if (!artist || !song) return null;
  return { artist, song };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    // Remove parenthetical/bracketed qualifiers like "(feat. X)", "(live)".
    .replace(/\s*[\(\[][^)\]]*[\)\]]\s*/g, " ")
    // Treat "&" as "and", then collapse non-alphanumerics to spaces.
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    // Drop common stop-words / connectors so "Belle & Sebastian" == "Belle And Sebastian"
    // and "The Beatles" == "Beatles".
    .filter((w) => w && !["the", "a", "an", "and", "of"].includes(w))
    .join(" ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SGMETADATA_API_KEY");
    const uuid = Deno.env.get("SGMETADATA_88NINE_UUID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !uuid || !supabaseUrl || !serviceKey) {
      console.error("Missing required env vars", {
        hasApiKey: !!apiKey,
        hasUuid: !!uuid,
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch current metadata from StreamGuys.
    const sgUrl = `https://jetapi.streamguys.com/${apiKey}/scraper/${uuid}/metadata`;
    const sgRes = await fetch(sgUrl);

    if (!sgRes.ok) {
      const text = await sgRes.text();
      console.error("SGmetadata fetch failed", sgRes.status, text);
      return new Response(
        JSON.stringify({ error: "SGmetadata fetch failed", status: sgRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sg: SgMetadataResponse = await sgRes.json();
    console.log("SG payload", sg);

    if (!sg.StreamTitle || !sg.timestamp) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "no stream title" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const parsed = parseStreamTitle(sg.StreamTitle);
    if (!parsed) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "unparseable title", title: sg.StreamTitle }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { artist, song } = parsed;

    // Skip station promos / imaging — never insert these as songs.
    if (isPromo(artist, song)) {
      console.log("Skipping promo/imaging", { artist, song });
      return new Response(
        JSON.stringify({ skipped: true, reason: "promo", artist, song }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const startTime = new Date(sg.timestamp).toISOString();

    // 2. Look for an existing Spinitron (or prior SG) song within the window.
    const windowStart = new Date(sg.timestamp - MATCH_WINDOW_MS).toISOString();
    const windowEnd = new Date(sg.timestamp + MATCH_WINDOW_MS).toISOString();

    const { data: nearby, error: nearbyError } = await supabase
      .from("songs")
      .select("id, artist, song, start_time, spinitron_id")
      .eq("station_id", STATION_ID)
      .gte("start_time", windowStart)
      .lte("start_time", windowEnd);

    if (nearbyError) {
      console.error("Nearby lookup failed", nearbyError);
      return new Response(
        JSON.stringify({ error: "DB lookup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normArtist = normalize(artist);
    const normSong = normalize(song);

    const match = (nearby || []).find((row) => {
      const a = normalize(row.artist || "");
      const s = normalize(row.song || "");
      // Artist must match EXACTLY (after normalization) so we don't collapse
      // covers by different artists (e.g. Gary Numan vs Cookin' On 3 Burners "Cars").
      // Song title can be a fuzzy match because of "(feat. X)", "(Live)", etc.
      const artistMatch = a === normArtist;
      const songMatch = s === normSong || s.includes(normSong) || normSong.includes(s);
      return artistMatch && songMatch;
    });

    if (match) {
      console.log("Already covered by Spinitron / prior SG", { artist, song });
      return new Response(
        JSON.stringify({ inserted: false, reason: "already_present", artist, song }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Insert the missed song. Use a synthetic negative spinitron_id derived
    // from the SG timestamp so it is unique and clearly non-Spinitron.
    const syntheticId = -Math.floor(sg.timestamp / 1000);

    const { data: inserted, error: insertError } = await supabase
      .from("songs")
      .upsert(
        {
          spinitron_id: syntheticId,
          station_id: STATION_ID,
          artist,
          song,
          start_time: startTime,
          duration: 180,
        },
        { onConflict: "spinitron_id" },
      )
      .select()
      .single();

    if (insertError) {
      console.error("Insert failed", insertError);
      return new Response(
        JSON.stringify({ error: "Insert failed", detail: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Inserted SG-only song", { id: inserted.id, artist, song });

    // 4. Try MusicBrainz first (free, handles covers well), fall back to Spotify.
    let enriched = false;
    let enrichSource: string | null = null;

    const callEnhance = async (fnName: string) => {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ artist, song }),
        });
        if (!res.ok) {
          const t = await res.text();
          console.error(`${fnName} non-ok`, res.status, t.slice(0, 200));
          return null;
        }
        const json = await res.json();
        return json?.found && json?.data ? json.data : null;
      } catch (e) {
        console.error(`${fnName} call error`, e);
        return null;
      }
    };

    // MusicBrainz first.
    let data = await callEnhance("musicbrainz-enhance");
    if (data) {
      enrichSource = "musicbrainz";
    } else {
      // Fallback to Spotify.
      data = await callEnhance("spotify-enhance");
      if (data) enrichSource = "spotify";
    }

    if (data) {
      const update: Record<string, unknown> = {
        image: data.image,
        release: data.release,
        label: data.label ?? null,
        enhanced_metadata: data.enhanced_metadata,
      };
      // Only set Spotify IDs if Spotify was the source.
      if (enrichSource === "spotify") {
        update.spotify_track_id = data.spotify_track_id;
        update.spotify_artist_id = data.spotify_artist_id;
        update.spotify_album_id = data.spotify_album_id;
      }

      const { error: updateError } = await supabase
        .from("songs")
        .update(update)
        .eq("id", inserted.id);

      if (updateError) {
        console.error("Enrichment update failed", updateError);
      } else {
        enriched = true;
      }
    }

    return new Response(
      JSON.stringify({ inserted: true, enriched, source: enrichSource, artist, song, start_time: startTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("sgmetadata-poll error", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
