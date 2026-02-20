import { useRef, useMemo } from 'react';
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

/**
 * Resolve a CSS variable to a concrete rgb/hex color.
 * e.g. getCSSColor('--primary') => 'rgb(120, 80, 200)'
 */
function getCSSColor(varName: string, alpha?: number): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return alpha !== undefined ? `rgba(0,0,0,${alpha})` : '#000';
  // raw is typically HSL values like "220 14% 10%" (without hsl() wrapper)
  if (alpha !== undefined) {
    return `hsla(${raw.replace(/ /g, ', ')}, ${alpha})`;
  }
  return `hsl(${raw.replace(/ /g, ', ')})`;
}

const InstancePoster = ({ instance, wishes, profileMap }: InstancePosterProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const posterRef = useRef<HTMLDivElement>(null);

  const session = instance.session;
  const sessionName = instance.name_override || (en ? session?.name : (session?.name_cn || session?.name)) || '';
  const schedule = calculateSchedule(instance.start_time, wishes.length);

  // Pre-compute all colors from CSS variables into concrete values
  // so html2canvas never encounters var() references
  const colors = useMemo(() => ({
    foreground: getCSSColor('--foreground'),
    foreground80: getCSSColor('--foreground', 0.8),
    primary: getCSSColor('--primary'),
    primary15: getCSSColor('--primary', 0.15),
    primary10: getCSSColor('--primary', 0.1),
    primary20: getCSSColor('--primary', 0.2),
    secondary: getCSSColor('--secondary'),
    muted: getCSSColor('--muted-foreground'),
    card50: getCSSColor('--card', 0.5),
    border: getCSSColor('--border'),
  }), []);

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
      {/* Poster — NO Tailwind color classes, NO CSS variables. All colors hardcoded from computed values. */}
      <div
        ref={posterRef}
        style={{
          background: `linear-gradient(135deg, ${colors.primary15}, ${colors.secondary}, ${colors.primary10})`,
          padding: '32px',
          width: '600px',
          borderRadius: '12px',
          overflow: 'visible',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px', wordBreak: 'break-word', color: colors.foreground }}>
            🎵 {sessionName}
          </div>
          {instance.theme && (
            <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word', color: colors.primary }}>
              🎨 {en ? instance.theme : (instance.theme_cn || instance.theme)}
            </div>
          )}
          <div style={{ marginTop: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', color: colors.muted }}>
            <span>📅 {formatSessionDate(instance.instance_date, language)}</span>
            <span>⏰ {formatTime12h(instance.start_time)} – {formatTime12h(instance.end_time)}</span>
          </div>
          {instance.announcement && (
            <div style={{ marginTop: '8px', fontSize: '13px', fontStyle: 'italic', wordBreak: 'break-word', lineHeight: 1.5, color: colors.foreground80 }}>
              📢 {en ? instance.announcement : (instance.announcement_cn || instance.announcement)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', marginBottom: '16px', backgroundColor: colors.border }} />

        {/* Song List */}
        {wishes.length > 0 ? (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px', color: colors.muted }}>
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
                  background: i % 2 === 0 ? colors.card50 : 'transparent',
                }}
              >
                <span
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
                    backgroundColor: colors.primary20,
                    color: colors.primary,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', lineHeight: 1.5 }}>
                    <span style={{ fontSize: '13px' }}>{ROLE_ICONS[wish.primary_role] || '🎵'}</span>
                    <span style={{ fontWeight: 500, fontSize: '13px', wordBreak: 'break-word', color: colors.foreground }}>
                      {wish.artist && `${wish.artist} - `}《{wish.song_title}》
                    </span>
                    {wish.is_self_accompanied && (
                      <span style={{ fontSize: '11px', color: colors.muted }}>
                        ({en ? 'self-accompanied' : '弹唱'})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', lineHeight: 1.4, marginTop: '2px', color: colors.muted }}>
                    👤 {profileMap[wish.user_id] || '—'}
                    {wish.song_version && ` · ${wish.song_version}`}
                  </div>
                </div>
                <div style={{ fontSize: '11px', flexShrink: 0, marginTop: '3px', whiteSpace: 'nowrap', color: colors.muted }}>
                  {schedule.times[i]?.split(' – ')[0] || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '16px 0', color: colors.muted }}>
            {en ? 'No songs scheduled' : '暂无节目'}
          </p>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', lineHeight: 1.5, color: colors.muted }}>
          {en
            ? 'Schedule is tentative and subject to change based on actual progress.'
            : '时间安排仅供参考，可能根据实际进度有所调整。'}
        </div>
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} variant="outline" className="rounded-full gap-2">
        <Download className="w-4 h-4" />
        {en ? 'Download Poster (PNG)' : '下载海报 (PNG)'}
      </Button>
    </div>
  );
};

export default InstancePoster;
