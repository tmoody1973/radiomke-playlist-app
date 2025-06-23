
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Search, Code, Globe } from 'lucide-react';

const SEORecommendations = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Best Practices for Host Sites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Follow these recommendations to maximize SEO benefits when embedding our playlist widget.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Contextual Content</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Add relevant text content around the iframe:
              </p>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                {`<section class="radio-section">
  <h2>Live Radio Playlist</h2>
  <p>Discover what's currently playing on Milwaukee's 
     independent radio stations. Our live playlist updates 
     in real-time with the latest songs from HYFIN and 88Nine.</p>
  
  <!-- Your embed code here -->
  
  <p>Explore Milwaukee's music scene and find your next 
     favorite artist through our curated radio programming.</p>
</section>`}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Page-Level SEO</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Include "radio milwaukee", "live playlist", "milwaukee music" in your page title and meta description</li>
                <li>Use heading tags (H2, H3) to structure content around the embed</li>
                <li>Add alt text and captions for any related images</li>
                <li>Include internal links to related music or radio content</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Technical Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Place the iframe below the fold and use loading="lazy" (already included)</li>
                <li>Ensure your page loads quickly - iframe content loads separately</li>
                <li>Make sure the embed is mobile-responsive</li>
                <li>Include the embed in your sitemap if it's on a dedicated page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Advanced SEO Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Schema.org Structured Data</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Our embed code includes structured data to help search engines understand the content:
            </p>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              {`{
  "@context": "https://schema.org",
  "@type": "RadioStation",
  "name": "Radio Milwaukee",
  "description": "Live playlist from Milwaukee radio",
  "broadcastServiceTier": "FM",
  "genre": ["Alternative", "Indie", "Local Music"]
}`}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Social Media Integration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Add Open Graph tags to improve social sharing:
            </p>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              {`<meta property="og:title" content="Live Milwaukee Radio Playlist">
<meta property="og:description" content="See what's playing now">
<meta property="og:type" content="music.playlist">
<meta property="og:url" content="https://yoursite.com/radio">
<meta name="twitter:card" content="summary_large_image">`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Content Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Create complementary content:</strong> Write articles about featured artists, music reviews, or station highlights</p>
            <p><strong>Use keyword-rich anchor text:</strong> Link to the playlist with phrases like "current milwaukee radio playlist" or "what's playing on HYFIN now"</p>
            <p><strong>Update regularly:</strong> Add fresh content around the embed to keep the page active and relevant</p>
            <p><strong>Encourage engagement:</strong> Ask visitors to share their favorite songs or discover new artists</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEORecommendations;
