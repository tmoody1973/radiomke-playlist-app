import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarIcon, Plus, Music, Loader2, Search, Clock, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, isAfter, isBefore, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ManualSongsList } from './ManualSongsList';

const STATIONS = [
  { id: 'KEXP', name: 'KEXP' },
  { id: '88nine', name: '88Nine Radio Milwaukee' }
];

interface ExistingSong {
  id: string;
  artist: string;
  song: string;
  start_time: string;
  duration: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflictingSong?: ExistingSong;
}

export const ManualSongsAdmin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeValue, setTimeValue] = useState('');
  const [existingSongs, setExistingSongs] = useState<ExistingSong[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [conflictError, setConflictError] = useState<string>('');
  const [formData, setFormData] = useState({
    artist: '',
    song: '',
    station_id: '',
    duration: '',
    release: '',
    label: '',
    image: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const enhanceWithSpotify = async () => {
    if (!formData.artist || !formData.song) {
      toast({
        title: "Error",
        description: "Please enter both artist and song name before enhancing",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('spotify-enhance', {
        body: {
          artist: formData.artist,
          song: formData.song
        }
      });

      if (error) throw error;

      if (data.found) {
        setFormData(prev => ({
          ...prev,
          image: data.data.image || prev.image,
          release: data.data.release || prev.release,
          duration: prev.duration || Math.round(data.data.enhanced_metadata.duration_ms / 1000).toString()
        }));

        toast({
          title: "Enhanced!",
          description: "Song metadata enhanced with Spotify data"
        });
      } else {
        toast({
          title: "Not found",
          description: "No matching song found on Spotify",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Spotify enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance with Spotify data",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Load existing songs for the selected date and station
  const loadExistingSongs = async () => {
    if (!selectedDate || !formData.station_id) return;

    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('songs')
        .select('id, artist, song, start_time, duration')
        .eq('station_id', formData.station_id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      setExistingSongs(data || []);
    } catch (error) {
      console.error('Error loading existing songs:', error);
    }
  };

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    if (!selectedDate || !formData.station_id || !existingSongs.length) return;

    const slots: TimeSlot[] = [];
    const songDuration = parseInt(formData.duration) || 180;

    // Create slots for every 15 minutes throughout the day
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + songDuration * 1000);

        let available = true;
        let conflictingSong: ExistingSong | undefined;

        // Check if this slot conflicts with existing songs
        for (const song of existingSongs) {
          const songStart = parseISO(song.start_time);
          const songEnd = new Date(songStart.getTime() + (song.duration || 180) * 1000);

          // Check for overlap
          if (
            (slotStart >= songStart && slotStart < songEnd) ||
            (slotEnd > songStart && slotEnd <= songEnd) ||
            (slotStart <= songStart && slotEnd >= songEnd)
          ) {
            available = false;
            conflictingSong = song;
            break;
          }
        }

        slots.push({
          start: slotStart,
          end: slotEnd,
          available,
          conflictingSong
        });
      }
    }

    setTimeSlots(slots);
  };

  // Check for conflicts when time/date changes
  const checkTimeConflict = () => {
    if (!selectedDate || !timeValue || !formData.station_id) {
      setConflictError('');
      return;
    }

    const [hours, minutes] = timeValue.split(':');
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const songDuration = parseInt(formData.duration) || 180;
    const endTime = new Date(startTime.getTime() + songDuration * 1000);

    // Find conflicting songs
    const conflicts = existingSongs.filter(song => {
      const songStart = parseISO(song.start_time);
      const songEnd = new Date(songStart.getTime() + (song.duration || 180) * 1000);

      return (
        (startTime >= songStart && startTime < songEnd) ||
        (endTime > songStart && endTime <= songEnd) ||
        (startTime <= songStart && endTime >= songEnd)
      );
    });

    if (conflicts.length > 0) {
      const conflictingSong = conflicts[0];
      const conflictStart = parseISO(conflictingSong.start_time);
      const conflictEnd = new Date(conflictStart.getTime() + (conflictingSong.duration || 180) * 1000);
      
      setConflictError(
        `Time conflict with "${conflictingSong.artist} - ${conflictingSong.song}" ` +
        `(${format(conflictStart, 'h:mm a')} - ${format(conflictEnd, 'h:mm a')})`
      );
    } else {
      setConflictError('');
    }
  };

  // Get suggested available times
  const getSuggestedTimes = () => {
    if (!timeSlots.length) return [];

    return timeSlots
      .filter(slot => slot.available)
      .slice(0, 5) // Show first 5 available slots
      .map(slot => format(slot.start, 'h:mm a'));
  };

  useEffect(() => {
    loadExistingSongs();
  }, [selectedDate, formData.station_id]);

  useEffect(() => {
    generateTimeSlots();
  }, [existingSongs, selectedDate, formData.station_id, formData.duration]);

  useEffect(() => {
    checkTimeConflict();
  }, [timeValue, selectedDate, formData.station_id, formData.duration, existingSongs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !timeValue || !formData.artist || !formData.song || !formData.station_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (conflictError) {
      toast({
        title: "Time Conflict",
        description: conflictError,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time with proper timezone handling
      const [hours, minutes] = timeValue.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Double-check for conflicts using the RPC function
      const { data: conflictCheck } = await supabase.rpc('check_song_time_conflict', {
        p_start_time: startTime.toISOString(),
        p_duration: parseInt(formData.duration) || 180,
        p_station_id: formData.station_id
      });

      if (conflictCheck) {
        toast({
          title: "Time Conflict",
          description: "Another song is already scheduled at this time",
          variant: "destructive"
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Enhance with Spotify if not already done
      let enhancedData = {};
      if (!formData.image && formData.artist && formData.song) {
        const { data } = await supabase.functions.invoke('spotify-enhance', {
          body: { artist: formData.artist, song: formData.song }
        });
        if (data?.found) {
          enhancedData = data.data;
        }
      }

      // Insert the manual song
      const { error } = await supabase.from('songs').insert({
        spinitron_id: Math.floor(Math.random() * -1000000), // Negative ID for manual songs
        artist: formData.artist,
        song: formData.song,
        start_time: startTime.toISOString(),
        duration: parseInt(formData.duration) || 180,
        release: formData.release || (enhancedData as any).release,
        label: formData.label,
        image: formData.image || (enhancedData as any).image,
        station_id: formData.station_id,
        is_manual: true,
        added_by_user_id: user?.id,
        manual_added_at: new Date().toISOString(),
        ...enhancedData
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Manual song added successfully"
      });

      // Reset form
      setFormData({
        artist: '',
        song: '',
        station_id: '',
        duration: '',
        release: '',
        label: '',
        image: ''
      });
      setSelectedDate(undefined);
      setTimeValue('');

    } catch (error) {
      console.error('Error adding manual song:', error);
      toast({
        title: "Error",
        description: "Failed to add manual song",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Manual Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artist">Artist Name *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder="Enter artist name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="song">Song Title *</Label>
                <div className="flex gap-2">
                  <Input
                    id="song"
                    value={formData.song}
                    onChange={(e) => handleInputChange('song', e.target.value)}
                    placeholder="Enter song title"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={enhanceWithSpotify}
                    disabled={isEnhancing || !formData.artist || !formData.song}
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  required
                  className={conflictError ? 'border-destructive' : ''}
                />
                {conflictError && (
                  <Alert className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {conflictError}
                    </AlertDescription>
                  </Alert>
                )}
                {!conflictError && getSuggestedTimes().length > 0 && selectedDate && formData.station_id && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <div className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Suggested available times:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getSuggestedTimes().map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            const [timePart, period] = time.split(' ');
                            const [hours, minutes] = timePart.split(':');
                            let hour24 = parseInt(hours);
                            if (period === 'PM' && hour24 !== 12) hour24 += 12;
                            if (period === 'AM' && hour24 === 12) hour24 = 0;
                            setTimeValue(`${hour24.toString().padStart(2, '0')}:${minutes}`);
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="station">Station *</Label>
                <Select value={formData.station_id} onValueChange={(value) => handleInputChange('station_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIONS.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="180"
                />
              </div>

              <div>
                <Label htmlFor="release">Album/Release</Label>
                <Input
                  id="release"
                  value={formData.release}
                  onChange={(e) => handleInputChange('release', e.target.value)}
                  placeholder="Album or release name"
                />
              </div>

              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder="Record label"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Album artwork URL"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !!conflictError}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Song...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Add Manual Song
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Visual Timeline */}
      {selectedDate && formData.station_id && existingSongs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline for {format(selectedDate, 'MMMM dd, yyyy')} - {formData.station_id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingSongs.length === 0 ? (
                <p className="text-muted-foreground">No songs scheduled for this date and station.</p>
              ) : (
                existingSongs.map((song) => {
                  const startTime = parseISO(song.start_time);
                  const endTime = new Date(startTime.getTime() + (song.duration || 180) * 1000);
                  
                  return (
                    <div key={song.id} className="flex items-center gap-3 p-2 bg-muted rounded-md">
                      <div className="text-sm font-mono w-20">
                        {format(startTime, 'h:mm a')}
                      </div>
                      <div className="text-sm text-muted-foreground w-16">
                        {Math.floor((song.duration || 180) / 60)}:{((song.duration || 180) % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{song.artist} - {song.song}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        until {format(endTime, 'h:mm a')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <ManualSongsList />
    </div>
  );
};