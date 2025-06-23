import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, ExternalLink, Heart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [selectedStation, setSelectedStation] = useState('hyfin');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          {/* Enhanced header with logo */}
          <div className="mb-6 flex flex-col items-center">
            <img 
              src="/lovable-uploads/f79975fc-c2f8-4693-8bd1-b4b15d882845.png" 
              alt="Radio Milwaukee Logo" 
              className="h-20 w-auto mb-4 drop-shadow-lg"
            />
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
              <h2 className="text-2xl font-semibold mb-4">Playlist App</h2>
            </div>
          </div>
          
          {/* Station Selector */}
          <Card className="max-w-md mx-auto mb-6 border-orange-200 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Label className="text-lg font-semibold mb-4 block">Select Station</Label>
                <RadioGroup 
                  value={selectedStation} 
                  onValueChange={setSelectedStation}
                  className="flex justify-center gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hyfin" id="hyfin" />
                    <Label htmlFor="hyfin" className="font-medium cursor-pointer">
                      HYFIN
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="88nine" id="88nine" />
                    <Label htmlFor="88nine" className="font-medium cursor-pointer">
                      88Nine
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience Milwaukee's independent radio with live playlist updates, 
            real-time song tracking, and seamless music discovery
          </p>
          
          <Card className="max-w-2xl mx-auto mb-8 border-orange-200 shadow-lg">
            <CardContent className="pt-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                    <Code className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </Button>
                </Link>
                <Link to="/embed" target="_blank">
                  <Button variant="outline" className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50 shadow-md">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Embed Demo
                  </Button>
                </Link>
                <Link to="/article">
                  <Button variant="secondary" className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Technical Article
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4 font-medium">
                🎵 Embed this playlist widget on any website with customizable options
              </p>
            </CardContent>
          </Card>
        </div>
        
        <SpinitinonPlaylist 
          stationId={selectedStation}
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
