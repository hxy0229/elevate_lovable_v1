import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Music, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const baseLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/packages', label: t('nav.packages') },
    { path: '/rooms', label: t('nav.rooms') },
    { path: '/sessions', label: t('nav.sessions') },
    { path: '/lessons', label: t('nav.lessons') },
  ];

  const isActive = (path: string) => location.pathname === path;
  const toggleLanguage = () => setLanguage(language === 'en' ? 'zh' : 'en');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const showAuthArea = !loading;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              {language === 'en' ? 'Elevate Music' : '星月之音'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {baseLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Admin link: always in DOM to prevent layout shift */}
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              } ${isAdmin ? '' : 'invisible pointer-events-none'}`}
              tabIndex={isAdmin ? undefined : -1}
              aria-hidden={!isAdmin || undefined}
            >
              {t('nav.admin')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center gap-1.5 rounded-full">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{language === 'en' ? '中文' : 'EN'}</span>
            </Button>

            <div className={`flex items-center gap-2 transition-opacity duration-150 ${showAuthArea ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {user ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full px-4 gap-1.5">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="rounded-full px-5">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
            </div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {baseLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {t('nav.admin')}
                </Link>
              )}
              {showAuthArea && (
                user ? (
                  <button
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    className="px-4 py-3 rounded-lg font-medium text-left text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-primary"
                  >
                    {t('nav.login')}
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
