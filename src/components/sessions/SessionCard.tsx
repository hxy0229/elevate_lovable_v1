import { useState } from 'react';
import { Clock, Users, Mic2, Guitar, Drum, Music, Piano, ListMusic, Tag, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SessionRow, RegistrationRow, SongRow } from '@/hooks/useSessionData';
import RegistrationForm from './RegistrationForm';
import SongRequestForm from './SongRequestForm';
import SessionContentSection from './SessionContentSection';
import type { ContentRow } from '@/hooks/useSessionData';

interface SessionCardProps {
  session: SessionRow;
  registrations: RegistrationRow[];
  songs: SongRow[];
  contents: ContentRow[];
  user: any;
  onRegister: (sessionId: string, displayName: string, roles: string[]) => Promise<boolean>;
  onUnregister: (sessionId: string) => Promise<boolean>;
  onAddSong: (sessionId: string, singerName: string, songTitle: string, artist: string, songKey: string) => Promise<boolean>;
  onRemoveSong: (songId: string) => Promise<boolean>;
  onUpdateTheme: (sessionId: string, theme: string, themeCn: string) => Promise<boolean>;
  onUploadContent: (sessionId: string, contentType: string, file?: File, title?: string, description?: string, contentText?: string) => Promise<boolean>;
  onDeleteContent: (contentId: string) => Promise<boolean>;
}

const roleIcons: Record<string, React.ReactNode> = {
  vocal: <Mic2 className="w-4 h-4" />,
  guitar: <Guitar className="w-4 h-4" />,
  drums: <Drum className="w-4 h-4" />,
  bass: <Music className="w-4 h-4" />,
  keyboard: <Piano className="w-4 h-4" />,
};

const SessionCard = ({
  session, registrations, songs, contents, user,
  onRegister, onUnregister, onAddSong, onRemoveSong, onUpdateTheme,
  onUploadContent, onDeleteContent,
}: SessionCardProps) => {
  const { t, language } = useLanguage();
  const [showRegForm, setShowRegForm] = useState(false);
  const [showSongForm, setShowSongForm] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesCn = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayLabel = language === 'zh' ? dayNamesCn[session.day_of_week] : dayNames[session.day_of_week];

  const sessionName = language === 'zh' ? (session.name_cn || session.name) : session.name;
  const themeText = language === 'zh' ? (session.theme_cn || session.theme) : session.theme;

  const isFull = registrations.length >= session.max_participants;
  const spotsLeft = session.max_participants - registrations.length;
  const isRegistered = user && registrations.some((r) => r.user_id === user.id);

  const formatTime = (t: string) => t.substring(0, 5);
  const dateLabel = session.session_date
    ? new Date(session.session_date + 'T00:00:00').toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
    : '';

  const getRoleLabel = (role: string) => t(`sessions.${role}`) || role;

  return (
    <Card className={`overflow-hidden transition-all duration-300 border-border ${isFull && !isRegistered ? 'opacity-75' : 'hover:border-primary/50'}`}>
      <CardHeader className="bg-secondary/50 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/50 text-primary">{dayLabel}</Badge>
              {dateLabel && <span className="text-sm text-muted-foreground">{dateLabel}</span>}
            </div>
            <CardTitle className="font-display text-xl">
              {session.session_type === 'solo-vocal' ? '🎤 ' : '🎸 '}
              {sessionName}
            </CardTitle>
            {themeText && (
              <div className="flex items-center gap-1.5 mt-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {language === 'zh' ? '主题' : 'Theme'}: {themeText}
                </span>
              </div>
            )}
          </div>
          <Badge variant={isFull ? 'secondary' : 'default'} className={isFull ? 'bg-muted text-muted-foreground' : ''}>
            {isFull ? t('sessions.full') : `${spotsLeft} ${t('sessions.spots')}`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Time & participants count */}
        <div className="flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{registrations.length}/{session.max_participants}</span>
          </div>
        </div>

        {/* Registered participants */}
        {registrations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {language === 'en' ? 'Registered Participants' : '已报名成员'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm">
                  {reg.roles.map((role) => (
                    <span key={role} className="flex items-center gap-1">
                      {roleIcons[role] || <Music className="w-4 h-4" />}
                    </span>
                  ))}
                  <span className="text-foreground">{reg.display_name}</span>
                  <span className="text-muted-foreground">- {reg.roles.map(getRoleLabel).join(' + ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Song list */}
        {songs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              {language === 'en' ? 'Song List' : '歌曲列表'}
            </h4>
            <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden divide-y divide-border">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {song.sort_order}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{song.singer_name}</span>
                    <span className="text-muted-foreground">-</span>
                    <Badge variant="outline" className="text-xs border-primary/50 text-primary">{song.song_key}</Badge>
                    <span className="text-foreground">{song.artist}《{song.song_title}》</span>
                  </div>
                  {user && song.requested_by === user.id && (
                    <button onClick={() => onRemoveSong(song.id)} className="text-xs text-destructive hover:underline">
                      {language === 'zh' ? '删除' : 'Remove'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-border" />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!isRegistered && !isFull && (
            <button
              onClick={() => setShowRegForm(!showRegForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '报名' : 'Register'}
            </button>
          )}
          {isRegistered && (
            <button
              onClick={() => onUnregister(session.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive border border-destructive/30 font-medium text-sm hover:bg-destructive/20 transition-colors"
            >
              {language === 'zh' ? '取消报名' : 'Unregister'}
            </button>
          )}
          {isRegistered && (
            <button
              onClick={() => setShowSongForm(!showSongForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground font-medium text-sm hover:border-primary/50 transition-colors"
            >
              <ListMusic className="w-4 h-4 text-primary" />
              {language === 'zh' ? '点歌' : 'Request Song'}
            </button>
          )}
          {isFull && !isRegistered && (
            <span className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
              {t('sessions.full')}
            </span>
          )}
        </div>

        {/* Registration form */}
        {showRegForm && (
          <RegistrationForm
            sessionType={session.session_type}
            onSubmit={async (name, roles) => {
              const ok = await onRegister(session.id, name, roles);
              if (ok) setShowRegForm(false);
            }}
            onCancel={() => setShowRegForm(false)}
          />
        )}

        {/* Song request form */}
        {showSongForm && (
          <SongRequestForm
            onSubmit={async (singerName, songTitle, artist, songKey) => {
              const ok = await onAddSong(session.id, singerName, songTitle, artist, songKey);
              if (ok) setShowSongForm(false);
            }}
            onCancel={() => setShowSongForm(false)}
          />
        )}

        {/* Post-session content */}
        <SessionContentSection
          sessionId={session.id}
          contents={contents}
          user={user}
          onUpload={onUploadContent}
          onDelete={onDeleteContent}
        />
      </CardContent>
    </Card>
  );
};

export default SessionCard;
