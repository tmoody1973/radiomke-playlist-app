import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, ExternalLink, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ManualSong {
  id: string;
  artist: string;
  song: string;
  start_time: string;
  duration: number | null;
  release: string | null;
  label: string | null;
  image: string | null;
  station_id: string;
  manual_added_at: string;
  enhanced_metadata: any;
}

export const ManualSongsList = () => {
  const [songs, setSongs] = useState<ManualSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchManualSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_manual', true)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error fetching manual songs:', error);
      toast({
        title: "Error",
        description: "Failed to load manual songs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSong = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manual song?')) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSongs(prev => prev.filter(song => song.id !== id));
      toast({
        title: "Success",
        description: "Manual song deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: "Error",
        description: "Failed to delete song",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchManualSongs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Manual Songs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading manual songs...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Manual Songs ({songs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {songs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No manual songs added yet. Use the form above to add your first manual song.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Song</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Air Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Enhanced</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {song.image && (
                          <img 
                            src={song.image} 
                            alt="Album art"
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{song.song}</div>
                          {song.release && (
                            <div className="text-sm text-muted-foreground">{song.release}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{song.artist}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{song.station_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(song.start_time), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(song.start_time), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '—'}
                    </TableCell>
                    <TableCell>
                      {song.enhanced_metadata?.spotify_url ? (
                        <a 
                          href={song.enhanced_metadata.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Spotify
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast({
                              title: "Coming soon",
                              description: "Edit functionality will be added in the next update"
                            });
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSong(song.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};