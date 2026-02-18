import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Link as LinkIcon, FileText, AlertCircle, Clock, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Wish, WishInput } from '@/hooks/useWishes';
import WishForm from './WishForm';

interface WishCardProps {
  wish: Wish;
  index: number;
  timeSlot?: string;
  isOwner: boolean;
  isEditable: boolean;
  showUsername?: string; // display name for admin view
  onUpdate?: (id: string, version: number, updates: Partial<WishInput>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onUploadFile?: (instanceId: string, file: File) => Promise<string | null>;
}

const ROLE_DISPLAY: Record<string, { icon: string; labelEn: string; labelCn: string }> = {
  vocal: { icon: '🎤', labelEn: 'Vocal', labelCn: '主唱' },
  guitar: { icon: '🎸', labelEn: 'Guitar', labelCn: '吉他' },
  keyboard: { icon: '🎹', labelEn: 'Keyboard', labelCn: '键盘' },
  drum: { icon: '🥁', labelEn: 'Drum', labelCn: '鼓' },
  bass: { icon: '🎸', labelEn: 'Bass', labelCn: '贝斯' },
};

const WishCard = ({ wish, index, timeSlot, isOwner, isEditable, showUsername, onUpdate, onDelete, onUploadFile }: WishCardProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const [editing, setEditing] = useState(false);

  const role = ROLE_DISPLAY[wish.primary_role] || ROLE_DISPLAY.vocal;

  if (editing && onUpdate && onUploadFile) {
    return (
      <WishForm
        instanceId={wish.instance_id}
        existingWish={wish}
        onSubmit={async (input) => {
          const ok = await onUpdate(wish.id, wish.version, input);
          if (ok) setEditing(false);
          return ok;
        }}
        onCancel={() => setEditing(false)}
        onUploadFile={onUploadFile}
      />
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors rounded-lg group">
      {/* Order number */}
      <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Song info row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-primary/50 text-primary gap-1">
            {role.icon} {en ? role.labelEn : role.labelCn}
          </Badge>
          {wish.is_self_accompanied && (
            <Badge variant="secondary" className="text-xs gap-1">
              {wish.accompanying_instrument === 'guitar' ? '🎸' : '🎹'}
              {en ? 'Self-accompanied' : '弹唱'}
            </Badge>
          )}
          <span className="font-medium text-foreground">
            {wish.artist && `${wish.artist} - `}《{wish.song_title}》
          </span>
        </div>

        {/* Time slot */}
        {timeSlot && (
          <div className="text-xs text-muted-foreground">⏰ {timeSlot}</div>
        )}

        {/* Username for admin */}
        {showUsername && (
          <div className="text-xs text-muted-foreground">
            👤 {showUsername}
          </div>
        )}

        {/* Song version */}
        {wish.song_version && (
          <div className="text-xs text-muted-foreground">
            🎵 {wish.song_version}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {wish.song_link && (
            <a href={wish.song_link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <LinkIcon className="w-3 h-3" /> {en ? 'Song link' : '歌曲链接'}
            </a>
          )}
          {wish.score_links.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <FileText className="w-3 h-3" /> {en ? `Score ${i + 1}` : `谱面 ${i + 1}`}
            </a>
          ))}
          {wish.file_urls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <FileText className="w-3 h-3" /> {url.split('/').pop()?.substring(0, 20)}
            </a>
          ))}
        </div>

        {/* Special requirements / structured constraints */}
        {wish.special_requirements && (() => {
          let arriveAfter = '', leaveBy = '', arrangementRequest = '', notes = '';
          try {
            const p = JSON.parse(wish.special_requirements);
            arriveAfter = p.arriveAfter || '';
            leaveBy = p.leaveBy || '';
            arrangementRequest = p.arrangementRequest || '';
            notes = p.notes || '';
          } catch {
            notes = wish.special_requirements;
          }
          const fmt = (t: string) => {
            if (!t || t === 'none') return '';
            const [h, m] = t.split(':').map(Number);
            const period = h < 12 ? 'AM' : 'PM';
            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
            return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
          };
          return (
            <div className="flex flex-col gap-0.5">
              {arriveAfter && arriveAfter !== 'none' && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <LogIn className="w-3 h-3 shrink-0" />
                  {en ? `Arrives after ${fmt(arriveAfter)}` : `${fmt(arriveAfter)} 后到达`}
                </div>
              )}
              {leaveBy && leaveBy !== 'none' && (
                <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                  <Clock className="w-3 h-3 shrink-0" />
                  {en ? `Leaves before ${fmt(leaveBy)}` : `${fmt(leaveBy)} 前离开`}
                </div>
              )}
              {arrangementRequest && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  {en ? 'Style: ' : '风格：'}{arrangementRequest}
                </div>
              )}
              {notes && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  {notes}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Actions */}
      {isEditable && (isOwner || showUsername) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(wish.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WishCard;
