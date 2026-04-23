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
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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
      return (a === normArtist || a.includes(normArtist) || normArtist.includes(a)) &&
        (s === normSong || s.includes(normSong) || normSong.includes(s));
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

    // 4. Fire-and-await Spotify enrichment to backfill artwork/label/release.
    let enriched = false;
    try {
      const enhanceRes = await fetch(`${supabaseUrl}/functions/v1/spotify-enhance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ artist, song }),
      });

      if (enhanceRes.ok) {
        const enhanceJson = await enhanceRes.json();
        if (enhanceJson.found && enhanceJson.data) {
          const d = enhanceJson.data;
          const { error: updateError } = await supabase
            .from("songs")
            .update({
              spotify_track_id: d.spotify_track_id,
              spotify_artist_id: d.spotify_artist_id,
              spotify_album_id: d.spotify_album_id,
              image: d.image,
              release: d.release,
              enhanced_metadata: d.enhanced_metadata,
            })
            .eq("id", inserted.id);

          if (updateError) {
            console.error("Spotify update failed", updateError);
          } else {
            enriched = true;
          }
        }
      } else {
        const t = await enhanceRes.text();
        console.error("spotify-enhance non-ok", enhanceRes.status, t);
      }
    } catch (e) {
      console.error("Enrichment error", e);
    }

    return new Response(
      JSON.stringify({ inserted: true, enriched, artist, song, start_time: startTime }),
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
