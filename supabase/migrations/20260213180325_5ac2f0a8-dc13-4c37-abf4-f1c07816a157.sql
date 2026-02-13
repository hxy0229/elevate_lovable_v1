
CREATE TABLE public.contact_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  lessons TEXT[] DEFAULT '{}',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact enquiry"
  ON public.contact_enquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read enquiries"
  ON public.contact_enquiries
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
