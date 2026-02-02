import { Link } from 'react-router-dom';
import { Music, Users, Calendar, Mic2, Guitar, Drum } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { t } = useLanguage();

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
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-background to-cream-dark -z-10" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Floating music icons */}
            <div className="flex justify-center gap-4 mb-8 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic2 className="w-6 h-6 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <Guitar className="w-7 h-7 text-accent" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Drum className="w-6 h-6 text-gold" />
              </div>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              {t('home.welcome')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <Link to="/packages">
                <Button size="lg" className="rounded-xl font-semibold">
                  {t('home.cta.packages')}
                </Button>
              </Link>
              <Link to="/rooms">
                <Button size="lg" variant="outline" className="rounded-xl font-semibold">
                  {t('home.cta.rooms')}
                </Button>
              </Link>
              <Link to="/sessions">
                <Button size="lg" variant="secondary" className="rounded-xl font-semibold">
                  {t('home.cta.sessions')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">
                {t('home.welcome')}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto relative z-10">
                {t('home.subtitle')}
              </p>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl font-semibold relative z-10"
                >
                  {t('nav.signup')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
