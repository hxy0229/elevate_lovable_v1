import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MusicSheetRow {
  id: string;
  session_id: string;
  song_id: string | null;
  user_id: string;
  instrument_type: string;
  title: string;
  file_url: string | null;
  content_text: string | null;
  created_at: string;
}

export function useMusicSheets() {
  const [sheets, setSheets] = useState<MusicSheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSheets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('music_sheets')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSheets(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const uploadSheet = async (
    sessionId: string,
    instrumentType: string,
    title: string,
    file?: File,
    contentText?: string,
    songId?: string,
  ) => {
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return false;
    }

    let fileUrl: string | null = null;
    if (file) {
      const filePath = `${user.id}/${sessionId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('music-sheets')
        .upload(filePath, file);
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        return false;
      }
      const { data: urlData } = supabase.storage.from('music-sheets').getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('music_sheets').insert({
      session_id: sessionId,
      song_id: songId || null,
      user_id: user.id,
      instrument_type: instrumentType,
      title,
      file_url: fileUrl,
      content_text: contentText || null,
    } as any);

    if (error) {
      toast({ title: 'Failed to upload sheet', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Music sheet uploaded!' });
    await fetchSheets();
    return true;
  };

  const deleteSheet = async (sheetId: string) => {
    const { error } = await supabase.from('music_sheets').delete().eq('id', sheetId);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchSheets();
    return true;
  };

  return { sheets, loading, uploadSheet, deleteSheet, refetch: fetchSheets };
}
