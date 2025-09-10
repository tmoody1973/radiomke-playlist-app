-- Restrict public access to stations and expose a safe RPC for public consumption

-- 1) Remove existing permissive public SELECT policy on stations (if it exists)
DROP POLICY IF EXISTS "Anyone can view stations" ON public.stations;

-- 2) Allow only the service role to read the full stations table
CREATE POLICY "Service role can view stations"
ON public.stations
FOR SELECT
USING (auth.role() = 'service_role');

-- (Optional note: Keep INSERT/UPDATE/DELETE restrictions as-is; no changes here)

-- 3) Create a SECURITY DEFINER RPC to expose only non-sensitive fields
CREATE OR REPLACE FUNCTION public.public_list_stations()
RETURNS TABLE (
  id text,
  name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name
  FROM public.stations s
  ORDER BY s.name;
$$;

-- 4) Ensure anon and authenticated clients can execute the function
GRANT EXECUTE ON FUNCTION public.public_list_stations() TO anon, authenticated;