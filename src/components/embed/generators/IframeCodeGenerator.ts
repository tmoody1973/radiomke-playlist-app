
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
  
  // Generate theme-aware colors matching the dark slate theme
  const isDark = config.theme === 'dark';
  const colors = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    textColor: isDark ? '#cbd5e1' : '#374151',
    headingColor: isDark ? '#f8fafc' : '#1e293b',
    linkColor: '#ea580c', // Orange accent
    borderColor: isDark ? '#475569' : '#e2e8f0',
    cardBg: isDark ? '#1e293b' : '#f8fafc',
    inputBg: isDark ? '#334155' : '#ffffff',
    inputBorder: isDark ? '#64748b' : '#d1d5db'
  };
  
  // Calculate iframe height with extra space for Load More button
  const baseHeight = parseInt(config.height) || 600;
  const iframeHeight = baseHeight + 100;
  
  return `<!-- SEO-Friendly Radio Milwaukee Playlist Embed -->
<div class="radio-milwaukee-embed-container">
  <!-- Contextual content for SEO -->
  <h3>Live Radio Playlist - ${stationName}</h3>
  <p>Currently playing songs from Radio Milwaukee's ${stationName} station. 
     Discover new music and see what's trending on Milwaukee radio.</p>
  
  <iframe 
    src="${embedUrl}" 
    width="100%" 
    height="${iframeHeight}px"
    title="Radio Milwaukee ${stationName} Live Playlist - Currently Playing Songs"
    name="radio-milwaukee-playlist"
    loading="lazy"
    allow="autoplay; encrypted-media"
    referrerpolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    scrolling="yes"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: block; max-width: 100%; background-color: ${colors.backgroundColor}; overflow: visible !important;"
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
  // Auto-resize iframe based on content with overflow handling
  window.addEventListener('message', function(event) {
    if (event.data.type === 'spinitron-resize') {
      const iframe = document.getElementById('spinitron-iframe');
      if (iframe) {
        const newHeight = Math.max(event.data.height, ${baseHeight});
        iframe.style.height = newHeight + 'px';
        iframe.style.overflow = 'visible';
      }
    }
  });
</script>

<!-- Custom Theme CSS matching dark slate theme -->
<style>
.radio-milwaukee-embed-container {
  max-width: 100%;
  margin: 1rem 0;
  background-color: ${colors.cardBg};
  border: 1px solid ${colors.borderColor};
  border-radius: 8px;
  padding: 1rem;
  overflow: visible !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.radio-milwaukee-embed-container h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.headingColor};
  background: linear-gradient(to right, #ea580c, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.radio-milwaukee-embed-container p {
  margin: 0 0 1rem 0;
  color: ${colors.textColor};
  line-height: 1.5;
  font-size: 0.875rem;
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

#spinitron-iframe {
  overflow: visible !important;
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.backgroundColor} !important;
  box-shadow: ${isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(249, 115, 22, 0.1)'};
}
</style>`;
};
