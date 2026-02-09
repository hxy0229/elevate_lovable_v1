import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    check();
  }, [user]);

  // Admin CRUD operations
  const createSession = async (session: {
    name: string;
    name_cn: string;
    session_type: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    max_participants: number;
    max_songs: number;
    allowed_roles: string[];
    session_date?: string;
  }) => {
    const { error } = await supabase.from('sessions').insert({
      ...session,
      created_by: user?.id,
      session_date: session.session_date || null,
    });
    return { error };
  };

  const updateSession = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from('sessions').update(updates).eq('id', id);
    return { error };
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    return { error };
  };

  const removeRegistration = async (id: string) => {
    const { error } = await supabase.from('session_registrations').delete().eq('id', id);
    return { error };
  };

  const removeAnySong = async (id: string) => {
    const { error } = await supabase.from('session_songs').delete().eq('id', id);
    return { error };
  };

  const updateSongOrder = async (id: string, sortOrder: number) => {
    const { error } = await supabase.from('session_songs').update({ sort_order: sortOrder }).eq('id', id);
    return { error };
  };

  return {
    isAdmin,
    loading,
    createSession,
    updateSession,
    deleteSession,
    removeRegistration,
    removeAnySong,
    updateSongOrder,
  };
}
