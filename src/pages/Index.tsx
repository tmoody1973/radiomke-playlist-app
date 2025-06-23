import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, ExternalLink, Heart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Radio Milwaukee Playlist App</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Live radio playlist with real-time updates
          </p>
          
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button className="w-full sm:w-auto">
                    <Code className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </Button>
                </Link>
                <Link to="/embed" target="_blank">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Embed Demo
                  </Button>
                </Link>
                <Link to="/article">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Technical Article
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Embed this playlist widget on any website with customizable options
              </p>
            </CardContent>
          </Card>
        </div>
        
        <SpinitinonPlaylist 
          autoUpdate={true}
          showSearch={true}
          maxItems={50}
        />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by Tarik aka the Architect
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
