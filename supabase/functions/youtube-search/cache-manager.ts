import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function checkCache(supabase: any, searchKey: string) {
  console.log('Checking cache for:', searchKey);
  const { data: cachedResult, error: cacheError } = await supabase
    .from('youtube_cache')
    .select('*')
    .eq('search_key', searchKey)
    .single();

  if (cacheError && cacheError.code !== 'PGRST116') {
    console.error('Cache lookup error:', cacheError);
  }

  return cachedResult;
}

export async function cacheResult(supabase: any, searchKey: string, artist: string, song: string, result?: any) {
  const cacheData = {
    search_key: searchKey,
    artist,
    song,
    found: !!result
  };

  if (result) {
    Object.assign(cacheData, {
      video_id: result.videoId,
      title: result.title,
      channel_title: result.channelTitle,
      thumbnail: result.thumbnail,
      embed_url: result.embedUrl
    });
  }

  const { error: insertError } = await supabase
    .from('youtube_cache')
    .insert(cacheData);

  if (insertError) {
    console.error('Failed to cache result:', insertError);
  } else {
    console.log('Cached result for:', searchKey);
  }
}

export function createSearchKey(artist: string, song: string): string {
  return `${artist}-${song}`.toLowerCase().replace(/[^a-z0-9]/g, '');
}