import { useState } from 'react';
import { Tag, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  currentTheme: string | null;
  currentThemeCn: string | null;
  onSave: (theme: string, themeCn: string) => Promise<boolean>;
}

const ThemeEditor = ({ currentTheme, currentThemeCn, onSave }: Props) => {
  const { language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState(currentTheme || '');
  const [themeCn, setThemeCn] = useState(currentThemeCn || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(theme.trim(), themeCn.trim());
    if (ok) setEditing(false);
    setSaving(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Pencil className="w-3 h-3" />
        {currentTheme
          ? (language === 'zh' ? '编辑主题' : 'Edit Theme')
          : (language === 'zh' ? '设置主题' : 'Set Theme')}
      </button>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3 mt-2">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {language === 'zh' ? '设置主题' : 'Set Theme'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">English</label>
          <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Beyond Night" className="bg-background border-border text-sm" maxLength={100} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">中文</label>
          <Input value={themeCn} onChange={(e) => setThemeCn(e.target.value)} placeholder="例：Beyond之夜" className="bg-background border-border text-sm" maxLength={100} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || (!theme.trim() && !themeCn.trim())} className="rounded-full text-xs">
          {saving ? '...' : (language === 'zh' ? '保存' : 'Save')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="rounded-full text-xs">
          {language === 'zh' ? '取消' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

export default ThemeEditor;
