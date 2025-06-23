
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  preview_url: string | null;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, song } = await req.json();
    console.log(`Searching for: "${song}" by "${artist}"`);

    if (!artist || !song) {
      console.error('Missing artist or song parameter');
      return new Response(
        JSON.stringify({ error: 'Artist and song are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Missing Spotify credentials');
      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Spotify credentials not configured' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Spotify access token
    console.log('Getting Spotify access token...');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Spotify token:', await tokenResponse.text());
      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Failed to authenticate with Spotify' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Got Spotify access token');

    // Search for the track
    const searchQuery = encodeURIComponent(`track:"${song}" artist:"${artist}"`);
    console.log('Search query:', searchQuery);
    
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('Spotify search failed:', await searchResponse.text());
      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Failed to search Spotify' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const searchData: SpotifySearchResponse = await searchResponse.json();
    console.log('Search results:', searchData.tracks.items.length, 'tracks found');
    
    if (searchData.tracks.items.length === 0) {
      console.log('No tracks found for query');
      return new Response(
        JSON.stringify({ found: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const track = searchData.tracks.items[0];
    const albumArt = track.album.images.find(img => img.height >= 300)?.url || 
                    track.album.images[0]?.url || null;

    console.log('Track found:', track.name, 'by', track.artists[0]?.name);
    console.log('Preview URL available:', !!track.preview_url);

    return new Response(
      JSON.stringify({
        found: true,
        albumName: track.album.name,
        albumArt: albumArt,
        trackName: track.name,
        artistName: track.artists[0]?.name,
        previewUrl: track.preview_url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Spotify search error:', error);
    return new Response(
      JSON.stringify({ 
        found: false,
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
