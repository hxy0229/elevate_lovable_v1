import { Link } from 'react-router-dom';
import { Music, Users, Calendar, Mic2, Guitar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: t('home.feature.membership'),
      description: t('home.feature.membership.desc'),
      link: '/packages',
    },
    {
      icon: Music,
      title: t('home.feature.rooms'),
      description: t('home.feature.rooms.desc'),
      link: '/rooms',
    },
    {
      icon: Calendar,
      title: t('home.feature.sessions'),
      description: t('home.feature.sessions.desc'),
      link: '/sessions',
    },
    {
      icon: GraduationCap,
      title: t('home.feature.lessons'),
      description: t('home.feature.lessons.desc'),
      link: '/lessons',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-28 lg:py-36 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card -z-10" />
        <div className="absolute top-20 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-gold/5 rounded-full blur-3xl -z-10" />
        
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

        <div className="container mx-auto px-5 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Floating music icons */}
            <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 animate-fade-in">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-secondary border border-border flex items-center justify-center premium-shadow">
                <Mic2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary border border-primary/30 flex items-center justify-center gold-glow">
                <Guitar className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-secondary border border-border flex items-center justify-center premium-shadow">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in text-gradient leading-tight">
              {t('home.welcome')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 animate-fade-in max-w-2xl mx-auto leading-relaxed px-2">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in px-4 sm:px-0">
              <Link to="/sessions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 text-base gold-glow">
                  {user
                    ? (language === 'en' ? '🎶 Submit a Wish' : '🎶 提交心愿')
                    : t('home.cta.sessions')}
                </Button>
              </Link>
              <Link to="/lessons" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 text-base border-border hover:border-primary/50">
                  {t('home.feature.lessons')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-card">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t('home.whatWeOffer')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index}>
                <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 bg-secondary/50 border-border/50 group">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:border-primary/50 transition-colors">
                      <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-5 sm:px-6">
          <Card className="bg-gradient-to-br from-secondary via-card to-secondary border-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <CardContent className="p-8 sm:p-12 md:p-16 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              {user ? (
                <>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                    {t('home.feature.sessions')}
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
                    {t('home.feature.sessions.desc')}
                  </p>
                  <Link to="/sessions">
                    <Button size="lg" className="rounded-full font-semibold px-10 h-12 gold-glow">
                      {language === 'en' ? '🎶 Submit a Wish' : '🎶 提交心愿'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                    {t('home.welcome')}
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
                    {t('home.subtitle')}
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="rounded-full font-semibold px-10 h-12 gold-glow">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
              
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
