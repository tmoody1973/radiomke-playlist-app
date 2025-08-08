
(function() {
  'use strict';
  
  // Fetch songs from API using Supabase edge function
  async function fetchSongs(baseUrl, config, offset = 0, limit = 5, searchQuery = '') {
    try {
      const requestBody = {
        endpoint: 'spins',
        station: config.station,
        count: limit.toString(),
        offset: offset.toString(),
        search: searchQuery,
        use_cache: 'false',
        _cache_bust: Date.now().toString()
      };
      
      if (config.startDate) requestBody.start = config.startDate;
      if (config.endDate) requestBody.end = config.endDate;

      // Always call the Supabase Edge Function domain, not the site origin
      const SUPABASE_BASE = 'https://ftrivovjultfayttemce.supabase.co';
      const response = await fetch(`${SUPABASE_BASE}/functions/v1/spinitron-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match expected format
      const songs = (data.items || []).map(item => ({
        id: item.id,
        song: item.song,
        artist: item.artist,
        start_time: item.start,
        duration: item.duration,
        image: item.image,
        release: item.release,
        label: item.label
      }));

      return songs;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  // Export to global scope
  window.EmbedAPI = {
    fetchSongs
  };
})();
