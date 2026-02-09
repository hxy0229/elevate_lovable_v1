import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onSubmit: (singerName: string, songTitle: string, artist: string, songKey: string) => Promise<void>;
  onCancel: () => void;
}

const keys = ['C调', 'C#调', 'D调', 'D#调', 'E调', 'F调', 'F#调', 'G调', 'G#调', 'A调', 'A#调', 'B调'];

const SongRequestForm = ({ onSubmit, onCancel }: Props) => {
  const { language } = useLanguage();
  const [singerName, setSingerName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songKey, setSongKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!singerName.trim() || !songTitle.trim() || !artist.trim() || !songKey) return;
    setSubmitting(true);
    await onSubmit(singerName.trim(), songTitle.trim(), artist.trim(), songKey);
    setSubmitting(false);
  };

  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
      <h4 className="text-sm font-semibold text-foreground">
        {language === 'zh' ? '点歌' : 'Request a Song'}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{language === 'zh' ? '演唱者' : 'Singer'}</label>
          <Input value={singerName} onChange={(e) => setSingerName(e.target.value)} placeholder={language === 'zh' ? '谁唱' : 'Who sings'} className="bg-background border-border" maxLength={50} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{language === 'zh' ? '调' : 'Key'}</label>
          <Select value={songKey} onValueChange={setSongKey}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={language === 'zh' ? '选择调' : 'Select key'} />
            </SelectTrigger>
            <SelectContent>
              {keys.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{language === 'zh' ? '歌曲名' : 'Song Title'}</label>
          <Input value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder={language === 'zh' ? '歌曲名称' : 'Song title'} className="bg-background border-border" maxLength={100} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{language === 'zh' ? '原唱/艺人' : 'Artist'}</label>
          <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder={language === 'zh' ? '原唱艺人' : 'Original artist'} className="bg-background border-border" maxLength={100} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={!singerName.trim() || !songTitle.trim() || !artist.trim() || !songKey || submitting} className="rounded-full gold-glow">
          {submitting ? (language === 'zh' ? '提交中...' : 'Adding...') : (language === 'zh' ? '添加歌曲' : 'Add Song')}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="rounded-full">
          {language === 'zh' ? '取消' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

export default SongRequestForm;
