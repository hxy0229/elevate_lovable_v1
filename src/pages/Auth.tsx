import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth = () => {
  const { t, language } = useLanguage();
  const [memberType, setMemberType] = useState<string>('singer');
  const [instrument, setInstrument] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream-dark flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">
              {language === 'en' ? 'Music Center' : '音乐中心'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Join our music community'
                : '加入我们的音乐社区'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="rounded-xl">
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl">
                  {t('auth.signup')}
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    {t('auth.login')}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Member Type Selection */}
                  <div className="space-y-2">
                    <Label>{t('auth.memberType')}</Label>
                    <RadioGroup
                      value={memberType}
                      onValueChange={setMemberType}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="singer" id="singer" />
                        <Label htmlFor="singer" className="cursor-pointer">
                          {t('auth.singer')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="musician" id="musician" />
                        <Label htmlFor="musician" className="cursor-pointer">
                          {t('auth.musician')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Instrument Selection (for musicians) */}
                  {memberType === 'musician' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label>{t('auth.instrument')}</Label>
                      <Select value={instrument} onValueChange={setInstrument}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('auth.instrument')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guitar">{t('auth.guitar')}</SelectItem>
                          <SelectItem value="drums">{t('auth.drums')}</SelectItem>
                          <SelectItem value="bass">{t('auth.bass')}</SelectItem>
                          <SelectItem value="keyboard">{t('auth.keyboard')}</SelectItem>
                          <SelectItem value="multi">{t('auth.multi')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full rounded-xl">
                    {t('auth.signup')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
