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
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) return;

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
      if (!inviteCode.trim()) {
        setInviteError(language === 'zh' ? '请输入邀请码' : 'An invite code is required to sign up');
        return;
      }
      setInviteError('');
    }

    setSubmitting(true);
    if (isLogin) {
      let loginEmail = emailOrUsername.trim();
      // If input doesn't look like an email, try to resolve username to email
      if (!loginEmail.includes('@')) {
        try {
          const { data: resolvedEmail, error: lookupError } = await supabase.rpc('get_email_by_display_name', { lookup_name: loginEmail });
          if (lookupError || !resolvedEmail) {
            toast({ title: language === 'zh' ? '用户名或密码错误' : 'Invalid username or password', variant: 'destructive' });
            setSubmitting(false);
            return;
          }
          loginEmail = resolvedEmail;
        } catch {
          toast({ title: language === 'zh' ? '登录失败' : 'Login failed', variant: 'destructive' });
          setSubmitting(false);
          return;
        }
      }
      const { error } = await signIn(loginEmail, password);
      if (error) {
        const msg = error.message?.includes('Invalid login')
          ? (language === 'zh' ? '邮箱/用户名或密码错误' : 'Invalid email/username or password')
          : error.message;
        toast({ title: msg, variant: 'destructive' });
      }
    } else {
      const { error, data } = await signUp(emailOrUsername.trim(), password, displayName.trim());
      if (error) {
        const msg = error.message?.includes('already registered')
          ? (language === 'zh' ? '该邮箱已注册' : 'This email is already registered')
          : error.message;
        toast({ title: msg, variant: 'destructive' });
      } else {
        // Validate invite code and assign role after signup
        if (data?.session) {
          try {
            const { data: result, error: fnError } = await supabase.functions.invoke('claim-admin', {
              body: { invite_code: inviteCode.trim() },
            });
            if (fnError || !result?.success) {
              // Role assignment failed — sign them out and show error
              await supabase.auth.signOut();
              setInviteError(language === 'zh' ? '邀请码无效，注册已取消' : 'Invalid invite code — signup cancelled');
              setSubmitting(false);
              return;
            }
            const roleLabel = result.role === 'admin'
              ? (language === 'zh' ? '管理员' : 'Admin')
              : (language === 'zh' ? '成员' : 'Member');
            toast({
              title: language === 'zh' ? '注册成功！' : 'Account created!',
              description: language === 'zh'
                ? `已授予【${roleLabel}】权限，请查看邮箱验证链接`
                : `${roleLabel} access granted. Please check your email to verify your account.`,
            });
          } catch {
            await supabase.auth.signOut();
            toast({ title: language === 'zh' ? '注册失败，请重试' : 'Signup failed, please try again', variant: 'destructive' });
          }
        } else {
          // Email confirmation required — role will be assigned on next login attempt
          // We can't call edge functions without a session, inform the user to contact admin
          toast({
            title: language === 'zh' ? '注册成功！' : 'Account created!',
            description: language === 'zh' ? '请查看邮箱验证链接后登录' : 'Please verify your email then sign in.',
          });
        }
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
                    <Label htmlFor="email">
                      {isLogin
                        ? (language === 'zh' ? '邮箱或用户名' : 'Email or Username')
                        : t('auth.email')}
                    </Label>
                    <Input
                      id="email"
                      type={isLogin ? 'text' : 'email'}
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder={isLogin ? (language === 'zh' ? '邮箱或用户名' : 'Email or username') : 'you@example.com'}
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
                        {language === 'zh' ? '邀请码' : 'Invite Code'}
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        value={inviteCode}
                        onChange={(e) => { setInviteCode(e.target.value); setInviteError(''); }}
                        placeholder={language === 'zh' ? '请输入邀请码' : 'Enter your invite code'}
                        className={`rounded-xl h-12 bg-secondary border-border ${inviteError ? 'border-destructive' : ''}`}
                        required
                      />
                      {inviteError && (
                        <p className="text-destructive text-xs">{inviteError}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {language === 'zh' ? '需要邀请码才能注册。如没有邀请码，请联系管理员。' : 'An invite code is required to register. Contact an admin if you don\'t have one.'}
                      </p>
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
