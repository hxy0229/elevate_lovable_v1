import { Check, Mic2, Guitar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Packages = () => {
  const { t } = useLanguage();

  const packages = [
    {
      id: 'singer',
      name: t('packages.singer'),
      price: 198,
      icon: Mic2,
      description: t('packages.singer.desc'),
      features: [
        t('packages.features.sessions'),
        t('packages.features.vocal'),
        t('packages.features.band'),
        t('packages.features.memberCard'),
        t('packages.features.roomDiscount'),
        t('packages.features.community'),
      ],
      popular: true,
    },
    {
      id: 'musician',
      name: t('packages.musician'),
      price: 120,
      icon: Guitar,
      description: t('packages.musician.desc'),
      features: [
        t('packages.features.sessions'),
        t('packages.features.band'),
        t('packages.features.memberCard'),
        t('packages.features.roomDiscount'),
        t('packages.features.community'),
      ],
      popular: false,
    },
  ];

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t('packages.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('packages.subtitle')}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          {/* Package Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative h-full transition-all duration-300 hover:border-primary/50 bg-card ${
                  pkg.popular
                    ? 'border-primary/50 gold-glow'
                    : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">
                    {t('packages.popular')}
                  </Badge>
                )}
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                    <pkg.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-2xl mb-2">
                    {pkg.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    {pkg.description}
                  </CardDescription>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg text-muted-foreground">SGD</span>
                    <span className="text-5xl font-bold text-foreground">
                      {pkg.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('packages.sessions')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 px-8">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-4">
                  <Button
                    className={`w-full rounded-full h-12 font-semibold ${
                      pkg.popular ? 'gold-glow' : ''
                    }`}
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    {t('packages.selectPlan')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Note */}
          <div className="text-center">
            <Card className="inline-block bg-secondary/50 border-border/50">
              <CardContent className="py-4 px-8">
                <p className="text-muted-foreground text-sm">
                  💡 {t('packages.note')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
