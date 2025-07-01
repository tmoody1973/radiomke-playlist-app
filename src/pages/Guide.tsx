
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Search, 
  Calendar, 
  Play, 
  Settings, 
  Users, 
  Music,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Youtube,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Guide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Radio Milwaukee Playlist App Guide</h1>
          <p className="text-xl text-muted-foreground">
            Complete guide for team members and listener support
          </p>
          <Badge variant="secondary" className="mt-2">Team Resource</Badge>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <a href="#how-to-use">How to Use</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#managing-events">Managing Events</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#listener-support">Listener Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How to Use Section */}
        <section id="how-to-use" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" />
            How to Use the Playlist App
          </h2>

          <div className="space-y-6">
            {/* Basic Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Basic Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Station Selection</h4>
                  <p className="text-sm mb-2">Users can switch between HYFIN and 88Nine stations using the radio buttons at the top.</p>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <strong>Demo:</strong> Show how clicking between stations changes the playlist content immediately.
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Live Playlist Updates</h4>
                  <p className="text-sm mb-2">The playlist automatically refreshes every 3 seconds to show new songs as they're played.</p>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <strong>Key Feature:</strong> No page refresh needed - new songs appear at the top automatically.
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Song Information</h4>
                  <p className="text-sm">Each song shows:</p>
                  <ul className="text-sm list-disc ml-6 mt-2">
                    <li>Artist and song title</li>
                    <li>Time when it was played</li>
                    <li>Album artwork (when available)</li>
                    <li>Label and release information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Search Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Text Search</h4>
                  <p className="text-sm mb-2">Search by artist name or song title in real-time.</p>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <strong>Example:</strong> Type "Prince" to find all Prince songs played recently.
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Date Range Search</h4>
                  <p className="text-sm mb-2">Use the date search toggle to find songs played within specific dates.</p>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    <strong>Tip:</strong> Great for finding songs from a specific show or time period.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Interactive Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube Preview
                  </h4>
                  <p className="text-sm mb-2">Red YouTube buttons appear when videos are found for songs.</p>
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <strong>How it works:</strong> Click the red play button to listen to the song on YouTube (audio only).
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Concert Information</h4>
                  <p className="text-sm mb-2">Event cards show upcoming concerts for artists when available.</p>
                  <div class="bg-green-50 p-3 rounded text-sm">
                    <strong>Note:</strong> Events are pulled from Ticketmaster and custom events added by the team.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Managing Events Section */}
        <section id="managing-events" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Managing Events (Admin Only)
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Access the admin panel at <code className="bg-gray-100 px-2 py-1 rounded">/admin</code></p>
                <div className="bg-amber-50 p-4 rounded">
                  <p className="text-sm"><strong>Password:</strong> playlist2024</p>
                  <p className="text-xs text-amber-700 mt-1">Share this password only with authorized team members.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adding Custom Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Step-by-Step Process:</h4>
                  <ol className="text-sm list-decimal ml-6 space-y-2">
                    <li>Go to Admin → Custom Events tab</li>
                    <li>Click "Add Event" button</li>
                    <li>Fill in required fields:
                      <ul className="list-disc ml-6 mt-1">
                        <li><strong>Artist Name:</strong> Start typing to see suggestions from our database</li>
                        <li><strong>Event Title:</strong> Concert or show name</li>
                        <li><strong>Event Date:</strong> Required field</li>
                      </ul>
                    </li>
                    <li>Optional fields: Venue, time, ticket URL, prices, description</li>
                    <li>Choose which stations should show this event (or leave blank for both)</li>
                    <li>Click "Create Event"</li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <h5 className="font-semibold text-sm">Pro Tips:</h5>
                  <ul className="text-sm list-disc ml-4 mt-2 space-y-1">
                    <li>Use the artist search - it pulls from our song database</li>
                    <li>Events automatically hide after the event date passes</li>
                    <li>Station-specific events only show for that station's playlist</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Managing Ticketmaster Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">The app automatically pulls events from Ticketmaster, but you can:</p>
                <ul className="text-sm list-disc ml-6 space-y-1">
                  <li><strong>Edit:</strong> Modify event details like venue or pricing</li>
                  <li><strong>Activate/Deactivate:</strong> Control which events show up</li>
                  <li><strong>Delete:</strong> Remove events that aren't relevant</li>
                </ul>
                <div className="bg-gray-100 p-3 rounded text-sm mt-4">
                  <strong>Note:</strong> Ticketmaster events are cached for 24 hours to improve performance.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Listener Support Section */}
        <section id="listener-support" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Supporting Listeners
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">"I don't see the song that just played"</h4>
                  <p className="text-sm mb-2"><strong>Answer:</strong> The playlist updates every 3 seconds, but sometimes there's a slight delay. Wait a moment and it should appear at the top.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">"Why don't all songs have play buttons?"</h4>
                  <p className="text-sm mb-2"><strong>Answer:</strong> YouTube buttons appear when we can find the song on YouTube. Some songs might not be available or take a moment to load.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">"Can I see what played yesterday?"</h4>
                  <p className="text-sm mb-2"><strong>Answer:</strong> Yes! Use the date search feature - toggle "Date Search" and select your date range.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">"The search isn't working"</h4>
                  <p className="text-sm mb-2"><strong>Answer:</strong> Make sure you're searching for the artist name or song title exactly as it appears. Try partial matches if the full name doesn't work.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Explaining Features to Listeners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Selling Points:</h4>
                  <ul className="text-sm list-disc ml-6 space-y-2">
                    <li><strong>Live Updates:</strong> "See what's playing right now and what just played"</li>
                    <li><strong>Music Discovery:</strong> "Find new music you heard on the radio"</li>
                    <li><strong>Concert Info:</strong> "Discover when your favorite artists are coming to town"</li>
                    <li><strong>Historical Search:</strong> "Remember that song from last week? You can find it!"</li>
                    <li><strong>Two Stations:</strong> "Switch between HYFIN and 88Nine playlists"</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <h5 className="font-semibold text-sm mb-2">Sample Script:</h5>
                  <p className="text-sm italic">
                    "Check out our playlist app at [website] - you can see what's playing right now, search for songs you heard earlier, and even find out when your favorite artists are performing in Milwaukee. It updates live, so you'll never miss a track!"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-sm">App seems slow or not updating:</h5>
                    <p className="text-sm">Have them refresh the page. The app runs best on modern browsers.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">YouTube buttons not working:</h5>
                    <p className="text-sm">This is normal - not all songs are available on YouTube. The system searches automatically.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Mobile issues:</h5>
                    <p className="text-sm">The app is mobile-friendly. If they're having issues, suggest using a modern mobile browser.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Info */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Technical Information</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works (For Tech-Savvy Team Members)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Sources:</h4>
                <ul className="text-sm list-disc ml-6 space-y-1">
                  <li><strong>Spinitron API:</strong> Live playlist data from both stations</li>
                  <li><strong>YouTube API:</strong> Automatic video searching and caching</li>
                  <li><strong>Ticketmaster API:</strong> Concert event data</li>
                  <li><strong>Custom Database:</strong> Team-added events and cached data</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Update Frequency:</h4>
                <ul className="text-sm list-disc ml-6 space-y-1">
                  <li>Live playlist: Every 3 seconds</li>
                  <li>YouTube data: Background processing</li>
                  <li>Events: Daily refresh from Ticketmaster</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm">
                  <strong>Performance Note:</strong> The app caches data intelligently to provide fast loading times while maintaining real-time updates where it matters most.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Need to make changes to this guide or have questions about the app?
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <Radio className="h-4 w-4 mr-2" />
                Back to Playlist
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
