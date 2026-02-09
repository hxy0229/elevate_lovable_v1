
-- Sessions table (weekly rehearsal sessions)
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_cn TEXT,
  session_type TEXT NOT NULL DEFAULT 'band', -- 'solo-vocal' or 'band'
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 15,
  theme TEXT,
  theme_cn TEXT,
  session_date DATE, -- specific date for this session instance
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session registrations
CREATE TABLE public.session_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'vocal', 'guitar'}
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Session songs (song requests for a session)
CREATE TABLE public.session_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  singer_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  song_key TEXT NOT NULL, -- e.g. 'C调'
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Post-session content (photos, videos, notes, chords)
CREATE TABLE public.session_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'photo', 'video', 'note', 'chord'
  title TEXT,
  description TEXT,
  file_url TEXT,
  content_text TEXT, -- for notes/chords stored as text
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;

-- Sessions: anyone can view, authenticated can create
CREATE POLICY "Anyone can view sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Session creator can update" ON public.sessions FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Registrations: anyone can view, authenticated can register/unregister self
CREATE POLICY "Anyone can view registrations" ON public.session_registrations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register" ON public.session_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister themselves" ON public.session_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own registration" ON public.session_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Songs: anyone can view, authenticated can add/remove own
CREATE POLICY "Anyone can view songs" ON public.session_songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add songs" ON public.session_songs FOR INSERT TO authenticated WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Users can remove own songs" ON public.session_songs FOR DELETE TO authenticated USING (auth.uid() = requested_by);
CREATE POLICY "Users can update own songs" ON public.session_songs FOR UPDATE TO authenticated USING (auth.uid() = requested_by);

-- Content: anyone can view, authenticated participants can upload, owners can delete
CREATE POLICY "Anyone can view content" ON public.session_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload content" ON public.session_content FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.session_content FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for session content
INSERT INTO storage.buckets (id, name, public) VALUES ('session-content', 'session-content', true);

CREATE POLICY "Anyone can view session content files" ON storage.objects FOR SELECT USING (bucket_id = 'session-content');
CREATE POLICY "Authenticated users can upload session content" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'session-content');
CREATE POLICY "Users can delete own session content" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'session-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_songs;
