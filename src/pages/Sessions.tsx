import { Calendar, Clock, Users, Mic2, Guitar, Drum, Music, Piano } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Sessions = () => {
  const { t, language } = useLanguage();

  const sessions = [
    {
      id: 1,
      date: '2025-02-08',
      time: '19:00 - 22:00',
      theme: language === 'en' ? 'Rock Night' : '摇滚之夜',
      maxParticipants: 12,
      currentParticipants: 8,
      roles: ['vocal', 'guitar', 'drums', 'bass'],
      status: 'open',
    },
    {
      id: 2,
      date: '2025-02-15',
      time: '19:00 - 22:00',
      theme: language === 'en' ? 'Pop Classics' : '流行经典',
      maxParticipants: 15,
      currentParticipants: 15,
      roles: ['vocal', 'guitar', 'keyboard', 'bass'],
      status: 'full',
    },
    {
      id: 3,
      date: '2025-02-22',
      time: '19:00 - 22:00',
      theme: language === 'en' ? 'Jazz Evening' : '爵士之夜',
      maxParticipants: 10,
      currentParticipants: 5,
      roles: ['vocal', 'guitar', 'keyboard', 'bass', 'drums'],
      status: 'open',
    },
    {
      id: 4,
      date: '2025-03-01',
      time: '19:00 - 22:00',
      theme: language === 'en' ? 'Acoustic Session' : '原声专场',
      maxParticipants: 8,
      currentParticipants: 3,
      roles: ['vocal', 'guitar'],
      status: 'open',
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <Layout>
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t('sessions.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('sessions.subtitle')}
            </p>
          </div>

          {/* Session Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  session.status === 'full' ? 'opacity-75' : ''
                }`}
              >
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-display text-xl mb-1">
                        {session.theme}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                    </div>
                    <Badge
                      variant={session.status === 'open' ? 'default' : 'secondary'}
                    >
                      {session.status === 'open'
                        ? `${session.maxParticipants - session.currentParticipants} ${t('sessions.spots')}`
                        : t('sessions.full')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {session.currentParticipants}/{session.maxParticipants}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('sessions.roles')}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {session.roles.map((role) => (
                        <div
                          key={role}
                          className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-lg text-sm"
                        >
                          {getRoleIcon(role)}
                          <span>{getRoleLabel(role)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full rounded-xl"
                    disabled={session.status === 'full'}
                    variant={session.status === 'full' ? 'outline' : 'default'}
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
