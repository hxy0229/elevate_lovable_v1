import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Configurable contact info — update these when ready
const CONTACT_INFO = {
  phone: '92980586',
  address: 'Level 3, Blk 809 French Rd, Kitchener Complex, Singapore 200809',
};

const LESSON_OPTIONS = [
  { value: 'vocal', labelEn: 'Vocal Training', labelZh: '声乐培训' },
  { value: 'piano', labelEn: 'Piano', labelZh: '钢琴' },
  { value: 'guitar', labelEn: 'Guitar', labelZh: '吉他' },
  { value: 'violin', labelEn: 'Violin', labelZh: '小提琴' },
  { value: 'drums', labelEn: 'Drums', labelZh: '架子鼓' },
];

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().min(1, 'Phone number is required').max(30),
  email: z.string().trim().email('Please enter a valid email').max(255),
  lessons: z.array(z.string()).default([]),
  message: z.string().trim().max(2000).optional().default(''),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preselectedLesson = searchParams.get('lesson') || '';

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      lessons: preselectedLesson ? [preselectedLesson] : [],
      message: '',
    },
  });

  useEffect(() => {
    if (preselectedLesson && !form.getValues('lessons').includes(preselectedLesson)) {
      form.setValue('lessons', [preselectedLesson]);
    }
  }, [preselectedLesson]);

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contact_enquiries')
        .insert({
          name: values.name,
          phone: values.phone,
          email: values.email,
          lessons: values.lessons,
          message: values.message,
        });

      if (dbError) throw dbError;

      // Send email notification
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: values,
        });
      } catch {
        // Email sending failure shouldn't block submission
        console.warn('Email notification failed, but enquiry was saved.');
      }

      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: language === 'zh' ? '提交失败' : 'Submission Failed',
        description: language === 'zh' ? '请稍后再试。' : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              {/* Glowing circle with icon */}
              <div className="relative mx-auto w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
              </div>

              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gradient">
                {language === 'zh' ? '太棒了，我们收到啦！🎶' : "You're All Set! 🎶"}
              </h2>

              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm mt-6">
                <CardContent className="p-8 space-y-4">
                  <p className="text-lg text-foreground leading-relaxed">
                    {language === 'zh'
                      ? '感谢您对我们的信任！我们的团队已经迫不及待地想要了解您的音乐之旅了。'
                      : "Thanks for reaching out — we're excited to hear about your musical journey!"}
                  </p>
                    <p className="text-muted-foreground leading-relaxed">
                    {language === 'zh'
                      ? '我们会在24小时内回复您，敬请期待！'
                      : 'Our team will be in touch within 24 hours.'}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'zh'
                      ? '我们迫不及待想要开始了！🎵'
                      : "We can't wait to get started! 🎵"}
                  </p>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                className="mt-8 rounded-full"
                onClick={() => setSubmitted(false)}
              >
                {language === 'zh' ? '提交另一个咨询' : 'Submit Another Enquiry'}
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
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

          <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-display text-lg font-semibold">
                    {language === 'zh' ? '联系方式' : 'Get in Touch'}
                  </h3>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <a
                      href={`tel:+65${CONTACT_INFO.phone}`}
                      className="hover:text-primary transition-colors"
                    >
                      {CONTACT_INFO.phone}
                    </a>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{CONTACT_INFO.address}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2 border-border">
              <CardContent className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'zh' ? '姓名' : 'Name'} *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={language === 'zh' ? '请输入您的姓名' : 'Your full name'}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'zh' ? '电话号码' : 'Phone Number'} *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={language === 'zh' ? '请输入您的电话号码' : 'Your phone number'}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'zh' ? '邮箱' : 'Email'} *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={language === 'zh' ? '请输入您的邮箱' : 'Your email address'}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Lessons (multi-select checkboxes) */}
                    <FormField
                      control={form.control}
                      name="lessons"
                      render={() => (
                        <FormItem>
                          <FormLabel>
                            {language === 'zh' ? '感兴趣的课程' : 'Lessons Interested In'}
                          </FormLabel>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {LESSON_OPTIONS.map((lesson) => (
                              <FormField
                                key={lesson.value}
                                control={form.control}
                                name="lessons"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(lesson.value)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, lesson.value]);
                                          } else {
                                            field.onChange(current.filter((v) => v !== lesson.value));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <Label className="text-sm font-normal cursor-pointer">
                                      {language === 'zh' ? lesson.labelZh : lesson.labelEn}
                                    </Label>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'zh' ? '留言（选填）' : 'Message (optional)'}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                language === 'zh'
                                  ? '请告诉我们您的学习目标、偏好时间或其他需求...'
                                  : 'Tell us about your goals, preferred schedule, or any requirements...'
                              }
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? (language === 'zh' ? '提交中...' : 'Submitting...')
                        : (language === 'zh' ? '提交咨询' : 'Submit Enquiry')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
