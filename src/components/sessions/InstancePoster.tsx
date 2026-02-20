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
  bass: '🎸',
};

const InstancePoster = ({ instance, wishes, profileMap }: InstancePosterProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const posterRef = useRef<HTMLDivElement>(null);

  const session = instance.session;
  const sessionName = instance.name_override || (en ? session?.name : (session?.name_cn || session?.name)) || '';
  const schedule = calculateSchedule(instance.start_time, wishes.length);

  // Recursively resolve all CSS-variable-based colors to computed values on a cloned tree
  const resolveComputedStyles = (original: Element, clone: Element) => {
    const origStyle = window.getComputedStyle(original);
    const cloneEl = clone as HTMLElement;

    // Inline key visual properties so html2canvas doesn't need to resolve CSS vars
    const props = [
      'color', 'backgroundColor', 'borderColor', 'outlineColor',
      'backgroundImage', 'boxShadow', 'textShadow',
      'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
    ];
    for (const prop of props) {
      const val = origStyle.getPropertyValue(prop);
      if (val && val !== 'none' && val !== 'rgba(0, 0, 0, 0)') {
        cloneEl.style.setProperty(prop, val);
      }
    }

    // Also inline font properties for consistency
    cloneEl.style.fontFamily = origStyle.fontFamily;
    cloneEl.style.fontSize = origStyle.fontSize;
    cloneEl.style.fontWeight = origStyle.fontWeight;
    cloneEl.style.lineHeight = origStyle.lineHeight;
    cloneEl.style.letterSpacing = origStyle.letterSpacing;

    const origChildren = original.children;
    const cloneChildren = clone.children;
    for (let i = 0; i < origChildren.length; i++) {
      if (cloneChildren[i]) {
        resolveComputedStyles(origChildren[i], cloneChildren[i]);
      }
    }
  };

  const handleDownload = async () => {
    const el = posterRef.current;
    if (!el) return;

    try {
      const { default: html2canvas } = await import('html2canvas');

      const rect = el.getBoundingClientRect();

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        width: rect.width,
        height: rect.height,
        windowWidth: rect.width,
        windowHeight: rect.height,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (_doc: Document, clonedEl: HTMLElement) => {
          resolveComputedStyles(el, clonedEl);
        },
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-${instance.instance_date}.png`;
      link.click();
    } catch {
      alert('Download not available. Please screenshot the poster.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Poster Preview — inline styles to ensure html2canvas consistency */}
      <div
        ref={posterRef}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary)), hsl(var(--primary) / 0.1))',
          padding: '32px',
          width: '600px',
          borderRadius: '12px',
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="font-display text-foreground" style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px', wordBreak: 'break-word' }}>
            🎵 {sessionName}
          </div>
          {instance.theme && (
            <div className="text-primary" style={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
              🎨 {en ? instance.theme : (instance.theme_cn || instance.theme)}
            </div>
          )}
          <div className="text-muted-foreground" style={{ marginTop: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>📅 {formatSessionDate(instance.instance_date, language)}</span>
            <span>⏰ {formatTime12h(instance.start_time)} – {formatTime12h(instance.end_time)}</span>
          </div>
          {instance.announcement && (
            <div className="text-foreground/80" style={{ marginTop: '8px', fontSize: '13px', fontStyle: 'italic', wordBreak: 'break-word', lineHeight: 1.5 }}>
              📢 {en ? instance.announcement : (instance.announcement_cn || instance.announcement)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="bg-border" style={{ height: '1px', marginBottom: '16px' }} />

        {/* Song List */}
        {wishes.length > 0 ? (
          <div>
            <div className="text-muted-foreground" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {en ? `Schedule (${wishes.length} songs)` : `节目单（${wishes.length} 首）`}
            </div>
            {wishes.map((wish, i) => (
              <div
                key={wish.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: i % 2 === 0 ? 'hsl(var(--card) / 0.5)' : 'transparent',
                }}
              >
                <span
                  className="bg-primary/20 text-primary"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', lineHeight: 1.5 }}>
                    <span style={{ fontSize: '13px' }}>{ROLE_ICONS[wish.primary_role] || '🎵'}</span>
                    <span className="text-foreground" style={{ fontWeight: 500, fontSize: '13px', wordBreak: 'break-word' }}>
                      {wish.artist && `${wish.artist} - `}《{wish.song_title}》
                    </span>
                    {wish.is_self_accompanied && (
                      <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
                        ({en ? 'self-accompanied' : '弹唱'})
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: '11px', lineHeight: 1.4, marginTop: '2px' }}>
                    👤 {profileMap[wish.user_id] || '—'}
                    {wish.song_version && ` · ${wish.song_version}`}
                  </div>
                </div>
                <div className="text-muted-foreground" style={{ fontSize: '11px', flexShrink: 0, marginTop: '3px', whiteSpace: 'nowrap' }}>
                  {schedule.times[i]?.split(' – ')[0] || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground" style={{ textAlign: 'center', padding: '16px 0' }}>
            {en ? 'No songs scheduled' : '暂无节目'}
          </p>
        )}

        {/* Footer */}
        <div className="text-muted-foreground" style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', lineHeight: 1.5 }}>
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
