
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTopSongs } from '@/hooks/useTopSongs';

interface TopSongsListProps {
  stationId: string;
  days?: number;
  limit?: number;
}

export const TopSongsList: React.FC<TopSongsListProps> = ({ stationId, days = 7, limit = 20 }) => {
  const { data, isLoading, error } = useTopSongs({ stationId, days, limit });

  if (isLoading) {
    return <div className="px-4 py-8 text-center text-muted-foreground">Loading top songs…</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-destructive">
        Failed to load top songs
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        No spins in the last {days} days.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ol className="divide-y">
          {data.items.map((item, idx) => (
            <li key={`${item.artist}-${item.song}-${idx}`} className="flex items-center gap-3 p-3">
              <div className="w-6 text-center font-semibold text-muted-foreground">{idx + 1}</div>
              <Avatar className="h-10 w-10 rounded-md">
                {item.image ? (
                  <AvatarImage src={item.image} alt={`${item.artist} ${item.song} cover art`} />
                ) : (
                  <AvatarFallback className="rounded-md">{item.artist?.[0] || '#'}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{item.artist} — {item.song}</div>
                <div className="text-xs text-muted-foreground">Last {days} days</div>
              </div>
              <Badge variant="secondary" className="ml-auto">{item.spins} spins</Badge>
            </li>
          ))}
        </ol>
        <div className="px-3 py-2 text-xs text-muted-foreground border-t">
          Analyzed {data.analyzedCount.toLocaleString()} spins
        </div>
      </CardContent>
    </Card>
  );
};
