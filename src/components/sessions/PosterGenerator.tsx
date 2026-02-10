import { useState, useRef } from 'react';
import { Image, Download, Loader2 } from 'lucide-react';
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
  const [svgData, setSvgData] = useState('');
  const [generating, setGenerating] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const formatTime = (t: string) => t.substring(0, 5);

  const dateLabel = session.session_date
    ? new Date(session.session_date + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    : '';

  const handleGenerate = async () => {
    setGenerating(true);
    setSvgData('');
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
      setSvgData(data.svg);
    } catch (err: any) {
      toast({ title: language === 'zh' ? '生成失败' : 'Generation failed', description: err.message, variant: 'destructive' });
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!svgData) return;
    // Parse SVG to get dimensions
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    const w = parseInt(svgEl?.getAttribute('width') || '800');
    const h = parseInt(svgEl?.getAttribute('height') || '600');

    const canvas = document.createElement('canvas');
    const scale = 2; // hi-dpi
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    const img = new window.Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = jpegUrl;
      link.download = `poster-${session.name}-${session.session_date || 'session'}.jpg`;
      link.click();
    };
    img.src = url;
  };

  const svgDataUrl = svgData
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
    : '';

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

      {svgData && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <img
              ref={imgRef}
              src={svgDataUrl}
              alt="Session poster"
              className="w-full h-auto"
            />
          </div>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Download className="w-4 h-4" />
            {language === 'zh' ? '下载海报 (JPEG)' : 'Download Poster (JPEG)'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PosterGenerator;
