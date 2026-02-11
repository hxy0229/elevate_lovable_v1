import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SessionRole } from '@/hooks/useSessionConfig';

interface Props {
  sessionType: string;
  availableRoles?: SessionRole[];
  onSubmit: (name: string, roles: string[]) => Promise<void>;
  onCancel: () => void;
}

const RegistrationForm = ({ sessionType, availableRoles, onSubmit, onCancel }: Props) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const roles = availableRoles || [];

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleValue) ? prev.filter((r) => r !== roleValue) : [...prev, roleValue]
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
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => toggleRole(role.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                selectedRoles.includes(role.value)
                  ? 'bg-primary/10 border-primary text-foreground'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span>{role.icon}</span>
              {language === 'zh' ? role.label_cn : role.label_en}
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
