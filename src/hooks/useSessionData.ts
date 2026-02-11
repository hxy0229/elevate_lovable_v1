import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SessionRow {
  id: string;
  name: string;
  name_cn: string | null;
  session_type: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  theme: string | null;
  theme_cn: string | null;
  session_date: string | null;
  created_by: string | null;
  recurrence_rule: string | null;
  is_archived: boolean;
  announcement: string | null;
  announcement_cn: string | null;
}

export interface RegistrationRow {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  roles: string[];
  registered_at: string;
}

export interface SongRow {
  id: string;
  session_id: string;
  requested_by: string;
  singer_name: string;
  song_title: string;
  artist: string;
  song_key: string;
  sort_order: number;
}

export interface ContentRow {
  id: string;
  session_id: string;
  user_id: string;
  content_type: string;
  title: string | null;
  description: string | null;
  file_url: string | null;
  content_text: string | null;
  uploaded_at: string;
}

export function useSessionData() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [contents, setContents] = useState<ContentRow[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [sessRes, regRes, songRes, contentRes] = await Promise.all([
      supabase.from('sessions').select('*').order('day_of_week').order('start_time'),
      supabase.from('session_registrations').select('*'),
      supabase.from('session_songs').select('*').order('sort_order'),
      supabase.from('session_content').select('*').order('uploaded_at', { ascending: false }),
    ]);
    if (sessRes.data) setSessions(sessRes.data as any);
    if (regRes.data) setRegistrations(regRes.data as any);
    if (songRes.data) setSongs(songRes.data as any);
    if (contentRes.data) setContents(contentRes.data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    // Realtime subscriptions
    const regChannel = supabase
      .channel('session-registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_registrations' }, () => fetchAll())
      .subscribe();
    const songChannel = supabase
      .channel('session-songs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_songs' }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(regChannel);
      supabase.removeChannel(songChannel);
    };
  }, []);

  const register = async (sessionId: string, displayName: string, roles: string[]) => {
    if (!user) {
      toast({ title: 'Please log in to register', variant: 'destructive' });
      return false;
    }
    const { error } = await supabase.from('session_registrations').insert({
      session_id: sessionId,
      user_id: user.id,
      display_name: displayName,
      roles,
    });
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Registered successfully!' });
    return true;
  };

  const unregister = async (sessionId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('session_registrations')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Failed to unregister', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Unregistered successfully' });
    return true;
  };

  const addSong = async (sessionId: string, singerName: string, songTitle: string, artist: string, songKey: string) => {
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return false;
    }
    const sessionSongs = songs.filter((s) => s.session_id === sessionId);
    const { error } = await supabase.from('session_songs').insert({
      session_id: sessionId,
      requested_by: user.id,
      singer_name: singerName,
      song_title: songTitle,
      artist: artist,
      song_key: songKey,
      sort_order: sessionSongs.length + 1,
    });
    if (error) {
      toast({ title: 'Failed to add song', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Song added!' });
    return true;
  };

  const removeSong = async (songId: string) => {
    const { error } = await supabase.from('session_songs').delete().eq('id', songId);
    if (error) {
      toast({ title: 'Failed to remove song', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const updateTheme = async (sessionId: string, theme: string, themeCn: string) => {
    const { error } = await supabase.from('sessions').update({ theme, theme_cn: themeCn }).eq('id', sessionId);
    if (error) {
      toast({ title: 'Failed to update theme', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Theme updated!' });
    await fetchAll();
    return true;
  };

  const uploadContent = async (
    sessionId: string,
    contentType: string,
    file?: File,
    title?: string,
    description?: string,
    contentText?: string
  ) => {
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return false;
    }
    let fileUrl: string | null = null;
    if (file) {
      const filePath = `${user.id}/${sessionId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('session-content')
        .upload(filePath, file);
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        return false;
      }
      const { data: urlData } = supabase.storage.from('session-content').getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }
    const { error } = await supabase.from('session_content').insert({
      session_id: sessionId,
      user_id: user.id,
      content_type: contentType,
      title,
      description,
      file_url: fileUrl,
      content_text: contentText,
    });
    if (error) {
      toast({ title: 'Failed to save content', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Content uploaded!' });
    await fetchAll();
    return true;
  };

  const deleteContent = async (contentId: string) => {
    const { error } = await supabase.from('session_content').delete().eq('id', contentId);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchAll();
    return true;
  };

  return {
    sessions,
    registrations,
    songs,
    contents,
    user,
    loading,
    register,
    unregister,
    addSong,
    removeSong,
    updateTheme,
    uploadContent,
    deleteContent,
    refetch: fetchAll,
  };
}
