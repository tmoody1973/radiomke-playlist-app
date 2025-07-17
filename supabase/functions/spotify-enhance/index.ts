import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    images: Array<{ url: string; height: number; width: number }>
    release_date: string
  }
  duration_ms: number
  external_urls: {
    spotify: string
  }
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { artist, song } = await req.json()

    if (!artist || !song) {
      throw new Error('Artist and song are required')
    }

    console.log(`Searching Spotify for: "${artist}" - "${song}"`)

    // Get Spotify access token
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured')
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const { access_token } = await tokenResponse.json()

    // Search for the track
    const searchQuery = encodeURIComponent(`artist:"${artist}" track:"${song}"`)
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      }
    )

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed')
    }

    const searchData: SpotifySearchResponse = await searchResponse.json()
    const tracks = searchData.tracks.items

    console.log(`Found ${tracks.length} tracks`)

    if (tracks.length === 0) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: 'No tracks found on Spotify' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the best match (exact or closest)
    const bestMatch = tracks.find(track => 
      track.artists.some(a => 
        a.name.toLowerCase().includes(artist.toLowerCase()) ||
        artist.toLowerCase().includes(a.name.toLowerCase())
      ) &&
      (track.name.toLowerCase().includes(song.toLowerCase()) ||
       song.toLowerCase().includes(track.name.toLowerCase()))
    ) || tracks[0]

    const enhancedData = {
      spotify_track_id: bestMatch.id,
      spotify_artist_id: bestMatch.artists[0]?.id,
      spotify_album_id: bestMatch.album.id,
      image: bestMatch.album.images[0]?.url,
      release: bestMatch.album.name,
      enhanced_metadata: {
        spotify_url: bestMatch.external_urls.spotify,
        album_images: bestMatch.album.images,
        release_date: bestMatch.album.release_date,
        duration_ms: bestMatch.duration_ms,
        all_artists: bestMatch.artists.map(a => ({ id: a.id, name: a.name }))
      }
    }

    console.log('Enhanced data:', enhancedData)

    return new Response(
      JSON.stringify({ 
        found: true, 
        data: enhancedData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in spotify-enhance function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        found: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})