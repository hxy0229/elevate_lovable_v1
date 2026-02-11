
-- Session types table for admin-managed session categories
CREATE TABLE public.session_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label_en text NOT NULL,
  label_cn text NOT NULL,
  icon text DEFAULT '🎵',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view session types" ON public.session_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage session types" ON public.session_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update session types" ON public.session_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete session types" ON public.session_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Session roles table for admin-managed participant roles
CREATE TABLE public.session_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label_en text NOT NULL,
  label_cn text NOT NULL,
  icon text DEFAULT '🎵',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view session roles" ON public.session_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage session roles" ON public.session_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update session roles" ON public.session_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete session roles" ON public.session_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default session types
INSERT INTO public.session_types (value, label_en, label_cn, icon, sort_order) VALUES
  ('band', 'Band', '乐队', '🎸', 1),
  ('solo-vocal', 'Solo Vocal', '独唱', '🎤', 2);

-- Seed default roles
INSERT INTO public.session_roles (value, label_en, label_cn, icon, sort_order) VALUES
  ('Vocal', 'Vocal', '主唱', '🎤', 1),
  ('Guitar', 'Guitar', '吉他', '🎸', 2),
  ('Drums', 'Drums', '鼓', '🥁', 3),
  ('Bass', 'Bass', '贝斯', '🎵', 4),
  ('Keyboard', 'Keyboard', '键盘', '🎹', 5);

-- Allow admins to update registrations (for editing participant info)
CREATE POLICY "Admins can update any registration"
  ON public.session_registrations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert registrations on behalf of users
CREATE POLICY "Admins can add registrations"
  ON public.session_registrations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
