
(function() {
  'use strict';
  
  // Get base URL for API calls
  function getBaseUrl() {
    const scriptTag = document.querySelector('script[src*="embed-api.js"]') || 
                     document.querySelector('script[src*="embed.js"]');
    if (scriptTag && scriptTag.src) {
      try {
        return new URL(scriptTag.src).origin;
      } catch (e) {
        console.error('Error parsing script URL:', e);
      }
    }
    return 'https://ftrivovjultfayttemce.supabase.co';
  }

  const BASE_URL = getBaseUrl();
  
  // Fetch songs from API using Supabase edge function
  async function fetchSongs(baseUrl, config, offset = 0, limit = 5, searchQuery = '') {
    try {
      // Use provided baseUrl or fall back to detected one
      const apiBaseUrl = baseUrl || BASE_URL;
      
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron API: Fetching songs with config:', config);
        console.log('Spinitron API: Using base URL:', apiBaseUrl);
      }

      const requestBody = {
        endpoint: 'spins',
        station: config.station,
        count: limit.toString(),
        offset: offset.toString(),
        search: searchQuery,
        use_cache: 'true',
        _cache_bust: Math.floor(Date.now() / 60000).toString() // Cache for 1 minute
      };
      
      if (config.startDate) requestBody.start = config.startDate;
      if (config.endDate) requestBody.end = config.endDate;

      // Add more detailed logging
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron API: Request to', `${apiBaseUrl}/functions/v1/spinitron-proxy`);
        console.log('Spinitron API: Request body:', requestBody);
      }

      const response = await fetch(`${apiBaseUrl}/functions/v1/spinitron-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (window.SpinitinonEmbedDebug) {
        console.log('Spinitron API: Response received:', data);
      }
      
      if (!data || !data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid API response format: ' + JSON.stringify(data));
      }
      
      return (data.items || []).map(item => ({
        id: item.id,
        song: item.song,
        artist: item.artist,
        start_time: item.start,
        duration: item.duration,
        image: item.image,
        release: item.release,
        label: item.label
      }));
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  // Export to global scope
  window.EmbedAPI = {
    fetchSongs,
    BASE_URL
  };
})();
