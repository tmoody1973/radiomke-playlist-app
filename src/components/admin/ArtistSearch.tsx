
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ArtistSearchProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const ArtistSearch = ({ value, onChange, required = false }: ArtistSearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch unique artist names from the songs table
  const { data: artistNames, isLoading: artistsLoading } = useQuery({
    queryKey: ['artist-names'],
    queryFn: async () => {
      console.log('🎵 Fetching artists from songs table...');
      const { data, error } = await supabase
        .from('songs')
        .select('artist')
        .order('artist', { ascending: true });

      if (error) {
        console.error('Error fetching artists:', error);
        throw error;
      }
      
      console.log('🎵 Raw artist data:', data?.slice(0, 10));
      
      const uniqueArtists = [...new Set(data.map(item => item.artist))].filter(Boolean).sort();
      
      console.log('🎵 Total unique artists found:', uniqueArtists.length);
      console.log('🎵 First 20 artists:', uniqueArtists.slice(0, 20));
      
      const princeVariations = uniqueArtists.filter(artist => 
        artist.toLowerCase().includes('prince')
      );
      console.log('🎵 Prince variations found:', princeVariations);
      
      return uniqueArtists;
    },
  });

  // Filter artists based on search term
  const filteredArtists = useMemo(() => {
    if (!artistNames || !value.trim()) return [];
    
    return artistNames.filter(artist =>
      artist.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10);
  }, [artistNames, value]);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setShowSuggestions(inputValue.length > 0);
  };

  const handleArtistSelect = (artistName: string) => {
    onChange(artistName);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Label htmlFor="artist_name">Artist Name *</Label>
      <Input
        id="artist_name"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(value.length > 0)}
        placeholder={artistsLoading ? "Loading artists..." : "Type to search artists..."}
        required={required}
      />
      
      {/* Artist suggestions dropdown */}
      {showSuggestions && filteredArtists.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
          {filteredArtists.map((artist) => (
            <button
              key={artist}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 text-gray-900 border-none bg-transparent cursor-pointer"
              onClick={() => handleArtistSelect(artist)}
            >
              {artist}
            </button>
          ))}
        </div>
      )}
      
      {artistNames && (
        <p className="text-xs text-gray-500 mt-1">
          Found {artistNames.length} artists in database
        </p>
      )}
    </div>
  );
};
