import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatTime12h, formatSessionDate, calculateSchedule } from '@/lib/timeUtils';
import type { SessionInstance } from '@/hooks/useSessionInstances';
import type { Wish } from '@/hooks/useWishes';

interface InstancePosterProps {
  instance: SessionInstance;
  wishes: Wish[];
  profileMap: Record<string, string>;
}

const ROLE_ICONS: Record<string, string> = {
  vocal: '🎤',
  guitar: '🎸',
  keyboard: '🎹',
  drum: '🥁',
};

const InstancePoster = ({ instance, wishes, profileMap }: InstancePosterProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const posterRef = useRef<HTMLDivElement>(null);

  const session = instance.session;
  const sessionName = instance.name_override || (en ? session?.name : (session?.name_cn || session?.name)) || '';
  const schedule = calculateSchedule(instance.start_time, wishes.length);

  const handleDownload = async () => {
    const el = posterRef.current;
    if (!el) return;

    // Use html2canvas-style approach via canvas
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-${instance.instance_date}.png`;
      link.click();
    } catch {
      // Fallback: copy as text
      alert('Download not available. Please screenshot the poster.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Poster Preview */}
      <div
        ref={posterRef}
        className="rounded-xl overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary)), hsl(var(--primary) / 0.1))',
          padding: '2rem',
          minWidth: '360px',
          maxWidth: '600px',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold font-display text-foreground mb-1">
            🎵 {sessionName}
          </div>
          {instance.theme && (
            <div className="text-lg text-primary font-medium">
              🎨 {en ? instance.theme : (instance.theme_cn || instance.theme)}
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>📅 {formatSessionDate(instance.instance_date, language)}</span>
            <span>⏰ {formatTime12h(instance.start_time)} – {formatTime12h(instance.end_time)}</span>
          </div>
          {instance.announcement && (
            <div className="mt-2 text-sm text-foreground/80 italic">
              📢 {en ? instance.announcement : (instance.announcement_cn || instance.announcement)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Song List */}
        {wishes.length > 0 ? (
          <div className="space-y-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {en ? `Schedule (${wishes.length} songs)` : `节目单（${wishes.length} 首）`}
            </div>
            {wishes.map((wish, i) => (
              <div
                key={wish.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{
                  background: i % 2 === 0 ? 'hsl(var(--card) / 0.5)' : 'transparent',
                }}
              >
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{ROLE_ICONS[wish.primary_role] || '🎵'}</span>
                    <span className="font-medium text-sm text-foreground truncate">
                      {wish.artist && `${wish.artist} - `}《{wish.song_title}》
                    </span>
                    {wish.is_self_accompanied && (
                      <span className="text-xs text-muted-foreground">
                        ({en ? 'self-accompanied' : '弹唱'})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    👤 {profileMap[wish.user_id] || '—'}
                    {wish.song_version && ` · ${wish.song_version}`}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {schedule.times[i]?.split(' – ')[0] || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            {en ? 'No songs scheduled' : '暂无节目'}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {en
            ? 'Schedule is tentative and subject to change based on actual progress.'
            : '时间安排仅供参考，可能根据实际进度有所调整。'}
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        variant="outline"
        className="rounded-full gap-2"
      >
        <Download className="w-4 h-4" />
        {en ? 'Download Poster (PNG)' : '下载海报 (PNG)'}
      </Button>
    </div>
  );
};

export default InstancePoster;
