
-- Function to look up user email by display_name (for username login)
CREATE OR REPLACE FUNCTION public.get_email_by_display_name(lookup_name text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.user_id
  WHERE lower(p.display_name) = lower(lookup_name)
  LIMIT 1;
$$;
