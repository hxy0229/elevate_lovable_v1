import { Mic2, Piano, Guitar, Drum, Music, Users, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Lessons = () => {
  const { t, language } = useLanguage();

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
      name: language === 'zh' ? '吉他' : 'Guitar',
      icon: Guitar,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    },
    {
      id: 'violin',
      name: language === 'zh' ? '小提琴' : 'Violin',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400',
    },
    {
      id: 'drums',
      name: t('lessons.drums'),
      icon: Drum,
      image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400',
    },
  ];

  const bandChoir = [
    {
      id: 'choir',
      name: language === 'zh' ? '合唱团' : 'Choir',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
      description: language === 'zh'
        ? '加入我们的合唱团，体验多声部和声的魅力，提升团队协作与音乐表现力。'
        : 'Join our choir to experience the beauty of multi-part harmonies, build teamwork, and develop musical expression.',
    },
    {
      id: 'band',
      name: language === 'zh' ? '乐队' : 'Band',
      icon: Megaphone,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      description: language === 'zh'
        ? '与其他乐手一起排练和演出，从流行到摇滚，体验真正的乐队合奏乐趣。'
        : 'Rehearse and perform with fellow musicians across genres — from pop to rock, experience the thrill of playing in a real band.',
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

          {/* Individual Lessons Section */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">
              {language === 'zh' ? '个人课程' : 'Individual Lessons'}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {language === 'zh' ? '一对一专业指导，按照你的节奏学习' : 'One-on-one professional instruction at your own pace'}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      loading="lazy"
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
                  <CardFooter className="pt-2">
                    <Link to={`/contact?lesson=${lesson.id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-full group-hover:border-primary/50"
                      >
                        {language === 'zh' ? '立即咨询' : 'Enquire Now'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Band / Choir Section */}
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">
              {language === 'zh' ? '乐队 / 合唱团' : 'Band / Choir'}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {language === 'zh'
                ? '与其他音乐人一起排练、演出，感受团队音乐的力量'
                : 'Rehearse and perform together — experience the power of making music as a group'}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bandChoir.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 rounded-xl bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-xl">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link to={`/contact?lesson=${item.id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-full group-hover:border-primary/50"
                      >
                        {language === 'zh' ? '立即咨询' : 'Enquire Now'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default Lessons;
