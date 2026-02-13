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
                {language === 'en' ? 'Elevate Music Studio' : '星月之音文化俱乐部'}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {language === 'en'
                ? 'A creative space dedicated to nurturing musical talent through professional instruction.'
                : '致力于通过专业教学培养音乐人才的创意空间。'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              {language === 'en' ? 'Quick Links' : '快速链接'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {language === 'en' ? 'Contact Us' : '联系我们'}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {language === 'en' ? 'Privacy Policy' : '隐私政策'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {language === 'en' ? 'Terms of Service' : '服务条款'}
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
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>809 French Rd, Kitchener Complex, Singapore 200809</span>
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
            © {new Date().getFullYear()} Elevate Music Studio Pte. Ltd.{' '}
            {language === 'en' ? 'All rights reserved.' : '版权所有。'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
