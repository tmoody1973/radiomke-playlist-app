import Navigation from '@/components/Navigation';
import { MostPlayedChart } from '@/components/playlist/MostPlayedChart';

const MostPlayed = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Most Played Songs</h1>
            <p className="text-muted-foreground">
              Discover the most popular tracks across all radio stations based on spin frequency.
            </p>
          </div>
          
          <MostPlayedChart />
        </div>
      </div>
    </div>
  );
};

export default MostPlayed;