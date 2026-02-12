-- Restrict music_sheets to authenticated users only
DROP POLICY "Anyone can view music sheets" ON public.music_sheets;
CREATE POLICY "Authenticated users can view music sheets" 
ON public.music_sheets FOR SELECT 
USING (auth.uid() IS NOT NULL);