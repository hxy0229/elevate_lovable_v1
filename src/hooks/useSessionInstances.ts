import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { addWeeks, format } from 'date-fns';

export interface SessionInstance {
  id: string;
  session_id: string;
  instance_date: string;
  start_time: string;
  end_time: string;
  status: 'draft' | 'open' | 'published';
  name_override: string | null;
  name_cn_override: string | null;
  theme: string | null;
  theme_cn: string | null;
  announcement: string | null;
  announcement_cn: string | null;
  created_at: string;
  updated_at: string;
  // Joined from parent session
  session?: {
    id: string;
    name: string;
    name_cn: string | null;
    session_type: string;
    allowed_roles: string[];
  };
}

export function useSessionInstances() {
  const [instances, setInstances] = useState<SessionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const fetchInstances = async () => {
    setLoading(true);

    let query = supabase
      .from('session_instances')
      .select('*, session:sessions(id, name, name_cn, session_type, allowed_roles)')
      .order('instance_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Non-admins only see upcoming 3 weeks
    if (!isAdmin) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const threeWeeks = format(addWeeks(new Date(), 3), 'yyyy-MM-dd');
      query = query
        .gte('instance_date', today)
        .lte('instance_date', threeWeeks);
    }

    const { data, error } = await query;
    if (data) {
      setInstances(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstances();
  }, [isAdmin]);

  const createInstance = async (instance: {
    session_id: string;
    instance_date: string;
    start_time: string;
    end_time: string;
    status?: 'draft' | 'open' | 'published';
    name_override?: string;
    name_cn_override?: string;
    theme?: string;
    theme_cn?: string;
    announcement?: string;
    announcement_cn?: string;
  }) => {
    const { error } = await supabase.from('session_instances').insert(instance as any);
    if (!error) await fetchInstances();
    return { error };
  };

  const updateInstance = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from('session_instances').update(updates as any).eq('id', id);
    if (!error) await fetchInstances();
    return { error };
  };

  const deleteInstance = async (id: string) => {
    const { error } = await supabase.from('session_instances').delete().eq('id', id);
    if (!error) await fetchInstances();
    return { error };
  };

  const setInstanceStatus = async (id: string, status: 'draft' | 'open' | 'published') => {
    return updateInstance(id, { status });
  };

  return {
    instances,
    loading,
    createInstance,
    updateInstance,
    deleteInstance,
    setInstanceStatus,
    refetch: fetchInstances,
  };
}
