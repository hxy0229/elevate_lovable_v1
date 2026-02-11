
-- Add input validation constraints to prevent abuse

-- Sessions table constraints
ALTER TABLE public.sessions ADD CONSTRAINT check_max_participants 
  CHECK (max_participants > 0 AND max_participants <= 200);

ALTER TABLE public.sessions ADD CONSTRAINT check_max_songs 
  CHECK (max_songs > 0 AND max_songs <= 100);

ALTER TABLE public.sessions ADD CONSTRAINT check_name_length 
  CHECK (length(name) >= 1 AND length(name) <= 200);

ALTER TABLE public.sessions ADD CONSTRAINT check_announcement_length 
  CHECK (length(COALESCE(announcement, '')) <= 2000);

ALTER TABLE public.sessions ADD CONSTRAINT check_announcement_cn_length 
  CHECK (length(COALESCE(announcement_cn, '')) <= 2000);

ALTER TABLE public.sessions ADD CONSTRAINT check_theme_length 
  CHECK (length(COALESCE(theme, '')) <= 200);

-- Session registrations constraints
ALTER TABLE public.session_registrations ADD CONSTRAINT check_display_name_length 
  CHECK (length(display_name) >= 1 AND length(display_name) <= 100);

-- Session songs constraints
ALTER TABLE public.session_songs ADD CONSTRAINT check_song_title_length 
  CHECK (length(song_title) >= 1 AND length(song_title) <= 300);

ALTER TABLE public.session_songs ADD CONSTRAINT check_singer_name_length 
  CHECK (length(singer_name) >= 1 AND length(singer_name) <= 100);

ALTER TABLE public.session_songs ADD CONSTRAINT check_artist_length 
  CHECK (length(artist) >= 1 AND length(artist) <= 200);

ALTER TABLE public.session_songs ADD CONSTRAINT check_song_key_length 
  CHECK (length(song_key) >= 1 AND length(song_key) <= 20);

-- Music sheets constraints
ALTER TABLE public.music_sheets ADD CONSTRAINT check_title_length 
  CHECK (length(title) >= 1 AND length(title) <= 200);

ALTER TABLE public.music_sheets ADD CONSTRAINT check_content_text_length 
  CHECK (length(COALESCE(content_text, '')) <= 50000);

-- Session content constraints
ALTER TABLE public.session_content ADD CONSTRAINT check_content_text_length 
  CHECK (length(COALESCE(content_text, '')) <= 50000);

ALTER TABLE public.session_content ADD CONSTRAINT check_title_length 
  CHECK (length(COALESCE(title, '')) <= 200);
