import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Trash2, Eye, EyeOff, Send, ChevronDown, ChevronUp,
  Clock, Calendar, AlertTriangle, RefreshCw, Image, Edit2, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSessionInstances, type SessionInstance } from '@/hooks/useSessionInstances';
import { useWishes, type Wish, type WishInput, type WishRole } from '@/hooks/useWishes';
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

const STATUS_ACTIONS = {
  draft: { next: 'open', labelEn: 'Open for Wishes', labelCn: '开放点歌', icon: Eye },
  open: { next: 'published', labelEn: 'Publish', labelCn: '发布', icon: Send },
  published: { next: 'open', labelEn: 'Unpublish', labelCn: '取消发布', icon: EyeOff },
};

const AdminInstanceManager = ({ sessions, profiles }: AdminInstanceManagerProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { toast } = useToast();
  const {
    instances, loading, createInstance, generateRecurringInstances, updateInstance, deleteInstance, setInstanceStatus,
  } = useSessionInstances();
  const {
    wishes, createWish, updateWish, deleteWish, reorderWishes, uploadWishFile,
  } = useWishes();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set());
  const [showWishForm, setShowWishForm] = useState<string | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<SessionInstance | null>(null);
  const [showPoster, setShowPoster] = useState<string | null>(null);
  const [generatingRecurring, setGeneratingRecurring] = useState(false);
  const [editingInstance, setEditingInstance] = useState<SessionInstance | null>(null);

  const [form, setForm] = useState({
    session_id: '',
    instance_date: '',
    start_time: '19:30',
    end_time: '21:30',
  });

  const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.display_name]));

  const handleCreate = async () => {
    if (!form.session_id || !form.instance_date) return;
    const { error } = await createInstance({
      session_id: form.session_id,
      instance_date: form.instance_date,
      start_time: form.start_time,
      end_time: form.end_time,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: en ? 'Instance created!' : '实例已创建！' });
      setShowCreateForm(false);
      setForm({ session_id: '', instance_date: '', start_time: '19:30', end_time: '21:30' });
    }
  };

  const handleStatusChange = async (instance: SessionInstance) => {
    const action = STATUS_ACTIONS[instance.status];
    const nextStatus = action.next as 'draft' | 'open' | 'published';

    // If publishing, check for confirmation
    if (nextStatus === 'published') {
      setPublishConfirm(instance);
      return;
    }

    const { error } = await setInstanceStatus(instance.id, nextStatus);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: en ? 'Status updated!' : '状态已更新！' });
  };

  const confirmPublish = async () => {
    if (!publishConfirm) return;
    const { error } = await setInstanceStatus(publishConfirm.id, 'published');
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: en ? 'Published!' : '已发布！' });
    setPublishConfirm(null);
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
    const endTimeFormatted = formatTime12h(schedule.endTime);
    return { songCount, endTime: endTimeFormatted, rawEndTime: schedule.endTime };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {en ? 'Session Instances' : '活动实例'}
        </h2>
        <div className="flex gap-2">
          <Select onValueChange={async (sessionId) => {
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return;
            setGeneratingRecurring(true);
            const { created, error } = await generateRecurringInstances({
              id: session.id,
              day_of_week: session.day_of_week,
              start_time: session.start_time,
              end_time: session.end_time,
              recurrence_rule: session.recurrence_rule,
            });
            setGeneratingRecurring(false);
            if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
            else toast({ title: en ? `Generated ${created} instances` : `已生成 ${created} 个实例` });
          }}>
            <SelectTrigger className="w-auto gap-1.5 rounded-full" disabled={generatingRecurring}>
              <RefreshCw className={`w-4 h-4 ${generatingRecurring ? 'animate-spin' : ''}`} />
              <SelectValue placeholder={en ? 'Auto-Generate' : '批量生成'} />
            </SelectTrigger>
            <SelectContent>
              {sessions.filter(s => !s.is_archived && s.recurrence_rule).map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {en ? s.name : (s.name_cn || s.name)} ({s.recurrence_rule})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" /> {en ? 'New Instance' : '新建实例'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">{en ? 'Create Session Instance' : '创建活动实例'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{en ? 'Parent Session' : '父活动'} *</label>
                <Select value={form.session_id} onValueChange={v => setForm(f => ({ ...f, session_id: v }))}>
                  <SelectTrigger><SelectValue placeholder={en ? 'Select session' : '选择活动'} /></SelectTrigger>
                  <SelectContent>
                    {sessions.filter(s => !s.is_archived).map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {en ? s.name : (s.name_cn || s.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{en ? 'Date' : '日期'} *</label>
                <Input type="date" value={form.instance_date} onChange={e => setForm(f => ({ ...f, instance_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{en ? 'Start Time' : '开始时间'}</label>
                <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">{en ? 'End Time' : '结束时间'}</label>
                <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={!form.session_id || !form.instance_date} className="rounded-full">
                {en ? 'Create' : '创建'}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)} className="rounded-full">
                {en ? 'Cancel' : '取消'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instance List */}
      {instances.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-8">{en ? 'No instances yet' : '暂无实例'}</p>
      )}

      {instances.map(instance => {
        const instanceWishes = wishes.filter(w => w.instance_id === instance.id);
        const isExpanded = expandedInstances.has(instance.id);
        const session = instance.session;
        const sessionName = instance.name_override || (en ? session?.name : (session?.name_cn || session?.name)) || '—';
        const statusAction = STATUS_ACTIONS[instance.status];
        const StatusIcon = statusAction.icon;

        return (
          <Card key={instance.id} className="border-border">
            <CardHeader className="bg-secondary/30 border-b border-border py-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={
                      instance.status === 'published' ? 'default' :
                      instance.status === 'open' ? 'outline' : 'secondary'
                    } className={instance.status === 'open' ? 'bg-primary/20 text-primary border-primary/40' : ''}>
                      {instance.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatSessionDate(instance.instance_date, language)}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime12h(instance.start_time)} – {formatTime12h(instance.end_time)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{sessionName}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setEditingInstance(instance)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {en ? 'Edit' : '编辑'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleStatusChange(instance)}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {en ? statusAction.labelEn : statusAction.labelCn}
                  </Button>
                  {instance.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setShowPoster(showPoster === instance.id ? null : instance.id)}
                    >
                      <Image className="w-3.5 h-3.5" />
                      {en ? 'Poster' : '海报'}
                    </Button>
                  )}
                  {instance.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={async () => {
                        const { error } = await deleteInstance(instance.id);
                        if (error) toast({ title: 'Delete failed', variant: 'destructive' });
                        else toast({ title: en ? 'Deleted' : '已删除' });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                          {/* Reorder arrows */}
                          <div className="flex flex-col gap-0.5 pl-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={i === 0}
                              onClick={async () => {
                                const ordered = instanceWishes.map((w, idx) => ({
                                  id: w.id,
                                  sort_order: idx,
                                }));
                                // swap i and i-1
                                [ordered[i].sort_order, ordered[i - 1].sort_order] = [ordered[i - 1].sort_order, ordered[i].sort_order];
                                await reorderWishes(ordered);
                              }}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={i === instanceWishes.length - 1}
                              onClick={async () => {
                                const ordered = instanceWishes.map((w, idx) => ({
                                  id: w.id,
                                  sort_order: idx,
                                }));
                                [ordered[i].sort_order, ordered[i + 1].sort_order] = [ordered[i + 1].sort_order, ordered[i].sort_order];
                                await reorderWishes(ordered);
                              }}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <WishCard
                              wish={wish}
                              index={i}
                              timeSlot={instance.status === 'published' ? calculateSchedule(instance.start_time, instanceWishes.length).times[i] : undefined}
                              isOwner={false}
                              isEditable={true}
                              showUsername={profileMap[wish.user_id] || '—'}
                              onUpdate={updateWish}
                              onDelete={deleteWish}
                              onUploadFile={uploadWishFile}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      {en ? 'No wishes yet' : '暂无心愿'}
                    </p>
                  )}

                  {/* Admin add wish */}
                  {showWishForm === instance.id ? (
                    <WishForm
                      instanceId={instance.id}
                      onSubmit={createWish}
                      onCancel={() => setShowWishForm(null)}
                      onUploadFile={uploadWishFile}
                      profiles={profiles}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowWishForm(instance.id)}
                    >
                      <Plus className="w-3.5 h-3.5" /> {en ? 'Add Wish' : '添加心愿'}
                    </Button>
                  )}
                </div>
              )}

              {/* Poster */}
              {showPoster === instance.id && instance.status === 'published' && (
                <InstancePoster
                  instance={instance}
                  wishes={instanceWishes}
                  profileMap={profileMap}
                />
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
                  ? `This session will run until ${endTime} with ${songCount} songs scheduled. Are you sure you want to proceed?`
                  : `此活动将持续到 ${endTime}，共安排 ${songCount} 首歌曲。确定要发布吗？`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishConfirm(null)}>
              {en ? 'Cancel' : '取消'}
            </Button>
            <Button onClick={confirmPublish}>
              {en ? 'Publish' : '发布'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instance Edit Dialog */}
      {editingInstance && (
        <InstanceEditDialog
          instance={editingInstance}
          onClose={() => setEditingInstance(null)}
        />
      )}
    </div>
  );
};

export default AdminInstanceManager;
