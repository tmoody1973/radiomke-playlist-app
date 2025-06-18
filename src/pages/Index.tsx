
import SpinitinonPlaylist from '@/components/SpinitinonPlaylist';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Spinitron Playlist Widget</h1>
          <p className="text-xl text-muted-foreground">
            Live radio playlist with real-time updates
          </p>
        </div>
        
        <SpinitinonPlaylist 
          autoUpdate={true}
          showSearch={true}
          maxItems={50}
        />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by Spinitron API • Updates every 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
