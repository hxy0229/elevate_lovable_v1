import { useState } from 'react';
import { Mic2, Guitar, Drum, Music, Piano } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  sessionType: string;
  onSubmit: (name: string, roles: string[]) => Promise<void>;
  onCancel: () => void;
}

const allRoles = [
  { id: 'vocal', icon: <Mic2 className="w-4 h-4" />, en: 'Vocal', zh: '主唱' },
  { id: 'guitar', icon: <Guitar className="w-4 h-4" />, en: 'Guitar', zh: '吉他' },
  { id: 'drums', icon: <Drum className="w-4 h-4" />, en: 'Drums', zh: '鼓' },
  { id: 'bass', icon: <Music className="w-4 h-4" />, en: 'Bass', zh: '贝斯' },
  { id: 'keyboard', icon: <Piano className="w-4 h-4" />, en: 'Keyboard', zh: '键盘' },
];

const RegistrationForm = ({ sessionType, onSubmit, onCancel }: Props) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const availableRoles = sessionType === 'solo-vocal'
    ? allRoles.filter((r) => r.id === 'vocal')
    : allRoles;

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedRoles.length === 0) return;
    setSubmitting(true);
    await onSubmit(name.trim(), selectedRoles);
    setSubmitting(false);
  };

  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
      <h4 className="text-sm font-semibold text-foreground">
        {language === 'zh' ? '报名信息' : 'Registration'}
      </h4>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          {language === 'zh' ? '显示名称' : 'Display Name'}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === 'zh' ? '你的名字' : 'Your name'}
          className="bg-background border-border"
          maxLength={50}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          {language === 'zh' ? '选择角色（可多选）' : 'Choose role(s)'}
        </label>
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                selectedRoles.includes(role.id)
                  ? 'bg-primary/10 border-primary text-foreground'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {role.icon}
              {language === 'zh' ? role.zh : role.en}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || selectedRoles.length === 0 || submitting}
          className="rounded-full gold-glow"
        >
          {submitting
            ? (language === 'zh' ? '提交中...' : 'Submitting...')
            : (language === 'zh' ? '确认报名' : 'Confirm')}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="rounded-full">
          {language === 'zh' ? '取消' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationForm;
