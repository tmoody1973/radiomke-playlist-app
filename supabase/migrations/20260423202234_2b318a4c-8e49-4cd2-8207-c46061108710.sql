UPDATE public.songs
SET
  image = 'https://coverartarchive.org/release/1c5efe9c-1eb6-462f-9632-8d65f531ad7c/41030017501-500.jpg',
  release = 'Teenage Dirtbag',
  enhanced_metadata = jsonb_build_object(
    'source', 'musicbrainz',
    'recording_title', 'Teenage Dirtbag',
    'release_date', '2024-08-13',
    'duration_ms', 195000,
    'score', 100,
    'all_artists', jsonb_build_array(
      jsonb_build_object('id', '2b3130ac-2f9f-4dc3-a266-453b25183ddf', 'name', 'Sega Bodega'),
      jsonb_build_object('id', 'aefba883-dfc2-45ee-bce4-1dd903b13341', 'name', 'Dorian Electra')
    ),
    'musicbrainz_recording_id', '8dbd4fd0-6412-4911-8b7d-5546ffa69959',
    'musicbrainz_release_id', '1c5efe9c-1eb6-462f-9632-8d65f531ad7c',
    'musicbrainz_artist_id', '2b3130ac-2f9f-4dc3-a266-453b25183ddf'
  )
WHERE id = 'b344849a-f9a9-4982-86a9-5ad26760fce7';