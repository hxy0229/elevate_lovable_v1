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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Music, Calendar, BarChart3, Plus, Trash2, Edit2, Save, X,
  Mic2, Guitar, Drum, Piano, ListMusic, Shield,
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

const Admin = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, createSession, updateSession, deleteSession, removeRegistration, removeAnySong } = useAdmin();
  const { sessions, registrations, songs, loading: dataLoading, refetch } = useSessionData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    name: '', name_cn: '', session_type: 'band', day_of_week: '2',
    start_time: '19:30', end_time: '21:30', max_participants: '15',
    max_songs: '10', allowed_roles: [...roleOptions], session_date: '',
  });

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

  // Stats
  const totalMembers = profiles.length;
  const totalSingers = profiles.filter(p => p.is_singer).length;
  const totalMusicians = profiles.filter(p => p.is_musician).length;
  const totalRegistrations = registrations.length;
  const totalSongs = songs.length;

  const toggleAllowedRole = (role: string) => {
    setForm(f => ({
      ...f,
      allowed_roles: f.allowed_roles.includes(role)
        ? f.allowed_roles.filter(r => r !== role)
        : [...f.allowed_roles, role],
    }));
  };

  const handleCreate = async () => {
    const { error } = await createSession({
      name: form.name,
      name_cn: form.name_cn,
      session_type: form.session_type,
      day_of_week: parseInt(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      max_participants: parseInt(form.max_participants),
      max_songs: parseInt(form.max_songs),
      allowed_roles: form.allowed_roles,
      session_date: form.session_date || undefined,
    });
    if (error) {
      toast({ title: 'Failed to create session', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Session created!' });
      setShowCreateForm(false);
      setForm({ name: '', name_cn: '', session_type: 'band', day_of_week: '2', start_time: '19:30', end_time: '21:30', max_participants: '15', max_songs: '10', allowed_roles: [...roleOptions], session_date: '' });
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteSession(id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Session deleted' }); refetch(); }
  };

  const handleRemoveRegistration = async (id: string) => {
    const { error } = await removeRegistration(id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else refetch();
  };

  const handleRemoveSong = async (id: string) => {
    const { error } = await removeAnySong(id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else refetch();
  };

  const en = language === 'en';

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
              { label: en ? 'Registrations' : '报名', value: totalRegistrations, icon: Calendar },
              { label: en ? 'Songs' : '歌曲', value: totalSongs, icon: ListMusic },
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Name (EN)' : '名称（英文）'}</label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Band Rehearsal" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Name (CN)' : '名称（中文）'}</label>
                        <Input value={form.name_cn} onChange={e => setForm(f => ({ ...f, name_cn: e.target.value }))} placeholder="乐队排练" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Type' : '类型'}</label>
                        <Select value={form.session_type} onValueChange={v => setForm(f => ({ ...f, session_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="band">{en ? 'Band' : '乐队'}</SelectItem>
                            <SelectItem value="solo-vocal">{en ? 'Solo Vocal' : '独唱'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Day of Week' : '星期几'}</label>
                        <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {dayNames.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Start Time' : '开始时间'}</label>
                        <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'End Time' : '结束时间'}</label>
                        <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Max Participants' : '最大人数'}</label>
                        <Input type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} min="1" max="50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Max Songs' : '最大歌曲数'}</label>
                        <Input type="number" value={form.max_songs} onChange={e => setForm(f => ({ ...f, max_songs: e.target.value }))} min="1" max="50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{en ? 'Session Date (optional)' : '活动日期（可选）'}</label>
                        <Input type="date" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{en ? 'Allowed Roles' : '允许角色'}</label>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map(role => (
                          <button
                            key={role}
                            onClick={() => toggleAllowedRole(role)}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              form.allowed_roles.includes(role)
                                ? 'bg-primary/10 border-primary text-foreground'
                                : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
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

              {/* Session List with Management */}
              {sessions.map(session => {
                const sessionRegs = registrations.filter(r => r.session_id === session.id);
                const sessionSongs = songs.filter(s => s.session_id === session.id);
                const sessionName = en ? session.name : (session.name_cn || session.name);

                return (
                  <Card key={session.id} className="border-border">
                    <CardHeader className="bg-secondary/30 border-b border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {session.session_type === 'solo-vocal' ? '🎤' : '🎸'} {sessionName}
                            <Badge variant="outline" className="ml-2">{dayNames[session.day_of_week]}</Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)} ·{' '}
                            {en ? 'Max' : '最多'} {session.max_participants} {en ? 'participants' : '人'} ·{' '}
                            {en ? 'Max' : '最多'} {(session as any).max_songs ?? 10} {en ? 'songs' : '首歌'}
                          </p>
                        </div>
                        <Button variant="destructive" size="sm" className="rounded-full" onClick={() => handleDelete(session.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> {en ? 'Delete' : '删除'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
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
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveRegistration(reg.id)} className="h-7 text-destructive hover:text-destructive">
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
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveSong(song.id)} className="h-7 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
