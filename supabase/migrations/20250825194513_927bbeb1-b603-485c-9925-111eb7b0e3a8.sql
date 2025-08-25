-- 1) Create roles enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Ensure execute permission (default is granted to public, but be explicit)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- 4) RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Tighten custom_events management to admins only
DROP POLICY IF EXISTS "Authenticated users can manage custom events" ON public.custom_events;

-- Keep public read of active events as-is; add admin full access
DROP POLICY IF EXISTS "Admins can manage custom events" ON public.custom_events;
CREATE POLICY "Admins can manage custom events"
ON public.custom_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Optional: allow admins to view all, not only active
DROP POLICY IF EXISTS "Admins can view all custom events" ON public.custom_events;
CREATE POLICY "Admins can view all custom events"
ON public.custom_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6) Allow admins to manage ticketmaster cache (keep existing service_role policy)
DROP POLICY IF EXISTS "Admins can manage cached events" ON public.ticketmaster_events_cache;
CREATE POLICY "Admins can manage cached events"
ON public.ticketmaster_events_cache
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
