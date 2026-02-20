import { Link } from 'react-router-dom';
import { Music, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-14">
        {/* Top section: Brand + Columns */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0">
          {/* Brand — fixed width, left-aligned */}
          <div className="lg:w-[320px] lg:shrink-0 lg:pr-12 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                {en ? 'Elevate Music Studio' : '星月之音文化俱乐部'}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
              {en
                ? 'A creative space dedicated to nurturing musical talent through professional instruction.'
                : '致力于通过专业教学培养音乐人才的创意空间。'}
            </p>
          </div>

          {/* Right columns — evenly distributed */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-8">
            {/* Support */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-5">
                {en ? 'Support' : '支持'}
              </h3>
              <ul className="space-y-3">
                {[
                  { to: '/contact', label: en ? 'Contact Us' : '联系我们' },
                  { to: '/privacy', label: en ? 'Privacy Policy' : '隐私政策' },
                  { to: '/terms', label: en ? 'Terms of Service' : '服务条款' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-5">
                {en ? 'Visit Us' : '地址'}
              </h3>
              <a
                href="https://maps.google.com/?q=809+French+Rd+Kitchener+Complex+Singapore+200809"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="leading-relaxed">
                  809 French Rd,
                  <br />
                  Kitchener Complex,
                  <br />
                  Singapore 200809
                </span>
              </a>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-5">
                {en ? 'Hours' : '营业时间'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground/80">
                        {en ? 'Tue – Fri' : '周二至周五'}
                      </span>
                      <br />
                      6:00 PM – 10:30 PM
                    </div>
                    <div>
                      <span className="font-medium text-foreground/80">
                        {en ? 'Sat – Sun' : '周六至周日'}
                      </span>
                      <br />
                      11:30 AM – 10:30 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            © {new Date().getFullYear()} Elevate Music Studio Pte. Ltd.{' '}
            {en ? 'All rights reserved.' : '版权所有。'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
