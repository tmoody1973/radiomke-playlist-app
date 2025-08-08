import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
const supabase = createClient(supabaseUrl!, serviceRoleKey!);

function thirtyDaysFromNow() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

function buildCacheKey({ spotify_track_id, isrc, artist, title }: { spotify_track_id?: string; isrc?: string; artist?: string; title?: string; }) {
  if (spotify_track_id) return `spotify:track:${spotify_track_id}`;
  if (isrc) return `isrc:${isrc}`;
  const norm = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  return `q:${norm(artist)}|${norm(title)}`;
}

async function fetchSonglinkBySpotifyId(spotifyId: string) {
  const url = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(`https://open.spotify.com/track/${spotifyId}`)}&userCountry=US`;
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  const status = res.status;
  let json: any = null;
  try { json = await res.json(); } catch (_) { /* ignore */ }
  return { status, json };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { spotify_track_id, isrc, artist, title } = body || {};

    if (!spotify_track_id && !(artist && title) && !isrc) {
      return new Response(JSON.stringify({ error: "Missing identifiers: provide spotify_track_id or (artist + title) or isrc" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = buildCacheKey({ spotify_track_id, isrc, artist, title });
    const { data: cached, error: cacheErr } = await supabase
      .from('song_links')
      .select('data, expire_at, updated_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    const now = new Date();
    if (cached && cached.expire_at && new Date(cached.expire_at) > now) {
      return new Response(JSON.stringify({ source: 'cache', cacheKey, data: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only attempt live fetch when we have a spotify id (most reliable)
    if (!spotify_track_id) {
      // No reliable identifier to fetch; serve stale if exists, else 422
      if (cached) {
        return new Response(JSON.stringify({ source: 'stale-cache', cacheKey, data: cached.data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Insufficient identifiers to fetch from Songlink' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { status, json } = await fetchSonglinkBySpotifyId(spotify_track_id);

    if (status === 429) {
      // Rate limited: if we have stale cache, return it
      if (cached) {
        return new Response(JSON.stringify({ source: 'stale-cache', cacheKey, data: cached.data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Rate limited by Songlink', status }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (status >= 200 && status < 300 && json) {
      const expireAt = thirtyDaysFromNow();

      // Upsert primary cache entry
      await supabase.from('song_links').upsert({
        cache_key: cacheKey,
        source: 'songlink',
        data: json,
        expire_at: expireAt,
        last_status: status,
        last_error: null,
      }, { onConflict: 'cache_key' });

      // Also upsert alias keys so subsequent lookups by artist/title or ISRC hit cache
      const aliasKeys: string[] = [];
      try {
        if (artist && title) {
          const qKey = buildCacheKey({ artist, title });
          if (qKey !== cacheKey) aliasKeys.push(qKey);
        }
        if (isrc) {
          const isrcKey = buildCacheKey({ isrc });
          if (isrcKey !== cacheKey) aliasKeys.push(isrcKey);
        }
        if (spotify_track_id) {
          const spKey = buildCacheKey({ spotify_track_id });
          if (spKey !== cacheKey) aliasKeys.push(spKey);
        }
      } catch (_) { /* noop */ }

      if (aliasKeys.length) {
        const rows = aliasKeys.map((k) => ({
          cache_key: k,
          source: 'songlink',
          data: json,
          expire_at: expireAt,
          last_status: status,
          last_error: null,
        }));
        await supabase.from('song_links').upsert(rows, { onConflict: 'cache_key' });
      }

      return new Response(JSON.stringify({ source: 'fresh', cacheKey, data: json }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Non-2xx: return stale if available or error
    if (cached) {
      return new Response(JSON.stringify({ source: 'stale-cache', cacheKey, data: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch from Songlink', status }), {
      status: status || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('songlink-lookup error', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
