import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SessionType {
  id: string;
  value: string;
  label_en: string;
  label_cn: string;
  icon: string;
  sort_order: number;
}

export interface SessionRole {
  id: string;
  value: string;
  label_en: string;
  label_cn: string;
  icon: string;
  sort_order: number;
}

export function useSessionConfig() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [sessionRoles, setSessionRoles] = useState<SessionRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    setLoading(true);
    const [typesRes, rolesRes] = await Promise.all([
      supabase.from('session_types').select('*').order('sort_order'),
      supabase.from('session_roles').select('*').order('sort_order'),
    ]);
    if (typesRes.data) setSessionTypes(typesRes.data as any);
    if (rolesRes.data) setSessionRoles(rolesRes.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const addSessionType = async (value: string, labelEn: string, labelCn: string, icon: string) => {
    const maxOrder = sessionTypes.reduce((max, t) => Math.max(max, t.sort_order), 0);
    const { error } = await supabase.from('session_types').insert({
      value, label_en: labelEn, label_cn: labelCn, icon, sort_order: maxOrder + 1,
    } as any);
    if (error) {
      toast({ title: 'Failed to add type', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Session type added!' });
    await fetchConfig();
    return true;
  };

  const removeSessionType = async (id: string) => {
    const { error } = await supabase.from('session_types').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to remove type', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchConfig();
    return true;
  };

  const addSessionRole = async (value: string, labelEn: string, labelCn: string, icon: string) => {
    const maxOrder = sessionRoles.reduce((max, r) => Math.max(max, r.sort_order), 0);
    const { error } = await supabase.from('session_roles').insert({
      value, label_en: labelEn, label_cn: labelCn, icon, sort_order: maxOrder + 1,
    } as any);
    if (error) {
      toast({ title: 'Failed to add role', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Role added!' });
    await fetchConfig();
    return true;
  };

  const removeSessionRole = async (id: string) => {
    const { error } = await supabase.from('session_roles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to remove role', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchConfig();
    return true;
  };

  return {
    sessionTypes,
    sessionRoles,
    loading,
    addSessionType,
    removeSessionType,
    addSessionRole,
    removeSessionRole,
    refetchConfig: fetchConfig,
  };
}
