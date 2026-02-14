
-- Status enum for session instances
CREATE TYPE public.session_instance_status AS ENUM ('draft', 'open', 'published');

-- Role enums for wishes
CREATE TYPE public.wish_role AS ENUM ('vocal', 'guitar', 'keyboard', 'drum');
CREATE TYPE public.accompanying_instrument AS ENUM ('guitar', 'keyboard');

-- Session instances (individual occurrences of a session series)
CREATE TABLE public.session_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status session_instance_status NOT NULL DEFAULT 'draft',
  name_override TEXT,
  name_cn_override TEXT,
  theme TEXT,
  theme_cn TEXT,
  announcement TEXT,
  announcement_cn TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see open/published, admins see all"
  ON public.session_instances FOR SELECT
  USING (status IN ('open', 'published') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create instances"
  ON public.session_instances FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update instances"
  ON public.session_instances FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete instances"
  ON public.session_instances FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Wishes table (replaces session_songs + session_registrations)
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.session_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  primary_role wish_role NOT NULL,
  is_self_accompanied BOOLEAN NOT NULL DEFAULT false,
  accompanying_instrument accompanying_instrument,
  song_version TEXT,
  song_link TEXT,
  score_links TEXT[] NOT NULL DEFAULT '{}',
  file_urls TEXT[] NOT NULL DEFAULT '{}',
  special_requirements TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Users see only own wishes; admins see all
CREATE POLICY "Users view own wishes"
  ON public.wishes FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Users insert wishes only in open instances
CREATE POLICY "Users create wishes in open instances"
  ON public.wishes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.session_instances WHERE id = instance_id AND status = 'open')
  );

-- Admins can create wishes on behalf of anyone
CREATE POLICY "Admins create any wish"
  ON public.wishes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users update own wishes only in open instances; version check is app-level
CREATE POLICY "Users update own wishes in open instances"
  ON public.wishes FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.session_instances WHERE id = instance_id AND status = 'open')
  );

CREATE POLICY "Admins update any wish"
  ON public.wishes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users delete own wishes in open instances"
  ON public.wishes FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.session_instances WHERE id = instance_id AND status = 'open')
  );

CREATE POLICY "Admins delete any wish"
  ON public.wishes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers
CREATE TRIGGER update_session_instances_updated_at
  BEFORE UPDATE ON public.session_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishes_updated_at
  BEFORE UPDATE ON public.wishes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for wish file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('wish-files', 'wish-files', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Auth users upload wish files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wish-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone view wish files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wish-files');

CREATE POLICY "Users delete own wish files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wish-files' AND auth.uid()::text = (storage.foldername(name))[1]);
