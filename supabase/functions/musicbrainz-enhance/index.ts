// MusicBrainz + Cover Art Archive enrichment.
// Free, no auth. Rate limit: 1 req/sec per IP. Always send a descriptive User-Agent.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const USER_AGENT =
  "RadioMilwaukeePlaylist/1.0 ( https://playlist.radiomilwaukee.org )";

// Strip parenthetical/bracketed qualifiers like "(cover)", "[live]".
function stripQualifiers(s: string): string {
  return s.replace(/\s*[\(\[][^)\]]*[\)\]]\s*/g, " ").replace(/\s+/g, " ").trim();
}

// Escape Lucene special characters used in MB query syntax.
function lucene(s: string): string {
  return s.replace(/([+\-!(){}\[\]^"~*?:\\\/])/g, "\\$1");
}

interface MbRecording {
  id: string;
  title: string;
  length?: number;
  "artist-credit"?: Array<{ name: string; artist: { id: string; name: string } }>;
  releases?: Array<{
    id: string;
    title: string;
    date?: string;
    "release-group"?: { id: string; "primary-type"?: string };
    "label-info"?: Array<{ label?: { name?: string } }>;
  }>;
  score?: number;
}

interface MbSearchResponse {
  recordings?: MbRecording[];
}

async function mbFetch(url: string): Promise<Response> {
  return await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, song } = await req.json();
    if (!artist || !song) {
      return new Response(
        JSON.stringify({ found: false, error: "artist and song required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanSong = stripQualifiers(song);
    const cleanArtist = stripQualifiers(artist);

    console.log("MB search", { artist: cleanArtist, song: cleanSong });

    // 1. Search recordings.
    const query =
      `recording:"${lucene(cleanSong)}" AND artist:"${lucene(cleanArtist)}"`;
    const searchUrl =
      `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=10`;

    const searchRes = await mbFetch(searchUrl);
    if (!searchRes.ok) {
      const text = await searchRes.text();
      console.error("MB search failed", searchRes.status, text.slice(0, 300));
      return new Response(
        JSON.stringify({ found: false, error: "MusicBrainz search failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const searchJson: MbSearchResponse = await searchRes.json();
    const recordings = searchJson.recordings ?? [];
    console.log(`MB found ${recordings.length} recordings`);

    if (recordings.length === 0) {
      return new Response(
        JSON.stringify({ found: false, message: "No recordings found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pick best match: highest score with at least one release that has artwork potential.
    // Prefer recordings whose artist credit matches our query (case-insensitive substring).
    const lcArtist = cleanArtist.toLowerCase();
    const best = recordings.find((r) =>
      (r["artist-credit"] ?? []).some((ac) =>
        ac.name.toLowerCase().includes(lcArtist) ||
        lcArtist.includes(ac.name.toLowerCase())
      ) && (r.releases ?? []).length > 0
    ) ?? recordings[0];

    const release = best.releases?.[0];
    const artistCredit = best["artist-credit"]?.[0];
    const label = release?.["label-info"]?.[0]?.label?.name;

    // 2. Try Cover Art Archive for the release (front cover, 500px).
    let image: string | undefined;
    if (release?.id) {
      try {
        // Use HEAD to check existence cheaply, but coverartarchive returns JSON list too.
        const caaRes = await mbFetch(
          `https://coverartarchive.org/release/${release.id}`,
        );
        if (caaRes.ok) {
          const caa = await caaRes.json();
          const front = (caa.images ?? []).find((i: any) => i.front) ??
            caa.images?.[0];
          image = front?.thumbnails?.["500"] ?? front?.thumbnails?.large ??
            front?.image;
        }
      } catch (e) {
        console.error("CAA fetch error", e);
      }
    }

    // Fallback: try release-group cover art if release-level had nothing.
    if (!image && release?.["release-group"]?.id) {
      try {
        const caaRes = await mbFetch(
          `https://coverartarchive.org/release-group/${release["release-group"].id}`,
        );
        if (caaRes.ok) {
          const caa = await caaRes.json();
          const front = (caa.images ?? []).find((i: any) => i.front) ??
            caa.images?.[0];
          image = front?.thumbnails?.["500"] ?? front?.thumbnails?.large ??
            front?.image;
        }
      } catch (e) {
        console.error("CAA group fetch error", e);
      }
    }

    const enhancedData = {
      musicbrainz_recording_id: best.id,
      musicbrainz_artist_id: artistCredit?.artist?.id,
      musicbrainz_release_id: release?.id,
      image,
      release: release?.title,
      label,
      enhanced_metadata: {
        source: "musicbrainz",
        recording_title: best.title,
        release_date: release?.date,
        duration_ms: best.length,
        all_artists: (best["artist-credit"] ?? []).map((ac) => ({
          id: ac.artist?.id,
          name: ac.artist?.name,
        })),
        label,
        score: best.score,
      },
    };

    console.log("MB enhanced data", { id: best.id, image: !!image, label });

    return new Response(
      JSON.stringify({ found: true, data: enhancedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("musicbrainz-enhance error", err);
    return new Response(
      JSON.stringify({ found: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
