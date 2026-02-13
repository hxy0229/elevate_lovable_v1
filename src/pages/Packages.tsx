import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Packages = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <section className="py-20 lg:py-40">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-gradient">
              {language === 'zh' ? '即将推出' : 'Coming Soon'}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {language === 'zh'
                ? '我们正在精心打造会员配套方案，敬请期待！'
                : "We're crafting exciting membership packages just for you. Stay tuned!"}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground text-sm">
              ✨ {language === 'zh' ? '精彩即将呈现' : 'Something amazing is on the way'}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
