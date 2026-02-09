import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

const Auth = () => {
  const { t, language } = useLanguage();
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (!isLogin) {
      if (password !== confirmPassword) {
        toast({ title: language === 'zh' ? '密码不匹配' : 'Passwords do not match', variant: 'destructive' });
        return;
      }
      if (password.length < 6) {
        toast({ title: language === 'zh' ? '密码至少6位' : 'Password must be at least 6 characters', variant: 'destructive' });
        return;
      }
      if (!displayName.trim()) {
        toast({ title: language === 'zh' ? '请输入名称' : 'Please enter a display name', variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        const msg = error.message?.includes('Invalid login')
          ? (language === 'zh' ? '邮箱或密码错误' : 'Invalid email or password')
          : error.message;
        toast({ title: msg, variant: 'destructive' });
      }
    } else {
      const { error, data } = await signUp(email, password, displayName.trim());
      if (error) {
        const msg = error.message?.includes('already registered')
          ? (language === 'zh' ? '该邮箱已注册' : 'This email is already registered')
          : error.message;
        toast({ title: msg, variant: 'destructive' });
      } else {
        // If invite code provided, try to claim admin after signup
        if (inviteCode.trim() && data?.session) {
          try {
            const { data: result, error: fnError } = await supabase.functions.invoke('claim-admin', {
              body: { invite_code: inviteCode.trim() },
            });
            if (!fnError && result?.success) {
              toast({ title: language === 'zh' ? '管理员权限已激活！' : 'Admin access granted!' });
            }
          } catch { /* ignore - they can try later */ }
        }
        toast({
          title: language === 'zh' ? '注册成功！' : 'Account created!',
          description: language === 'zh' ? '请查看邮箱验证链接' : 'Please check your email to verify your account.',
        });
      }
    }
    setSubmitting(false);
  };

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
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label>{language === 'zh' ? '显示名称' : 'Display Name'}</Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={language === 'zh' ? '你的名字' : 'Your name'}
                        className="rounded-xl h-12 bg-secondary border-border"
                        maxLength={50}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="rounded-xl h-12 bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl h-12 bg-secondary border-border pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label>{t('auth.confirmPassword')}</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl h-12 bg-secondary border-border"
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        {language === 'zh' ? '邀请码（可选）' : 'Invite Code (optional)'}
                      </Label>
                      <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder={language === 'zh' ? '管理员邀请码' : 'Admin invite code'}
                        className="rounded-xl h-12 bg-secondary border-border"
                      />
                    </div>
                  )}
                  {isLogin && (
                    <div className="text-right">
                      <button type="button" className="text-sm text-primary hover:underline">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  )}
                  <Button type="submit" disabled={submitting} className="w-full rounded-full h-12 font-semibold gold-glow">
                    {submitting
                      ? (language === 'zh' ? '请稍候...' : 'Please wait...')
                      : (isLogin ? t('auth.login') : t('auth.signup'))}
                  </Button>
                  <div className="text-center">
                    <span className="text-muted-foreground text-sm">
                      {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      {isLogin ? t('auth.signup') : t('auth.login')}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
