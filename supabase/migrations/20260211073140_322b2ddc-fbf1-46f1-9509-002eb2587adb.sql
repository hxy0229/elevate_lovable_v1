
-- Add recurrence, archive, and announcement columns to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS recurrence_rule text DEFAULT null;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS announcement text DEFAULT null;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS announcement_cn text DEFAULT null;

-- Create music_sheets table for instrument-specific sheet music / lyrics
CREATE TABLE public.music_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  song_id uuid REFERENCES public.session_songs(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  instrument_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  file_url text,
  content_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_sheets ENABLE ROW LEVEL SECURITY;

-- Policies for music_sheets
CREATE POLICY "Anyone can view music sheets"
  ON public.music_sheets FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload music sheets"
  ON public.music_sheets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own music sheets"
  ON public.music_sheets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any music sheet"
  ON public.music_sheets FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for music sheets
INSERT INTO storage.buckets (id, name, public) VALUES ('music-sheets', 'music-sheets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for music-sheets bucket
CREATE POLICY "Anyone can view music sheet files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'music-sheets');

CREATE POLICY "Authenticated users can upload music sheet files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'music-sheets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own music sheet files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'music-sheets' AND auth.uid()::text = (storage.foldername(name))[1]);
