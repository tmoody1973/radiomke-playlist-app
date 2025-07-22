
(function() {
  'use strict';
  
  // Get base URL for API calls - ensuring we always use the Supabase URL for API requests
  function getBaseUrl() {
    // Hardcoded Supabase URL for API calls - this is the primary source of truth
    const SUPABASE_URL = 'https://ftrivovjultfayttemce.supabase.co';
    
    // For debugging only - try to get URL from script tag but always fall back to hardcoded URL
    const scriptTag = document.querySelector('script[src*="embed-api.js"]') || 
                     document.querySelector('script[src*="embed.js"]');
    
    if (window.SpinitinonEmbedDebug) {
      console.log('Spinitron API: Using hardcoded base URL for API calls:', SUPABASE_URL);
      if (scriptTag && scriptTag.src) {
        try {
          const scriptOrigin = new URL(scriptTag.src).origin;
          console.log('Spinitron API: Script is hosted at:', scriptOrigin);
        } catch (e) {
          console.error('Error parsing script URL:', e);
        }
      }
    }
    
    // Always return the hardcoded URL for API calls
    return SUPABASE_URL;
  }

  const BASE_URL = getBaseUrl();
  
  // Fetch songs from API using Supabase edge function
  async function fetchSongs(baseUrl, config, offset = 0, limit = 5, searchQuery = '') {
    try {
      // Always use the provided baseUrl or fall back to the hardcoded one
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

      // Attempt the API call with retry logic
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
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
          retries++;
          console.error(`Spinitron API: Request failed (attempt ${retries}/${maxRetries}):`, error);
          
          if (retries >= maxRetries) {
            throw error;
          }
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retries), 8000);
          console.log(`Spinitron API: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
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
