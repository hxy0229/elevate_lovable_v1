import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin } from 'lucide-react';

const Contact = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {language === 'zh' ? '联系我们' : 'Contact Us'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'zh'
                ? '有任何问题？请随时联系我们！'
                : 'Have any questions? Feel free to reach out!'}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          <Card className="max-w-2xl mx-auto border-border">
            <CardContent className="p-8 space-y-6 text-center">
              <p className="text-muted-foreground leading-relaxed">
                {language === 'zh'
                  ? '联系表格即将上线，敬请期待下一条消息中的详细说明。'
                  : 'Contact form coming soon — details in the next message.'}
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>809 French Rd, Kitchener Complex, Singapore 200809</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
