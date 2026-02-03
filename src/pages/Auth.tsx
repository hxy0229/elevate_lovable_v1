import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Auth = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Role selection - can be both
  const [isSinger, setIsSinger] = useState(false);
  const [isMusician, setIsMusician] = useState(false);
  
  // Instruments selection
  const [instruments, setInstruments] = useState<string[]>([]);

  const toggleInstrument = (instrument: string) => {
    setInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const instrumentOptions = [
    { id: 'guitar', label: t('auth.guitar') },
    { id: 'drums', label: t('auth.drums') },
    { id: 'bass', label: t('auth.bass') },
    { id: 'keyboard', label: t('auth.keyboard') },
  ];

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-border bg-card">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-6">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl">
                  {isLogin ? t('auth.login') : t('auth.signup')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl h-12 bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="rounded-xl h-12 bg-secondary border-border pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl h-12 bg-secondary border-border"
                      />
                    </div>

                    {/* Role Selection - Can be both */}
                    <div className="space-y-3">
                      <Label>{t('auth.roles')}</Label>
                      <p className="text-xs text-muted-foreground">{t('auth.selectMultiple')}</p>
                      <div className="flex gap-3">
                        <label
                          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                            isSinger
                              ? 'bg-primary/10 border-primary text-foreground'
                              : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            checked={isSinger}
                            onCheckedChange={(checked) => setIsSinger(!!checked)}
                            className="hidden"
                          />
                          <span>🎤</span>
                          <span className="font-medium">{t('auth.singer')}</span>
                        </label>
                        <label
                          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                            isMusician
                              ? 'bg-primary/10 border-primary text-foreground'
                              : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            checked={isMusician}
                            onCheckedChange={(checked) => setIsMusician(!!checked)}
                            className="hidden"
                          />
                          <span>🎸</span>
                          <span className="font-medium">{t('auth.musician')}</span>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t('auth.roleNote')}
                      </p>
                    </div>

                    {/* Instruments - Show if musician selected */}
                    {isMusician && (
                      <div className="space-y-3">
                        <Label>{t('auth.instruments')}</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {instrumentOptions.map((instrument) => (
                            <label
                              key={instrument.id}
                              className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                instruments.includes(instrument.id)
                                  ? 'bg-primary/10 border-primary text-foreground'
                                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              <Checkbox
                                checked={instruments.includes(instrument.id)}
                                onCheckedChange={() => toggleInstrument(instrument.id)}
                                className="hidden"
                              />
                              <span className="text-sm font-medium">{instrument.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isLogin && (
                  <div className="text-right">
                    <Link
                      to="#"
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                )}

                <Button className="w-full rounded-full h-12 font-semibold gold-glow">
                  {isLogin ? t('auth.login') : t('auth.signup')}
                </Button>

                <div className="text-center">
                  <span className="text-muted-foreground text-sm">
                    {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                  </span>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    {isLogin ? t('auth.signup') : t('auth.login')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
