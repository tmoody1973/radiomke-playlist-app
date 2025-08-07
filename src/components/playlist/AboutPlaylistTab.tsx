import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const AboutPlaylistTab: React.FC = () => {
  return (
    <section aria-labelledby="about-playlist-heading">
      <Card>
        <CardHeader>
          <CardTitle id="about-playlist-heading">About the Playlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our new playlist experience is more than just an upgrade — it’s a complete reimagining of how you engage with our music programming.
          </p>
          <p>
            We built this tool for listeners like you: curious, passionate, and always on the lookout for your next favorite track. Is it perfect? Not yet. But it’s already making it easier to discover the music we play, when we play it, and why it matters.
          </p>

          <h3 className="text-lg font-semibold">What You Can Do</h3>

          <div className="space-y-2">
            <p>✅ <strong>See Real-Time Updates</strong></p>
            <p>
              The playlist refreshes automatically every three seconds, so you're always viewing the most up-to-date information about what’s currently on air — no need to refresh your browser.
            </p>
          </div>

          <div className="space-y-2">
            <p>✅ <strong>Explore Rich Song Details</strong></p>
            <p>
              Every song entry includes the artist, title, album artwork, record label, release info, and the exact timestamp of when it aired. It’s designed for deeper discovery and better context.
            </p>
          </div>

          <div className="space-y-2">
            <p>✅ <strong>Search and Filter with Precision</strong></p>
            <p>
              Looking for that track you heard last week but forgot the name? Use our advanced search to filter by keywords, date ranges, and more. Whether you’re searching for a single song or reviewing months of programming, it’s all at your fingertips.
            </p>
          </div>

          <h3 className="text-lg font-semibold">Why This Matters</h3>
          <p>This playlist app goes beyond identifying songs. It’s a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Discovery tool for emerging and legacy artists alike.</li>
            <li>Resource for connecting music to upcoming concerts and events.</li>
            <li>Public archive that reflects our station’s evolving sound and cultural contributions.</li>
          </ul>

          <p>
            Whether you're a casual listener or a crate-digging music fan, we hope this tool brings you closer to the music and to us.
          </p>

          <p>
            If you like what we’ve created and want to support more innovations like this, please consider donating at{' '}
            <a
              href="https://radiomilwaukee.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              radiomilwaukee.org/donate
            </a>
            .
          </p>

          <p>
            For questions, ideas, or feedback, we’d love to hear from you. Email us anytime at{' '}
            <a href="mailto:digital@radiomilwaukee.org" className="underline underline-offset-4">
              digital@radiomilwaukee.org
            </a>
            .
          </p>

          <p className="text-sm text-muted-foreground">
            Made with love <Heart className="inline h-4 w-4 align-text-bottom" aria-label="heart icon" /> by Tarik aka the Architect
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutPlaylistTab;
