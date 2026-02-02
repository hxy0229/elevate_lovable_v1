import { Link } from 'react-router-dom';
import { Music, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                {language === 'en' ? 'Music Center' : '音乐中心'}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {language === 'en'
                ? 'Your creative space for music practice and collaboration.'
                : '您的音乐练习与合作创意空间。'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              {language === 'en' ? 'Quick Links' : '快速链接'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/packages" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.packages')}
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.rooms')}
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.sessions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              {language === 'en' ? 'Contact' : '联系我们'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@musiccenter.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {language === 'en' ? '123 Music Street' : '音乐街123号'}
                </span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              {language === 'en' ? 'Hours' : '营业时间'}
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium">
                  {language === 'en' ? 'Mon - Fri:' : '周一至周五:'}
                </span>{' '}
                10:00 - 22:00
              </li>
              <li>
                <span className="font-medium">
                  {language === 'en' ? 'Sat - Sun:' : '周六至周日:'}
                </span>{' '}
                09:00 - 23:00
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} Music Center.{' '}
            {language === 'en' ? 'All rights reserved.' : '版权所有。'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
