DELETE FROM public.songs
WHERE station_id = '88nine'
  AND lower(trim(artist)) = 'jimmy eat world'
  AND lower(trim(song)) = 'the middle';