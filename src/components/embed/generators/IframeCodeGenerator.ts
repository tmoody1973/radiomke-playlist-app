
import { generateEmbedUrl } from './EmbedUrlGenerator';

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
  customColors?: {
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    linkColor: string;
    borderColor: string;
  };
}

export const generateIframeCode = (config: EmbedConfig): string => {
  const embedUrl = generateEmbedUrl(config);
  const stationName = config.selectedStation === 'hyfin' ? 'HYFIN' : '88Nine';
  
  // Generate theme-aware colors with custom color support
  const isDark = config.theme === 'dark';
  const colors = config.customColors || {
    headingColor: isDark ? '#f9fafb' : '#1f2937',
    textColor: isDark ? '#d1d5db' : '#6b7280',
    linkColor: isDark ? '#fb923c' : '#ea580c',
    fallbackBg: isDark ? '#374151' : '#f9fafb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderColor: isDark ? '#374151' : '#e5e7eb'
  };
  
  return `<!-- SEO-Friendly Radio Milwaukee Playlist Embed -->
<div class="radio-milwaukee-embed-container">
  <!-- Contextual content for SEO -->
  <h3>Live Radio Playlist - ${stationName}</h3>
  <p>Currently playing songs from Radio Milwaukee's ${stationName} station. 
     Discover new music and see what's trending on Milwaukee radio.</p>
  
  <iframe 
    src="${embedUrl}" 
    width="100%" 
    height="${config.height}px"
    title="Radio Milwaukee ${stationName} Live Playlist - Currently Playing Songs"
    name="radio-milwaukee-playlist"
    loading="lazy"
    allow="autoplay; encrypted-media"
    referrerpolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: block; max-width: 100%; background-color: ${colors.backgroundColor};"
    id="spinitron-iframe">
    
    <!-- Fallback content for accessibility and SEO -->
    <div class="iframe-fallback">
      <p><strong>Radio Milwaukee Live Playlist</strong></p>
      <p>View the current playlist and discover what's playing on ${stationName}.</p>
      <p><a href="${window.location.origin}" target="_blank" rel="noopener">
        Visit Radio Milwaukee Playlist →
      </a></p>
      <p>Keywords: radio milwaukee, ${stationName.toLowerCase()}, live playlist, current songs, milwaukee radio, music discovery</p>
    </div>
  </iframe>

  <!-- Structured data for search engines -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": "Radio Milwaukee - ${stationName}",
    "url": "${window.location.origin}",
    "description": "Live playlist showing currently playing songs from Radio Milwaukee's ${stationName} station",
    "broadcastServiceTier": "FM",
    "parentService": {
      "@type": "RadioChannel",
      "name": "${stationName}",
      "description": "Milwaukee's independent radio station"
    },
    "genre": ["Alternative", "Indie", "Local Music"],
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "ListenAction",
      "target": "${embedUrl}"
    }
  }
  </script>
</div>

<script>
  // Auto-resize iframe based on content
  window.addEventListener('message', function(event) {
    if (event.data.type === 'spinitron-resize') {
      const iframe = document.getElementById('spinitron-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>

<!-- Custom Theme CSS -->
<style>
.radio-milwaukee-embed-container {
  max-width: 100%;
  margin: 1rem 0;
  background-color: ${colors.backgroundColor};
  border-radius: 8px;
  padding: 1rem;
}
.radio-milwaukee-embed-container h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.headingColor};
}
.radio-milwaukee-embed-container p {
  margin: 0 0 1rem 0;
  color: ${colors.textColor};
  line-height: 1.5;
}
.iframe-fallback {
  padding: 2rem;
  background: ${colors.backgroundColor};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  text-align: center;
}
.iframe-fallback a {
  color: ${colors.linkColor};
  text-decoration: none;
  font-weight: 500;
}
.iframe-fallback a:hover {
  text-decoration: underline;
}
</style>`;
};
