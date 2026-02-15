
-- Update RLS policy: users can see draft AND published instances (not just open/published)
DROP POLICY IF EXISTS "Users see open/published, admins see all" ON public.session_instances;
CREATE POLICY "Users see draft/published, admins see all"
  ON public.session_instances FOR SELECT
  USING (
    (status IN ('draft', 'open', 'published'))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Update wishes policies: allow wishes in 'draft' OR 'open' instances (not just open)
DROP POLICY IF EXISTS "Users create wishes in open instances" ON public.wishes;
CREATE POLICY "Users create wishes in editable instances"
  ON public.wishes FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id)
    AND EXISTS (
      SELECT 1 FROM session_instances
      WHERE session_instances.id = wishes.instance_id
        AND session_instances.status IN ('draft', 'open')
    )
  );

DROP POLICY IF EXISTS "Users update own wishes in open instances" ON public.wishes;
CREATE POLICY "Users update own wishes in editable instances"
  ON public.wishes FOR UPDATE
  USING (
    (auth.uid() = user_id)
    AND EXISTS (
      SELECT 1 FROM session_instances
      WHERE session_instances.id = wishes.instance_id
        AND session_instances.status IN ('draft', 'open')
    )
  );

DROP POLICY IF EXISTS "Users delete own wishes in open instances" ON public.wishes;
CREATE POLICY "Users delete own wishes in editable instances"
  ON public.wishes FOR DELETE
  USING (
    (auth.uid() = user_id)
    AND EXISTS (
      SELECT 1 FROM session_instances
      WHERE session_instances.id = wishes.instance_id
        AND session_instances.status IN ('draft', 'open')
    )
  );
