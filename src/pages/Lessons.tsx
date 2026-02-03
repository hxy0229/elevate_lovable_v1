import { Mic2, Piano, Guitar, Drum, Music, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Lessons = () => {
  const { t } = useLanguage();

  const lessons = [
    {
      id: 'vocal',
      name: t('lessons.vocal'),
      icon: Mic2,
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    },
    {
      id: 'piano',
      name: t('lessons.piano'),
      icon: Piano,
      image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
    },
    {
      id: 'guitar',
      name: t('lessons.guitar'),
      icon: Guitar,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    },
    {
      id: 'drums',
      name: t('lessons.drums'),
      icon: Drum,
      image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400',
    },
    {
      id: 'bass',
      name: t('lessons.bass'),
      icon: Music,
      image: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=400',
    },
  ];

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t('lessons.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('lessons.subtitle')}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          {/* Description */}
          <Card className="max-w-3xl mx-auto mb-12 bg-secondary/50 border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground leading-relaxed">
                {t('lessons.description')}
              </p>
            </CardContent>
          </Card>

          {/* Lesson Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {lessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="relative h-48">
                  <img
                    src={lesson.image}
                    alt={lesson.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center">
                      <lesson.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-xl">
                    {lesson.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {t('lessons.contactUs')}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-full group-hover:border-primary/50"
                  >
                    {t('lessons.inquire')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Price Note */}
          <div className="text-center mt-12">
            <Card className="inline-block bg-secondary/50 border-border">
              <CardContent className="py-4 px-8">
                <p className="text-muted-foreground text-sm">
                  💡 {t('lessons.priceNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Lessons;
