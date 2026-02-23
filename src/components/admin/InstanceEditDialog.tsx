import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SessionInstance } from '@/hooks/useSessionInstances';
import { useToast } from '@/hooks/use-toast';

interface InstanceEditDialogProps {
  instance: SessionInstance | null;
  instances: SessionInstance[];
  updateInstance: (id: string, updates: Record<string, any>) => Promise<{ error: any }>;
  onClose: () => void;
}

type EditScope = 'this' | 'following' | 'all';

const InstanceEditDialog = ({ instance, instances, updateInstance, onClose }: InstanceEditDialogProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { toast } = useToast();

  const [editScope, setEditScope] = useState<EditScope>('this');
  const [form, setForm] = useState(() => ({
    start_time: instance?.start_time?.substring(0, 5) || '',
    end_time: instance?.end_time?.substring(0, 5) || '',
    name_override: instance?.name_override || '',
    name_cn_override: instance?.name_cn_override || '',
    theme: instance?.theme || '',
    theme_cn: instance?.theme_cn || '',
    announcement: instance?.announcement || '',
    announcement_cn: instance?.announcement_cn || '',
  }));
  const [saving, setSaving] = useState(false);

  if (!instance) return null;

  const handleSave = async () => {
    setSaving(true);
    const updates: Record<string, any> = {
      start_time: form.start_time,
      end_time: form.end_time,
      name_override: form.name_override || null,
      name_cn_override: form.name_cn_override || null,
      theme: form.theme || null,
      theme_cn: form.theme_cn || null,
      announcement: form.announcement || null,
      announcement_cn: form.announcement_cn || null,
    };

    if (editScope === 'this') {
      const { error } = await updateInstance(instance.id, updates);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: en ? 'Instance updated!' : '实例已更新！' });
        onClose();
      }
    } else {
      const siblings = instances.filter(i => i.session_id === instance.session_id);
      let targets: SessionInstance[];

      if (editScope === 'following') {
        targets = siblings.filter(i => i.instance_date >= instance.instance_date);
      } else {
        targets = siblings;
      }

      let failed = 0;
      for (const target of targets) {
        const { error } = await updateInstance(target.id, updates);
        if (error) failed++;
      }

      if (failed > 0) {
        toast({ title: `${failed} update(s) failed`, variant: 'destructive' });
      } else {
        toast({ title: en ? `Updated ${targets.length} instance(s)!` : `已更新 ${targets.length} 个实例！` });
        onClose();
      }
    }
    setSaving(false);
  };

  const siblingCount = instances.filter(i => i.session_id === instance.session_id).length;
  const isSeries = siblingCount > 1;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{en ? 'Edit Instance' : '编辑实例'}</DialogTitle>
          <DialogDescription>
            {en ? `Editing instance on ${instance.instance_date}` : `编辑 ${instance.instance_date} 的实例`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{en ? 'Start Time' : '开始时间'}</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{en ? 'End Time' : '结束时间'}</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>

          {/* Name Override */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{en ? 'Name Override (EN)' : '名称覆盖（英文）'}</Label>
              <Input value={form.name_override} onChange={e => setForm(f => ({ ...f, name_override: e.target.value }))} placeholder={en ? 'Optional' : '可选'} />
            </div>
            <div className="space-y-1.5">
              <Label>{en ? 'Name Override (CN)' : '名称覆盖（中文）'}</Label>
              <Input value={form.name_cn_override} onChange={e => setForm(f => ({ ...f, name_cn_override: e.target.value }))} placeholder={en ? 'Optional' : '可选'} />
            </div>
          </div>

          {/* Theme */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{en ? 'Theme (EN)' : '主题（英文）'}</Label>
              <Input value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} placeholder={en ? 'Optional' : '可选'} />
            </div>
            <div className="space-y-1.5">
              <Label>{en ? 'Theme (CN)' : '主题（中文）'}</Label>
              <Input value={form.theme_cn} onChange={e => setForm(f => ({ ...f, theme_cn: e.target.value }))} placeholder={en ? 'Optional' : '可选'} />
            </div>
          </div>

          {/* Announcement */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{en ? 'Announcement (EN)' : '公告（英文）'}</Label>
              <Textarea value={form.announcement} onChange={e => setForm(f => ({ ...f, announcement: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>{en ? 'Announcement (CN)' : '公告（中文）'}</Label>
              <Textarea value={form.announcement_cn} onChange={e => setForm(f => ({ ...f, announcement_cn: e.target.value }))} rows={2} />
            </div>
          </div>

          {/* Edit Scope */}
          {isSeries && (
            <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
              <Label className="font-semibold">{en ? 'Apply changes to:' : '应用更改到：'}</Label>
              <RadioGroup value={editScope} onValueChange={v => setEditScope(v as EditScope)}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="this" id="scope-this" />
                  <Label htmlFor="scope-this" className="cursor-pointer font-normal">
                    {en ? 'This event only' : '仅此活动'}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="following" id="scope-following" />
                  <Label htmlFor="scope-following" className="cursor-pointer font-normal">
                    {en ? 'This and following events' : '此活动及之后的活动'}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="scope-all" />
                  <Label htmlFor="scope-all" className="cursor-pointer font-normal">
                    {en ? 'All events in series' : '系列中的所有活动'}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{en ? 'Cancel' : '取消'}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (en ? 'Saving...' : '保存中...') : (en ? 'Save' : '保存')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstanceEditDialog;
