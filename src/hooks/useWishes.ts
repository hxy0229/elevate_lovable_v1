import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type WishRole = 'vocal' | 'guitar' | 'keyboard' | 'drum';
export type AccompanyingInstrument = 'guitar' | 'keyboard';

export interface Wish {
  id: string;
  instance_id: string;
  user_id: string;
  song_title: string;
  artist: string;
  primary_role: WishRole;
  is_self_accompanied: boolean;
  accompanying_instrument: AccompanyingInstrument | null;
  song_version: string | null;
  song_link: string | null;
  score_links: string[];
  file_urls: string[];
  special_requirements: string | null;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WishInput {
  instance_id: string;
  song_title: string;
  artist: string;
  primary_role: WishRole;
  is_self_accompanied?: boolean;
  accompanying_instrument?: AccompanyingInstrument | null;
  song_version?: string;
  song_link?: string;
  score_links?: string[];
  file_urls?: string[];
  special_requirements?: string;
  user_id?: string; // admin can set on behalf
}

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWishes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (data) setWishes(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();

    const channel = supabase
      .channel('wishes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => fetchWishes())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const createWish = async (input: WishInput) => {
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return false;
    }

    const insertData = {
      instance_id: input.instance_id,
      user_id: input.user_id || user.id,
      song_title: input.song_title,
      artist: input.artist,
      primary_role: input.primary_role,
      is_self_accompanied: input.is_self_accompanied || false,
      accompanying_instrument: input.accompanying_instrument || null,
      song_version: input.song_version || null,
      song_link: input.song_link || null,
      score_links: input.score_links || [],
      file_urls: input.file_urls || [],
      special_requirements: input.special_requirements || null,
    };

    const { data, error } = await supabase.from('wishes').insert(insertData as any).select().single();

    if (error) {
      toast({ title: 'Failed to create wish', description: error.message, variant: 'destructive' });
      return false;
    }
    if (data) {
      setWishes(prev => [...prev, data as any]);
    }
    toast({ title: 'Wish created! 🎶' });
    return true;
  };

  const updateWish = async (id: string, expectedVersion: number, updates: Partial<WishInput>) => {
    if (!user) return false;

    // Concurrency check: only update if version matches
    const { data, error } = await supabase
      .from('wishes')
      .update({ ...updates, version: expectedVersion + 1 } as any)
      .eq('id', id)
      .eq('version', expectedVersion)
      .select()
      .maybeSingle();

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    if (!data) {
      toast({
        title: 'Version conflict',
        description: 'This wish has been modified. Please refresh and try again.',
        variant: 'destructive',
      });
      await fetchWishes();
      return false;
    }
    toast({ title: 'Wish updated!' });
    return true;
  };

  const deleteWish = async (id: string) => {
    setWishes(prev => prev.filter(w => w.id !== id));
    const { error } = await supabase.from('wishes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      await fetchWishes();
      return false;
    }
    return true;
  };

  const reorderWishes = async (orderedIds: { id: string; sort_order: number }[]) => {
    for (const item of orderedIds) {
      await supabase.from('wishes').update({ sort_order: item.sort_order } as any).eq('id', item.id);
    }
    await fetchWishes();
  };

  const uploadWishFile = async (instanceId: string, file: File) => {
    if (!user) return null;
    const filePath = `${user.id}/${instanceId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('wish-files').upload(filePath, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data } = supabase.storage.from('wish-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getWishesForInstance = (instanceId: string) => wishes.filter(w => w.instance_id === instanceId);
  const getMyWishes = (instanceId: string) => wishes.filter(w => w.instance_id === instanceId && w.user_id === user?.id);

  return {
    wishes,
    loading,
    createWish,
    updateWish,
    deleteWish,
    reorderWishes,
    uploadWishFile,
    getWishesForInstance,
    getMyWishes,
    refetch: fetchWishes,
  };
}
