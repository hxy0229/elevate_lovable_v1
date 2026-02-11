import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAdmin } from '@/hooks/useAdmin';
import { useSessionData } from '@/hooks/useSessionData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Calendar, Plus, Trash2, Edit2, Save, X, Copy,
  Mic2, Guitar, ListMusic, Shield, Archive, ArchiveRestore,
  Megaphone, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';

interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  is_singer: boolean;
  is_musician: boolean;
  instruments: string[];
  created_at: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const roleOptions = ['Vocal', 'Guitar', 'Drums', 'Bass', 'Keyboard'];
const recurrenceOptions = [
  { value: '', label: 'No recurrence', labelCn: '不重复' },
  { value: 'weekly', label: 'Every week', labelCn: '每周' },
  { value: 'biweekly', label: 'Every 2 weeks', labelCn: '每两周' },
  { value: 'monthly', label: 'Every month', labelCn: '每月' },
];

const defaultForm = {
  name: '', name_cn: '', session_type: 'band', day_of_week: '2',
  start_time: '19:30', end_time: '21:30', max_participants: '15',
  max_songs: '10', allowed_roles: [...roleOptions], session_date: '',
  recurrence_rule: '', announcement: '', announcement_cn: '',
};

const Admin = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const {
    isAdmin, loading: adminLoading, createSession, updateSession,
    deleteSession, duplicateSession, archiveSession, unarchiveSession,
    removeRegistration, removeAnySong,
  } = useAdmin();
  const { sessions, registrations, songs, loading: dataLoading, refetch } = useSessionData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [form, setForm] = useState({ ...defaultForm });
  const [showArchived, setShowArchived] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setProfiles(data as ProfileRow[]);
    });
  }, []);

  if (authLoading || adminLoading || dataLoading) {
    return (
      <Layout>
        <section className="py-20"><div className="container mx-auto px-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div></section>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  const en = language === 'en';
  const totalMembers = profiles.length;
  const totalSingers = profiles.filter(p => p.is_singer).length;
  const totalMusicians = profiles.filter(p => p.is_musician).length;

  const toggleAllowedRole = (role: string, target: 'form' | 'edit') => {
    if (target === 'form') {
      setForm(f => ({
        ...f,
        allowed_roles: f.allowed_roles.includes(role)
          ? f.allowed_roles.filter(r => r !== role) : [...f.allowed_roles, role],
      }));
    } else {
      setEditForm(f => ({
        ...f,
        allowed_roles: (f.allowed_roles || []).includes(role)
          ? (f.allowed_roles || []).filter((r: string) => r !== role) : [...(f.allowed_roles || []), role],
      }));
    }
  };

  const handleCreate = async () => {
    const { error } = await createSession({
      name: form.name, name_cn: form.name_cn, session_type: form.session_type,
      day_of_week: parseInt(form.day_of_week), start_time: form.start_time,
      end_time: form.end_time, max_participants: parseInt(form.max_participants),
      max_songs: parseInt(form.max_songs), allowed_roles: form.allowed_roles,
      session_date: form.session_date || undefined,
      recurrence_rule: (form.recurrence_rule && form.recurrence_rule !== 'none') ? form.recurrence_rule : undefined,
      announcement: form.announcement || undefined,
      announcement_cn: form.announcement_cn || undefined,
    });
    if (error) {
      toast({ title: 'Failed to create session', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Session created!' });
      setShowCreateForm(false);
      setForm({ ...defaultForm });
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteSession(id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Session deleted' }); refetch(); }
  };

  const handleDuplicate = async (id: string) => {
    const { error } = await duplicateSession(id);
    if (error) toast({ title: 'Duplicate failed', description: error.message, variant: 'destructive' });
    else { toast({ title: en ? 'Session duplicated!' : '活动已复制！' }); refetch(); }
  };

  const handleArchive = async (id: string) => {
    const { error } = await archiveSession(id);
    if (error) toast({ title: 'Archive failed', variant: 'destructive' });
    else { toast({ title: en ? 'Session archived' : '活动已归档' }); refetch(); }
  };

  const handleUnarchive = async (id: string) => {
    const { error } = await unarchiveSession(id);
    if (error) toast({ title: 'Unarchive failed', variant: 'destructive' });
    else { toast({ title: en ? 'Session restored' : '活动已恢复' }); refetch(); }
  };

  const startEdit = (session: any) => {
    setEditingId(session.id);
    setEditForm({
      name: session.name, name_cn: session.name_cn || '',
      session_type: session.session_type, day_of_week: String(session.day_of_week),
      start_time: session.start_time?.substring(0, 5), end_time: session.end_time?.substring(0, 5),
      max_participants: String(session.max_participants),
      max_songs: String(session.max_songs ?? 10),
      allowed_roles: session.allowed_roles || [...roleOptions],
      session_date: session.session_date || '',
      recurrence_rule: session.recurrence_rule || 'none',
      announcement: session.announcement || '',
      announcement_cn: session.announcement_cn || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await updateSession(editingId, {
      name: editForm.name, name_cn: editForm.name_cn || null,
      session_type: editForm.session_type,
      day_of_week: parseInt(editForm.day_of_week),
      start_time: editForm.start_time, end_time: editForm.end_time,
      max_participants: parseInt(editForm.max_participants),
      max_songs: parseInt(editForm.max_songs),
      allowed_roles: editForm.allowed_roles,
      session_date: editForm.session_date || null,
      recurrence_rule: (editForm.recurrence_rule && editForm.recurrence_rule !== 'none') ? editForm.recurrence_rule : null,
      announcement: editForm.announcement || null,
      announcement_cn: editForm.announcement_cn || null,
    });
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    else { toast({ title: en ? 'Session updated!' : '活动已更新！' }); setEditingId(null); refetch(); }
  };

  const toggleExpand = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeSessions = sessions.filter(s => !(s as any).is_archived);
  const archivedSessions = sessions.filter(s => (s as any).is_archived);

  const renderSessionForm = (f: any, setF: (fn: (prev: any) => any) => void, target: 'form' | 'edit') => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Name (EN)' : '名称（英文）'}</label>
          <Input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Band Rehearsal" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Name (CN)' : '名称（中文）'}</label>
          <Input value={f.name_cn} onChange={e => setF(p => ({ ...p, name_cn: e.target.value }))} placeholder="乐队排练" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Type' : '类型'}</label>
          <Select value={f.session_type} onValueChange={v => setF(p => ({ ...p, session_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="band">{en ? 'Band' : '乐队'}</SelectItem>
              <SelectItem value="solo-vocal">{en ? 'Solo Vocal' : '独唱'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Day of Week' : '星期几'}</label>
          <Select value={f.day_of_week} onValueChange={v => setF(p => ({ ...p, day_of_week: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dayNames.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Start Time' : '开始时间'}</label>
          <Input type="time" value={f.start_time} onChange={e => setF(p => ({ ...p, start_time: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'End Time' : '结束时间'}</label>
          <Input type="time" value={f.end_time} onChange={e => setF(p => ({ ...p, end_time: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Max Participants' : '最大人数'}</label>
          <Input type="number" value={f.max_participants} onChange={e => setF(p => ({ ...p, max_participants: e.target.value }))} min="1" max="50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Max Songs' : '最大歌曲数'}</label>
          <Input type="number" value={f.max_songs} onChange={e => setF(p => ({ ...p, max_songs: e.target.value }))} min="1" max="50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">{en ? 'Session Date (optional)' : '活动日期（可选）'}</label>
          <Input type="date" value={f.session_date} onChange={e => setF(p => ({ ...p, session_date: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> {en ? 'Recurrence' : '重复规则'}
          </label>
          <Select value={f.recurrence_rule || ''} onValueChange={v => setF(p => ({ ...p, recurrence_rule: v }))}>
            <SelectTrigger><SelectValue placeholder={en ? 'No recurrence' : '不重复'} /></SelectTrigger>
            <SelectContent>
              {recurrenceOptions.map(o => (
                <SelectItem key={o.value} value={o.value || 'none'}>{en ? o.label : o.labelCn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Allowed Roles */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">{en ? 'Allowed Roles' : '允许角色'}</label>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map(role => (
            <button key={role} onClick={() => toggleAllowedRole(role, target)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                (f.allowed_roles || []).includes(role)
                  ? 'bg-primary/10 border-primary text-foreground'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Announcement */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5" /> {en ? 'Announcement (EN)' : '公告（英文）'}
        </label>
        <Textarea
          value={f.announcement || ''}
          onChange={e => setF(p => ({ ...p, announcement: e.target.value }))}
          placeholder={en ? 'Optional announcement visible to all members...' : '对所有成员可见的公告...'}
          className="bg-background border-border min-h-[60px]"
          maxLength={500}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5" /> {en ? 'Announcement (CN)' : '公告（中文）'}
        </label>
        <Textarea
          value={f.announcement_cn || ''}
          onChange={e => setF(p => ({ ...p, announcement_cn: e.target.value }))}
          placeholder={en ? 'Chinese announcement...' : '中文公告...'}
          className="bg-background border-border min-h-[60px]"
          maxLength={500}
        />
      </div>
    </div>
  );

  const renderSessionCard = (session: any, isArchived = false) => {
    const sessionRegs = registrations.filter(r => r.session_id === session.id);
    const sessionSongs = songs.filter(s => s.session_id === session.id);
    const sessionName = en ? session.name : (session.name_cn || session.name);
    const isEditing = editingId === session.id;
    const isExpanded = expandedSessions.has(session.id);
    const recLabel = recurrenceOptions.find(o => o.value === session.recurrence_rule);

    return (
      <Card key={session.id} className={`border-border ${isArchived ? 'opacity-60' : ''}`}>
        <CardHeader className="bg-secondary/30 border-b border-border">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                {session.session_type === 'solo-vocal' ? '🎤' : '🎸'} {sessionName}
                <Badge variant="outline" className="ml-1">{dayNames[session.day_of_week]}</Badge>
                {session.recurrence_rule && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {en ? recLabel?.label : recLabel?.labelCn}
                  </Badge>
                )}
                {isArchived && <Badge variant="secondary" className="text-xs">📦 {en ? 'Archived' : '已归档'}</Badge>}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)} ·{' '}
                {en ? 'Max' : '最多'} {session.max_participants} {en ? 'pax' : '人'} ·{' '}
                {en ? 'Max' : '最多'} {session.max_songs ?? 10} {en ? 'songs' : '首歌'}
                {session.session_date && ` · ${session.session_date}`}
              </p>
              {session.announcement && !isEditing && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <Megaphone className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground">
                    {en ? session.announcement : (session.announcement_cn || session.announcement)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isArchived && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => isEditing ? setEditingId(null) : startEdit(session)} title={en ? 'Edit' : '编辑'}>
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(session.id)} title={en ? 'Duplicate' : '复制'}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchive(session.id)} title={en ? 'Archive' : '归档'}>
                    <Archive className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isArchived && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUnarchive(session.id)} title={en ? 'Restore' : '恢复'}>
                  <ArchiveRestore className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(session.id)} title={en ? 'Delete' : '删除'}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Inline edit form */}
        {isEditing && (
          <CardContent className="p-5 border-b border-border bg-secondary/10">
            {renderSessionForm(editForm, setEditForm, 'edit')}
            <div className="flex gap-3 mt-4">
              <Button onClick={saveEdit} disabled={!editForm.name?.trim()} className="rounded-full">
                <Save className="w-4 h-4 mr-1.5" /> {en ? 'Save' : '保存'}
              </Button>
              <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-full">
                <X className="w-4 h-4 mr-1.5" /> {en ? 'Cancel' : '取消'}
              </Button>
            </div>
          </CardContent>
        )}

        {/* Expandable content */}
        <CardContent className="p-5 space-y-4">
          <button onClick={() => toggleExpand(session.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {en ? `Participants (${sessionRegs.length}) · Songs (${sessionSongs.length})` : `参与者 (${sessionRegs.length}) · 歌曲 (${sessionSongs.length})`}
          </button>

          {isExpanded && (
            <>
              {/* Participants */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  {en ? 'Participants' : '参与者'} ({sessionRegs.length})
                </h4>
                {sessionRegs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{en ? 'No registrations yet' : '暂无报名'}</p>
                ) : (
                  <div className="space-y-1">
                    {sessionRegs.map(reg => (
                      <div key={reg.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{reg.display_name}</span>
                          <span className="text-xs text-muted-foreground">{reg.roles.join(', ')}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          removeRegistration(reg.id).then(({ error }) => {
                            if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
                            else refetch();
                          });
                        }} className="h-7 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Songs */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <ListMusic className="w-4 h-4 text-primary" />
                  {en ? 'Song List' : '歌曲列表'} ({sessionSongs.length})
                </h4>
                {sessionSongs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{en ? 'No songs yet' : '暂无歌曲'}</p>
                ) : (
                  <div className="space-y-1">
                    {sessionSongs.map(song => (
                      <div key={song.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{song.sort_order}</span>
                          <span className="font-medium text-foreground">{song.singer_name}</span>
                          <Badge variant="outline" className="text-xs">{song.song_key}</Badge>
                          <span className="text-muted-foreground">{song.artist} - {song.song_title}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          removeAnySong(song.id).then(({ error }) => {
                            if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
                            else refetch();
                          });
                        }} className="h-7 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">
              {en ? 'Admin Dashboard' : '管理后台'}
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: en ? 'Members' : '会员', value: totalMembers, icon: Users },
              { label: en ? 'Singers' : '歌手', value: totalSingers, icon: Mic2 },
              { label: en ? 'Musicians' : '乐手', value: totalMusicians, icon: Guitar },
              { label: en ? 'Active' : '活跃', value: activeSessions.length, icon: Calendar },
              { label: en ? 'Archived' : '已归档', value: archivedSessions.length, icon: Archive },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="sessions" className="gap-1.5">
                <Calendar className="w-4 h-4" /> {en ? 'Sessions' : '活动'}
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5">
                <Users className="w-4 h-4" /> {en ? 'Members' : '会员'}
              </TabsTrigger>
            </TabsList>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {en ? 'Manage Sessions' : '管理活动'}
                </h2>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="rounded-full gap-1.5">
                  <Plus className="w-4 h-4" /> {en ? 'New Session' : '新建活动'}
                </Button>
              </div>

              {/* Create Session Form */}
              {showCreateForm && (
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{en ? 'Create New Session' : '创建新活动'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderSessionForm(form, setForm, 'form')}
                    <div className="flex gap-3">
                      <Button onClick={handleCreate} disabled={!form.name.trim()} className="rounded-full">
                        <Save className="w-4 h-4 mr-1.5" /> {en ? 'Create' : '创建'}
                      </Button>
                      <Button variant="ghost" onClick={() => setShowCreateForm(false)} className="rounded-full">
                        <X className="w-4 h-4 mr-1.5" /> {en ? 'Cancel' : '取消'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Sessions */}
              {activeSessions.map(session => renderSessionCard(session))}

              {activeSessions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">{en ? 'No active sessions' : '暂无活跃活动'}</p>
              )}

              {/* Archived Sessions */}
              {archivedSessions.length > 0 && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    {en ? `Archived Sessions (${archivedSessions.length})` : `已归档活动 (${archivedSessions.length})`}
                    {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showArchived && archivedSessions.map(session => renderSessionCard(session, true))}
                </div>
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {en ? 'Member Directory' : '会员目录'}
              </h2>
              <div className="grid gap-3">
                {profiles.map(profile => (
                  <Card key={profile.id} className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{profile.display_name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">
                            {en ? 'Joined' : '加入'}: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.is_singer && <Badge variant="outline"><Mic2 className="w-3 h-3 mr-1" />{en ? 'Singer' : '歌手'}</Badge>}
                        {profile.is_musician && <Badge variant="outline"><Guitar className="w-3 h-3 mr-1" />{en ? 'Musician' : '乐手'}</Badge>}
                        {profile.instruments.length > 0 && (
                          <Badge variant="secondary" className="text-xs">{profile.instruments.join(', ')}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {profiles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{en ? 'No members yet' : '暂无会员'}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
