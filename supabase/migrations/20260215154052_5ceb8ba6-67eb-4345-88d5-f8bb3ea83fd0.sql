-- Add 'bass' to wish_role enum
ALTER TYPE public.wish_role ADD VALUE IF NOT EXISTS 'bass';

-- Add 'bass' to accompanying_instrument enum (for self-accompanied bass)
ALTER TYPE public.accompanying_instrument ADD VALUE IF NOT EXISTS 'bass';

-- Add 'drum' to accompanying_instrument enum (for self-accompanied drum)  
ALTER TYPE public.accompanying_instrument ADD VALUE IF NOT EXISTS 'drum';
