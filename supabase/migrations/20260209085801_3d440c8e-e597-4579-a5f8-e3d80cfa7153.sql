
-- Allow any authenticated user to update session themes (since sessions may not have a creator)
DROP POLICY IF EXISTS "Session creator can update" ON public.sessions;
CREATE POLICY "Authenticated users can update sessions" ON public.sessions FOR UPDATE TO authenticated USING (true);
