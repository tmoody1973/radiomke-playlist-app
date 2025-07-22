interface EmbedConfig {
  selectedStation: string;
  autoUpdate: boolean;
  showSearch: boolean;
  maxItems: number;
  unlimitedSongs: boolean;
  compact: boolean;
  height: string;
  theme: string;
  layout: string;
  enableDateSearch: boolean;
  startDate?: Date;
  endDate?: Date;
  containerId?: string;
}

export class JavaScriptCodeGenerator {
  public generatePreviewCode(config: EmbedConfig): string {
    const container = config.containerId || 'spinitron-playlist-widget';
    return `<div id="${container}" data-station="${config.selectedStation}" data-auto-update="${config.autoUpdate}" data-show-search="${config.showSearch}" data-max-items="${config.maxItems}" data-compact="${config.compact}" data-height="${config.height}" data-theme="${config.theme}" data-layout="${config.layout}" ${config.enableDateSearch ? `data-start-date="${config.startDate || ''}" data-end-date="${config.endDate || ''}"` : ''}><p>Loading playlist...</p></div>`;
  }

  public generateReactCode(config: EmbedConfig): string {
    return `<SpinitronPlaylistWidget station="${config.selectedStation}" autoUpdate={${config.autoUpdate}} showSearch={${config.showSearch}} maxItems={${config.maxItems}} compact={${config.compact}} height="${config.height}" theme="${config.theme}" layout="${config.layout}" />`;
  }

  public generateVueCode(config: EmbedConfig): string {
    return `<spinitron-playlist-widget station="${config.selectedStation}" :auto-update="${config.autoUpdate}" :show-search="${config.showSearch}" :max-items="${config.maxItems}" :compact="${config.compact}" height="${config.height}" theme="${config.theme}" layout="${config.layout}"></spinitron-playlist-widget>`;
  }

  public generateSvelteCode(config: EmbedConfig): string {
    return `<SpinitronPlaylistWidget station="${config.selectedStation}" autoUpdate={${config.autoUpdate}} showSearch={${config.showSearch}} maxItems={${config.maxItems}} compact={${config.compact}} height="${config.height}" theme="${config.theme}" layout="${config.layout}" />`;
  }

  public generateAngularCode(config: EmbedConfig): string {
    return `<app-spinitron-playlist-widget station="${config.selectedStation}" [autoUpdate]="${config.autoUpdate}" [showSearch]="${config.showSearch}" [maxItems]="${config.maxItems}" [compact]="${config.compact}" height="${config.height}" theme="${config.theme}" layout="${config.layout}"></app-spinitron-playlist-widget>`;
  }

  public generateHTMLCode(config: EmbedConfig): string {
    const container = config.containerId || 'spinitron-playlist-widget';
    return `<div id="${container}" data-station="${config.selectedStation}" data-auto-update="${config.autoUpdate}" data-show-search="${config.showSearch}" data-max-items="${config.maxItems}" data-compact="${config.compact}" data-height="${config.height}" data-theme="${config.theme}" data-layout="${config.layout}"><p>Loading playlist...</p></div>
<script src="https://ftrivovjultfayttemce.supabase.co/embed.js"></script>`;
  }

  public generateIFrameCode(config: EmbedConfig): string {
    const container = config.containerId || 'spinitron-playlist-widget';
    const baseUrl = 'https://ftrivovjultfayttemce.supabase.co'; // Replace with your actual base URL
    const iframeSrc = `${baseUrl}/embed-iframe.html?station=${config.selectedStation}&autoUpdate=${config.autoUpdate}&showSearch=${config.showSearch}&maxItems=${config.maxItems}&compact=${config.compact}&height=${config.height}&theme=${config.theme}&layout=${config.layout}`;

    return `<iframe
  src="${iframeSrc}"
  width="100%"
  height="${config.height === 'auto' ? '400px' : config.height + 'px'}"
  style="border: none;"
  title="Spinitron Playlist Widget"
></iframe>`;
  }

  public generateWordPressShortcode(config: EmbedConfig): string {
    return `[spinitron_playlist station="${config.selectedStation}" auto_update="${config.autoUpdate}" show_search="${config.showSearch}" max_items="${config.maxItems}" compact="${config.compact}" height="${config.height}" theme="${config.theme}" layout="${config.layout}"]`;
  }

  public generateWordPressCode(config: EmbedConfig): string {
    const container = config.containerId || 'spinitron-playlist-widget';
    return `<!-- Spinitron Playlist Widget -->
<div id="${container}" 
  class="spinitron-playlist-widget"
  data-station="${config.selectedStation}"
  data-auto-update="${config.autoUpdate}"
  data-show-search="${config.showSearch}"
  data-max-items="${config.maxItems}"
  data-compact="${config.compact}"
  data-height="${config.height}"
  data-theme="${config.theme}"
  data-layout="${config.layout}"
  ${config.enableDateSearch ? `data-start-date="${config.startDate || ''}" data-end-date="${config.endDate || ''}"` : ''}
  >
  <p>Loading playlist...</p>
</div>

<script>
  // Define a queue for widgets if it doesn't exist yet
  window.SpinitinonEmbedQueue = window.SpinitinonEmbedQueue || [];
  
  // Load the Spinitron embed script
  (function() {
    // Check if script is already loaded
    if (document.querySelector('script[src*="embed.js"]')) return;
    
    // Function to load script with fallback
    function loadScript(primarySrc, fallbackSrc) {
      // Create primary script element
      const script = document.createElement('script');
      script.async = true;
      script.src = primarySrc;
      
      // Handle primary script load error
      script.onerror = function() {
        console.warn("⚠️ Failed to load embed script from primary source, trying fallback...");
        
        // Try fallback script on error
        const fallbackScript = document.createElement('script');
        fallbackScript.async = true;
        fallbackScript.src = fallbackSrc;
        
        // Handle fallback script error
        fallbackScript.onerror = function() {
          console.error("❌ Failed to load Spinitron embed scripts");
          document.getElementById("${container}").innerHTML = 
            '<div style="text-align: center; padding: 2rem; color: #dc2626;">' +
            '<p><strong>Unable to load playlist</strong></p>' +
            '<p style="font-size: 0.875rem; margin-top: 0.5rem;">Please try again later.</p>' +
            '</div>';
        };
        
        document.head.appendChild(fallbackScript);
      };
      
      // Append the script to the head
      document.head.appendChild(script);
    }
    
    // Try to load from primary source first, with fallback
    loadScript(
      "https://ftrivovjultfayttemce.supabase.co/embed.js", 
      "https://ftrivovjultfayttemce.supabase.co/embed.js"
    );
  })();
</script>
<!-- End Spinitron Playlist Widget -->`;
  }

  public generateCode(config: EmbedConfig): string {
    const container = config.containerId || 'spinitron-playlist-widget';
    
    // Define the hardcoded Supabase URL - critical for ensuring API calls work correctly
    const supabaseUrl = 'https://ftrivovjultfayttemce.supabase.co';
    
    return `
<!-- Spinitron Playlist Widget -->
<div id="${container}" 
  class="spinitron-playlist-widget"
  data-station="${config.selectedStation}"
  data-auto-update="${config.autoUpdate}"
  data-show-search="${config.showSearch}"
  data-max-items="${config.maxItems}"
  data-compact="${config.compact}"
  data-height="${config.height}"
  data-theme="${config.theme}"
  data-layout="${config.layout}"
  ${config.enableDateSearch ? `data-start-date="${config.startDate || ''}" data-end-date="${config.endDate || ''}"` : ''}
  data-api-url="${supabaseUrl}">
  <p>Loading playlist...</p>
</div>

<script>
  // Define a queue for widgets if it doesn't exist yet
  window.SpinitinonEmbedQueue = window.SpinitinonEmbedQueue || [];
  
  // Load the Spinitron embed script
  (function() {
    // Check if script is already loaded
    if (document.querySelector('script[src*="embed.js"]')) return;
    
    // Function to load script with fallback
    function loadScript(primarySrc, fallbackSrc) {
      // Always use the hardcoded Supabase URL for reliability
      const baseUrl = "https://ftrivovjultfayttemce.supabase.co";
      
      // Create primary script element
      const script = document.createElement('script');
      script.async = true;
      script.src = primarySrc;
      
      // Handle primary script load error
      script.onerror = function() {
        console.warn("⚠️ Failed to load embed script from primary source, trying fallback...");
        
        // Try fallback script on error
        const fallbackScript = document.createElement('script');
        fallbackScript.async = true;
        fallbackScript.src = fallbackSrc;
        
        // Handle fallback script error
        fallbackScript.onerror = function() {
          console.error("❌ Failed to load Spinitron embed scripts");
          document.getElementById("${container}").innerHTML = 
            '<div style="text-align: center; padding: 2rem; color: #dc2626;">' +
            '<p><strong>Unable to load playlist</strong></p>' +
            '<p style="font-size: 0.875rem; margin-top: 0.5rem;">Please try again later.</p>' +
            '</div>';
        };
        
        document.head.appendChild(fallbackScript);
      };
      
      // Add timestamp to avoid caching issues in WordPress
      const cacheBuster = "?_t=" + new Date().getTime();
      script.src = baseUrl + "/embed.js" + cacheBuster;
      
      // Append the script to the head
      document.head.appendChild(script);
    }
    
    // Try to load from primary source first, with fallback
    loadScript(
      "https://ftrivovjultfayttemce.supabase.co/embed.js", 
      "https://ftrivovjultfayttemce.supabase.co/embed.js"
    );
  })();
</script>
<!-- End Spinitron Playlist Widget -->`;
  }
}

export const generateJavaScriptCode = (config: EmbedConfig): string => {
  const generator = new JavaScriptCodeGenerator();
  return generator.generateCode(config);
};
