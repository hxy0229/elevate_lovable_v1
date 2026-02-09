import { useState } from 'react';
import { Image, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SessionRow, RegistrationRow, SongRow } from '@/hooks/useSessionData';

interface Props {
  session: SessionRow;
  registrations: RegistrationRow[];
  songs: SongRow[];
}

const PosterGenerator = ({ session, registrations, songs }: Props) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [poster, setPoster] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTime = (t: string) => t.substring(0, 5);

  const dateLabel = session.session_date
    ? new Date(session.session_date + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    : '';

  const handleGenerate = async () => {
    setGenerating(true);
    setPoster('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: {
          sessionName: `${session.name} / ${session.name_cn || session.name}`,
          theme: session.theme || session.theme_cn || '',
          date: dateLabel,
          time: `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`,
          participants: registrations.map((r) => ({ name: r.display_name, roles: r.roles })),
          songList: songs.map((s) => ({ singer: s.singer_name, key: s.song_key, title: s.song_title, artist: s.artist })),
        },
      });
      if (error) throw error;
      setPoster(data.poster);
    } catch (err: any) {
      toast({ title: language === 'zh' ? '生成失败' : 'Generation failed', description: err.message, variant: 'destructive' });
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(poster);
    setCopied(true);
    toast({ title: language === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        disabled={generating}
        variant="outline"
        className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        {generating
          ? (language === 'zh' ? '生成中...' : 'Generating...')
          : (language === 'zh' ? '生成活动海报' : 'Generate Poster')}
      </Button>

      {poster && (
        <div className="relative">
          <pre className="p-4 rounded-xl bg-secondary/50 border border-border text-sm whitespace-pre-wrap font-mono text-foreground max-h-[500px] overflow-y-auto">
            {poster}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 border border-border hover:border-primary/50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default PosterGenerator;
