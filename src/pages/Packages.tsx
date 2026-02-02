import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Packages = () => {
  const { t, language } = useLanguage();

  const plans = [
    {
      id: 'standard',
      name: t('packages.standard'),
      prices: { monthly: 99, quarterly: 269, annual: 999 },
      features: [
        t('packages.features.roomBooking'),
        t('packages.features.sessionJoin'),
        t('packages.features.memberCard'),
      ],
      popular: false,
    },
    {
      id: 'student',
      name: t('packages.student'),
      prices: { monthly: 69, quarterly: 189, annual: 699 },
      features: [
        t('packages.features.roomBooking'),
        t('packages.features.sessionJoin'),
        t('packages.features.memberCard'),
        language === 'en' ? '20% student discount' : '学生8折优惠',
      ],
      popular: true,
    },
    {
      id: 'professional',
      name: t('packages.professional'),
      prices: { monthly: 199, quarterly: 539, annual: 1999 },
      features: [
        t('packages.features.roomBooking'),
        t('packages.features.sessionJoin'),
        t('packages.features.memberCard'),
        t('packages.features.priority'),
        t('packages.features.discount'),
        t('packages.features.guest'),
      ],
      popular: false,
    },
  ];

  const billingPeriods = [
    { id: 'monthly', label: t('packages.monthly') },
    { id: 'quarterly', label: t('packages.quarterly') },
    { id: 'annual', label: t('packages.annual') },
  ];

  return (
    <Layout>
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t('packages.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('packages.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              {billingPeriods.map((period) => (
                <TabsTrigger key={period.id} value={period.id} className="rounded-xl">
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {billingPeriods.map((period) => (
              <TabsContent key={period.id} value={period.id}>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative h-full transition-all duration-300 hover:shadow-lg ${
                        plan.popular
                          ? 'border-primary shadow-lg scale-105'
                          : 'border-border/50'
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          {t('packages.popular')}
                        </Badge>
                      )}
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="font-display text-2xl">
                          {plan.name}
                        </CardTitle>
                        <CardDescription>
                          <span className="text-4xl font-bold text-foreground">
                            ¥{plan.prices[period.id as keyof typeof plan.prices]}
                          </span>
                          <span className="text-muted-foreground">
                            {t('packages.perMonth')}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-primary" />
                              </div>
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full rounded-xl ${
                            plan.popular ? '' : 'variant-outline'
                          }`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {t('packages.selectPlan')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
