import { useState } from 'react';
import { Calendar, Clock, Users, Mic2, Guitar, Drum, Music, Piano, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

interface Registration {
  name: string;
  role: string;
}

interface SongEntry {
  order: number;
  singer: string;
  songKey: string;
  songTitle: string;
  artist: string;
}

interface Session {
  id: number;
  day: string;
  dayShort: string;
  time: string;
  type: string;
  name: string;
  nameCn: string;
  maxParticipants: number;
  currentParticipants: number;
  availableRoles: string[];
  status: string;
  registrations: Registration[];
  songList: SongEntry[];
}

const Sessions = () => {
  const { t, language } = useLanguage();
  const [selectedRoles, setSelectedRoles] = useState<Record<number, string[]>>({});

  // Tuesday and Thursday sessions with registrations and song lists
  const sessions: Session[] = [
    {
      id: 1,
      day: t('sessions.tuesday'),
      dayShort: language === 'en' ? 'Tue' : '周二',
      time: '18:00 - 19:30',
      type: 'solo-vocal',
      name: t('sessions.soloVocal'),
      nameCn: '独唱练习',
      maxParticipants: 8,
      currentParticipants: 5,
      availableRoles: ['vocal'],
      status: 'open',
      registrations: [
        { name: 'Lily', role: 'vocal' },
        { name: 'Sarah', role: 'vocal' },
        { name: 'Mike', role: 'vocal' },
        { name: 'Jenny', role: 'vocal' },
        { name: 'Tom', role: 'vocal' },
      ],
      songList: [
        { order: 1, singer: 'Lily', songKey: 'C调', songTitle: '我愿意', artist: '王菲' },
        { order: 2, singer: 'Sarah', songKey: 'G调', songTitle: '遇见', artist: '孙燕姿' },
        { order: 3, singer: 'Mike', songKey: 'D调', songTitle: '童话', artist: '光良' },
        { order: 4, singer: 'Jenny', songKey: 'A调', songTitle: '匆匆那年', artist: '王菲' },
        { order: 5, singer: 'Tom', songKey: 'E调', songTitle: '那些年', artist: '胡夏' },
      ],
    },
    {
      id: 2,
      day: t('sessions.tuesday'),
      dayShort: language === 'en' ? 'Tue' : '周二',
      time: '19:30 - 22:00',
      type: 'band',
      name: t('sessions.bandSession'),
      nameCn: '乐队排练',
      maxParticipants: 15,
      currentParticipants: 10,
      availableRoles: ['vocal', 'guitar', 'drums', 'bass', 'keyboard'],
      status: 'open',
      registrations: [
        { name: 'Lily', role: 'vocal' },
        { name: 'Danny', role: 'guitar' },
        { name: 'Alex', role: 'drums' },
        { name: 'Sam', role: 'bass' },
        { name: 'Chris', role: 'keyboard' },
        { name: 'Emma', role: 'vocal' },
        { name: 'Kevin', role: 'guitar' },
        { name: 'Rachel', role: 'vocal' },
        { name: 'Jason', role: 'drums' },
        { name: 'Nina', role: 'keyboard' },
      ],
      songList: [
        { order: 1, singer: 'Lily', songKey: 'C调', songTitle: '海阔天空', artist: 'Beyond' },
        { order: 2, singer: 'Emma', songKey: 'G调', songTitle: '光辉岁月', artist: 'Beyond' },
        { order: 3, singer: 'Rachel', songKey: 'D调', songTitle: '真的爱你', artist: 'Beyond' },
      ],
    },
    {
      id: 3,
      day: t('sessions.thursday'),
      dayShort: language === 'en' ? 'Thu' : '周四',
      time: '19:30 - 22:00',
      type: 'band',
      name: t('sessions.bandSession'),
      nameCn: '乐队排练',
      maxParticipants: 15,
      currentParticipants: 15,
      availableRoles: ['vocal', 'guitar', 'drums', 'bass', 'keyboard'],
      status: 'full',
      registrations: [
        { name: 'John', role: 'vocal' },
        { name: 'Peter', role: 'guitar' },
        { name: 'David', role: 'drums' },
        { name: 'Michael', role: 'bass' },
        { name: 'Steven', role: 'keyboard' },
        { name: 'Linda', role: 'vocal' },
        { name: 'Amy', role: 'guitar' },
        { name: 'Susan', role: 'vocal' },
        { name: 'Brian', role: 'drums' },
        { name: 'Eric', role: 'keyboard' },
        { name: 'Kate', role: 'vocal' },
        { name: 'Paul', role: 'guitar' },
        { name: 'Mark', role: 'bass' },
        { name: 'Lisa', role: 'vocal' },
        { name: 'Joe', role: 'keyboard' },
      ],
      songList: [
        { order: 1, singer: 'John', songKey: 'E调', songTitle: '倔强', artist: '五月天' },
        { order: 2, singer: 'Linda', songKey: 'C调', songTitle: '知足', artist: '五月天' },
        { order: 3, singer: 'Susan', songKey: 'G调', songTitle: '温柔', artist: '五月天' },
        { order: 4, singer: 'Kate', songKey: 'D调', songTitle: '突然好想你', artist: '五月天' },
        { order: 5, singer: 'Lisa', songKey: 'A调', songTitle: '离开地球表面', artist: '五月天' },
      ],
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vocal':
        return <Mic2 className="w-4 h-4" />;
      case 'guitar':
        return <Guitar className="w-4 h-4" />;
      case 'drums':
        return <Drum className="w-4 h-4" />;
      case 'bass':
        return <Music className="w-4 h-4" />;
      case 'keyboard':
        return <Piano className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    return t(`sessions.${role}`);
  };

  const handleRoleToggle = (sessionId: number, role: string) => {
    setSelectedRoles((prev) => {
      const current = prev[sessionId] || [];
      if (current.includes(role)) {
        return { ...prev, [sessionId]: current.filter((r) => r !== role) };
      } else {
        return { ...prev, [sessionId]: [...current, role] };
      }
    });
  };

  const getNextDate = (dayName: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const targetDay = days.indexOf(dayName.toLowerCase());
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    
    if (language === 'zh') {
      return nextDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    }
    return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t('sessions.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('sessions.subtitle')}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          {/* Session Cards */}
          <div className="max-w-3xl mx-auto space-y-6">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`overflow-hidden transition-all duration-300 border-border ${
                  session.status === 'full' ? 'opacity-75' : 'hover:border-primary/50'
                }`}
              >
                <CardHeader className="bg-secondary/50 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          {session.day}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getNextDate(session.day.toLowerCase().includes('tue') || session.day.includes('二') ? 'tuesday' : 'thursday')}
                        </span>
                      </div>
                      <CardTitle className="font-display text-xl">
                        {session.type === 'solo-vocal' && '🎤 '}
                        {session.type === 'band' && '🎸 '}
                        {session.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={session.status === 'open' ? 'default' : 'secondary'}
                      className={session.status === 'open' ? '' : 'bg-muted text-muted-foreground'}
                    >
                      {session.status === 'open'
                        ? `${session.maxParticipants - session.currentParticipants} ${t('sessions.spots')}`
                        : t('sessions.full')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        {session.currentParticipants}/{session.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {/* Registered Participants */}
                  {session.registrations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {language === 'en' ? 'Registered Participants' : '已报名成员'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.registrations.map((reg, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm"
                          >
                            {getRoleIcon(reg.role)}
                            <span className="text-foreground">{reg.name}</span>
                            <span className="text-muted-foreground">- {getRoleLabel(reg.role)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Song List */}
                  {session.songList.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ListMusic className="w-4 h-4 text-primary" />
                        {language === 'en' ? 'Song List' : '歌曲列表'}
                      </h4>
                      <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
                        <div className="divide-y divide-border">
                          {session.songList.map((song) => (
                            <div
                              key={song.order}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                            >
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                {song.order}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground">{song.singer}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                                    {song.songKey}
                                  </Badge>
                                  <span className="text-foreground">{song.artist}《{song.songTitle}》</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-border" />

                  {session.status === 'open' && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('sessions.chooseRole')}:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {session.availableRoles.map((role) => (
                          <label
                            key={role}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                              (selectedRoles[session.id] || []).includes(role)
                                ? 'bg-primary/10 border-primary text-foreground'
                                : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            <Checkbox
                              checked={(selectedRoles[session.id] || []).includes(role)}
                              onCheckedChange={() => handleRoleToggle(session.id, role)}
                              className="hidden"
                            />
                            {getRoleIcon(role)}
                            <span className="text-sm">{getRoleLabel(role)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className={`w-full rounded-full h-12 font-semibold ${
                      session.status === 'open' ? 'gold-glow' : ''
                    }`}
                    disabled={session.status === 'full'}
                    variant={session.status === 'full' ? 'secondary' : 'default'}
                  >
                    {session.status === 'full'
                      ? t('sessions.waitlist')
                      : t('sessions.register')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sessions;
