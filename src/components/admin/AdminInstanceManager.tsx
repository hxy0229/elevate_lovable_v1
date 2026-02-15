import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Trash2, Send, EyeOff, ChevronDown, ChevronUp,
  Clock, AlertTriangle, RefreshCw, Image, Edit2, ArrowUp, ArrowDown, Save, X, CheckSquare, Square,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSessionInstances, type SessionInstance } from '@/hooks/useSessionInstances';
import { useWishes, type WishInput } from '@/hooks/useWishes';
import { useAdmin } from '@/hooks/useAdmin';
import { useSessionConfig } from '@/hooks/useSessionConfig';
import { useToast } from '@/hooks/use-toast';
import { formatTime12h, formatSessionDate, calculateSchedule } from '@/lib/timeUtils';
import WishCard from '@/components/sessions/WishCard';
import WishForm from '@/components/sessions/WishForm';
import InstancePoster from '@/components/sessions/InstancePoster';
import InstanceEditDialog from './InstanceEditDialog';

interface AdminInstanceManagerProps {
  sessions: any[];
  profiles: { user_id: string; display_name: string }[];
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const recurrenceOptions = [
  { value: 'weekly', label: 'Every week', labelCn: '每周' },
  { value: 'biweekly', label: 'Every 2 weeks', labelCn: '每两周' },
  { value: 'monthly', label: 'Every month', labelCn: '每月' },
];

const AdminInstanceManager = ({ sessions, profiles }: AdminInstanceManagerProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { toast } = useToast();
  const { createSession } = useAdmin();
  const { sessionTypes, sessionRoles } = useSessionConfig();
  const {
    instances, loading, generateRecurringInstances, updateInstance, deleteInstance, setInstanceStatus, refetch,
  } = useSessionInstances();
  const {
    wishes, createWish, updateWish, deleteWish, reorderWishes, uploadWishFile,
  } = useWishes();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set());
  const [showWishForm, setShowWishForm] = useState<string | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<SessionInstance | null>(null);
  const [showPoster, setShowPoster] = useState<string | null>(null);
  const [editingInstance, setEditingInstance] = useState<SessionInstance | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Simplified create form — creates parent session + generates instances in one step
  const [form, setForm] = useState({
    name: '',
    name_cn: '',
    day_of_week: '2',
    start_time: '19:30',
    end_time: '21:30',
    recurrence_rule: 'weekly',
  });

  const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.display_name]));

  // Set defaults when config loads
  const defaultType = sessionTypes[0]?.value || '';

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    
    const { error } = await createSession({
      name: form.name,
      name_cn: form.name_cn,
      session_type: defaultType,
      day_of_week: parseInt(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      max_participants: 50,
      max_songs: 50,
      allowed_roles: sessionRoles.map(r => r.value),
      recurrence_rule: form.recurrence_rule,
    });

    if (error) {
      toast({ title: en ? 'Failed to create' : '创建失败', description: error.message, variant: 'destructive' });
      setCreating(false);
      return;
    }

    // Wait a moment for the session to be created, then fetch it and generate instances
    // We need to find the newly created session
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: newSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('name', form.name)
      .order('created_at', { ascending: false })
      .limit(1);

    if (newSessions && newSessions.length > 0) {
      const newSession = newSessions[0] as any;
      const { created, error: genError } = await generateRecurringInstances({
        id: newSession.id,
        day_of_week: newSession.day_of_week,
        start_time: newSession.start_time,
        end_time: newSession.end_time,
        recurrence_rule: newSession.recurrence_rule,
      });
      if (genError) {
        toast({ title: en ? 'Session created but failed to generate instances' : '活动已创建但生成实例失败', variant: 'destructive' });
      } else {
        toast({ title: en ? `Session created with ${created} upcoming dates!` : `活动已创建，生成了 ${created} 个日期！` });
      }
    } else {
      toast({ title: en ? 'Session created!' : '活动已创建！' });
    }

    setShowCreateForm(false);
    setForm({ name: '', name_cn: '', day_of_week: '2', start_time: '19:30', end_time: '21:30', recurrence_rule: 'weekly' });
    setCreating(false);
    await refetch();
  };

  const handlePublish = (instance: SessionInstance) => {
    setPublishConfirm(instance);
  };

  const confirmPublish = async () => {
    if (!publishConfirm) return;
    const { error } = await setInstanceStatus(publishConfirm.id, 'published');
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: en ? 'Published!' : '已发布！' });
    setPublishConfirm(null);
  };

  const handleUnpublish = async (instance: SessionInstance) => {
    const { error } = await setInstanceStatus(instance.id, 'draft');
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: en ? 'Unpublished — users can edit wishes again' : '已取消发布 — 用户可以重新编辑心愿' });
  };

  const toggleExpand = (id: string) => {
    setExpandedInstances(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getPublishWarning = (instance: SessionInstance) => {
    const instanceWishes = wishes.filter(w => w.instance_id === instance.id);
    const songCount = instanceWishes.length;
    const schedule = calculateSchedule(instance.start_time, songCount);
    return { songCount, endTime: formatTime12h(schedule.endTime) };
  };

  // Generate more instances for an existing session
  const handleGenerateMore = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const { created, error } = await generateRecurringInstances({
      id: session.id,
      day_of_week: session.day_of_week,
      start_time: session.start_time,
      end_time: session.end_time,
      recurrence_rule: session.recurrence_rule,
    });
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: en ? `Generated ${created} new dates` : `生成了 ${created} 个新日期` });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === instances.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(instances.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    let failed = 0;
    for (const id of selectedIds) {
      const { error } = await deleteInstance(id);
      if (error) failed++;
    }
    if (failed > 0) {
      toast({ title: en ? `${failed} failed to delete` : `${failed} 个删除失败`, variant: 'destructive' });
    } else {
      toast({ title: en ? `Deleted ${selectedIds.size} sessions` : `已删除 ${selectedIds.size} 个活动` });
    }
    setSelectedIds(new Set());
    setDeleteConfirm(false);
  };

  // Group instances by parent session for the "Generate More" dropdown
  const recurringSessionIds = [...new Set(instances.map(i => i.session_id))];
  const recurringSessions = sessions.filter(s => recurringSessionIds.includes(s.id) && s.recurrence_rule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {en ? 'Weekly Sessions' : '每周活动'}
          </h2>
          {instances.length > 0 && (
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {selectedIds.size === instances.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {en ? 'Select All' : '全选'}
            </button>
          )}
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" className="rounded-full gap-1.5" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5" /> {en ? `Delete (${selectedIds.size})` : `删除 (${selectedIds.size})`}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {recurringSessions.length > 0 && (
            <Select onValueChange={handleGenerateMore}>
              <SelectTrigger className="w-auto gap-1.5 rounded-full">
                <RefreshCw className="w-4 h-4" />
                <SelectValue placeholder={en ? 'Generate More Dates' : '生成更多日期'} />
              </SelectTrigger>
              <SelectContent>
                {recurringSessions.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {en ? s.name : (s.name_cn || s.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" /> {en ? 'New Session' : '新建活动'}
          </Button>
        </div>
      </div>

      {/* Simplified Create Form */}
      {showCreateForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">{en ? 'Create Recurring Session' : '创建重复活动'}</CardTitle>
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
                <label className="text-sm text-muted-foreground">{en ? 'Day of Week' : '星期几'}</label>
                <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayNames.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{en ? 'Start Time' : '开始时间'}</label>
                <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> {en ? 'Recurrence' : '重复规则'}
                </label>
                <Select value={form.recurrence_rule} onValueChange={v => setForm(f => ({ ...f, recurrence_rule: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {recurrenceOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{en ? o.label : o.labelCn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {en
                ? 'This will create a recurring session and automatically generate the next 8 upcoming dates.'
                : '这将创建一个重复活动并自动生成接下来的 8 个日期。'}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={!form.name.trim() || creating} className="rounded-full">
                <Save className="w-4 h-4 mr-1.5" /> {creating ? (en ? 'Creating...' : '创建中...') : (en ? 'Create & Generate' : '创建并生成')}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)} className="rounded-full">
                <X className="w-4 h-4 mr-1.5" /> {en ? 'Cancel' : '取消'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instance List — the unified table of dated events */}
      {instances.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-8">
          {en ? 'No sessions yet. Create one above!' : '暂无活动，请在上方创建！'}
        </p>
      )}

      {instances.map(instance => {
        const instanceWishes = wishes.filter(w => w.instance_id === instance.id);
        const isExpanded = expandedInstances.has(instance.id);
        const session = instance.session;
        const sessionName = instance.name_override || (en ? session?.name : (session?.name_cn || session?.name)) || '—';
        const isPublished = instance.status === 'published';

        return (
          <Card key={instance.id} className={`border-border ${selectedIds.has(instance.id) ? 'ring-2 ring-primary/40' : ''}`}>
            <CardHeader className="bg-secondary/30 border-b border-border py-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={selectedIds.has(instance.id)}
                    onCheckedChange={() => toggleSelect(instance.id)}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge
                      variant={isPublished ? 'default' : 'outline'}
                      className={isPublished ? '' : 'bg-primary/20 text-primary border-primary/40'}
                    >
                      {isPublished ? (en ? 'Published' : '已发布') : (en ? 'Editable' : '可编辑')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatSessionDate(instance.instance_date, language)}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime12h(instance.start_time)}
                    </span>
                    {instanceWishes.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        🎵 {instanceWishes.length} {en ? 'songs' : '首歌'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{sessionName}</CardTitle>
                  {instance.theme && (
                    <div className="text-sm text-primary font-medium mt-1">
                      🎨 {en ? instance.theme : (instance.theme_cn || instance.theme)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditingInstance(instance)}>
                    <Edit2 className="w-3.5 h-3.5" /> {en ? 'Edit' : '编辑'}
                  </Button>
                  {isPublished ? (
                    <>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleUnpublish(instance)}>
                        <EyeOff className="w-3.5 h-3.5" /> {en ? 'Unpublish' : '取消发布'}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowPoster(showPoster === instance.id ? null : instance.id)}>
                        <Image className="w-3.5 h-3.5" /> {en ? 'Poster' : '海报'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handlePublish(instance)}>
                        <Send className="w-3.5 h-3.5" /> {en ? 'Publish' : '发布'}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={async () => {
                          const { error } = await deleteInstance(instance.id);
                          if (error) toast({ title: 'Delete failed', variant: 'destructive' });
                          else toast({ title: en ? 'Deleted' : '已删除' });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <button
                onClick={() => toggleExpand(instance.id)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {en ? `Wishes (${instanceWishes.length})` : `心愿 (${instanceWishes.length})`}
              </button>

              {isExpanded && (
                <div className="space-y-3">
                  {instanceWishes.length > 0 ? (
                    <div className="bg-secondary/20 rounded-lg border border-border divide-y divide-border">
                      {instanceWishes.map((wish, i) => (
                        <div key={wish.id} className="flex items-center">
                          <div className="flex flex-col gap-0.5 pl-2">
                            <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === 0}
                              onClick={async () => {
                                const ordered = instanceWishes.map((w, idx) => ({ id: w.id, sort_order: idx }));
                                [ordered[i].sort_order, ordered[i - 1].sort_order] = [ordered[i - 1].sort_order, ordered[i].sort_order];
                                await reorderWishes(ordered);
                              }}>
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === instanceWishes.length - 1}
                              onClick={async () => {
                                const ordered = instanceWishes.map((w, idx) => ({ id: w.id, sort_order: idx }));
                                [ordered[i].sort_order, ordered[i + 1].sort_order] = [ordered[i + 1].sort_order, ordered[i].sort_order];
                                await reorderWishes(ordered);
                              }}>
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <WishCard
                              wish={wish} index={i}
                              timeSlot={isPublished ? calculateSchedule(instance.start_time, instanceWishes.length).times[i] : undefined}
                              isOwner={false} isEditable={true}
                              showUsername={profileMap[wish.user_id] || '—'}
                              onUpdate={updateWish} onDelete={deleteWish} onUploadFile={uploadWishFile}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{en ? 'No wishes yet' : '暂无心愿'}</p>
                  )}

                  {showWishForm === instance.id ? (
                    <WishForm
                      instanceId={instance.id}
                      onSubmit={createWish}
                      onCancel={() => setShowWishForm(null)}
                      onUploadFile={uploadWishFile}
                      profiles={profiles}
                    />
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowWishForm(instance.id)}>
                      <Plus className="w-3.5 h-3.5" /> {en ? 'Add Wish' : '添加心愿'}
                    </Button>
                  )}
                </div>
              )}

              {showPoster === instance.id && isPublished && (
                <InstancePoster instance={instance} wishes={instanceWishes} profileMap={profileMap} />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Publish Confirmation Dialog */}
      <Dialog open={!!publishConfirm} onOpenChange={() => setPublishConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              {en ? 'Confirm Publish' : '确认发布'}
            </DialogTitle>
            <DialogDescription>
              {publishConfirm && (() => {
                const { songCount, endTime } = getPublishWarning(publishConfirm);
                return en
                  ? `This session will run until ${endTime} with ${songCount} songs scheduled. Users will no longer be able to edit their wishes. Proceed?`
                  : `此活动将持续到 ${endTime}，共 ${songCount} 首歌。用户将无法再编辑心愿。确定发布吗？`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishConfirm(null)}>{en ? 'Cancel' : '取消'}</Button>
            <Button onClick={confirmPublish}>{en ? 'Publish' : '发布'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {en ? 'Confirm Bulk Delete' : '确认批量删除'}
            </DialogTitle>
            <DialogDescription>
              {en
                ? `Are you sure you want to delete ${selectedIds.size} session(s)? This cannot be undone.`
                : `确定要删除 ${selectedIds.size} 个活动吗？此操作不可撤销。`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>{en ? 'Cancel' : '取消'}</Button>
            <Button variant="destructive" onClick={handleBulkDelete}>{en ? 'Delete' : '删除'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingInstance && (
        <InstanceEditDialog instance={editingInstance} onClose={() => setEditingInstance(null)} />
      )}
    </div>
  );
};

export default AdminInstanceManager;
