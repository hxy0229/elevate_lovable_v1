import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { addWeeks, addDays, format, parseISO, getDay } from 'date-fns';

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

  /**
   * Generate recurring instances for a parent session.
   * @param session - Parent session with day_of_week, start_time, end_time, recurrence_rule
   * @param weeksAhead - How many weeks to generate (default 8)
   */
  const generateRecurringInstances = async (
    session: {
      id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      recurrence_rule: string | null;
    },
    weeksAhead: number = 8
  ) => {
    const rule = session.recurrence_rule || 'weekly';
    const today = new Date();
    const dates: string[] = [];

    // Find the next occurrence of the target day_of_week
    let cursor = new Date(today);
    const targetDay = session.day_of_week;
    const currentDay = getDay(cursor);
    const daysUntil = (targetDay - currentDay + 7) % 7 || 7; // at least 1 day ahead
    cursor = addDays(cursor, daysUntil);

    const increment = rule === 'biweekly' ? 2 : rule === 'monthly' ? 4 : 1;

    for (let i = 0; i < weeksAhead; i++) {
      dates.push(format(cursor, 'yyyy-MM-dd'));
      cursor = addWeeks(cursor, increment);
    }

    // Filter out dates that already have instances
    const existingDates = new Set(
      instances
        .filter(inst => inst.session_id === session.id)
        .map(inst => inst.instance_date)
    );
    const newDates = dates.filter(d => !existingDates.has(d));

    if (newDates.length === 0) {
      return { created: 0, error: null };
    }

    const rows = newDates.map(d => ({
      session_id: session.id,
      instance_date: d,
      start_time: session.start_time.substring(0, 5),
      end_time: session.end_time.substring(0, 5),
    }));

    const { error } = await supabase.from('session_instances').insert(rows as any);
    if (!error) await fetchInstances();
    return { created: newDates.length, error };
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
    generateRecurringInstances,
    updateInstance,
    deleteInstance,
    setInstanceStatus,
    refetch: fetchInstances,
  };
}
