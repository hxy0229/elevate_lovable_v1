import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.packages': 'Membership',
    'nav.rooms': 'Practice Room',
    'nav.sessions': 'Weekly Sessions',
    'nav.lessons': 'Lessons',
    'nav.profile': 'My Profile',
    'nav.bookings': 'My Bookings',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.signup': 'Sign Up',
    
    // Home page
    'home.welcome': 'Elevate Music Studio',
    'home.subtitle': 'A creative space dedicated to nurturing musical talent through professional instruction in piano, singing, and vocal performance',
    'home.cta.packages': 'View Membership',
    'home.cta.rooms': 'Book Practice Room',
    'home.cta.sessions': 'Join Sessions',
    'home.feature.membership': 'Membership',
    'home.feature.membership.desc': 'Join as a singer, musician, or both with flexible session-based packages',
    'home.feature.rooms': 'Practice Room',
    'home.feature.rooms.desc': 'Fully equipped practice space available for booking',
    'home.feature.sessions': 'Weekly Sessions',
    'home.feature.sessions.desc': 'Solo vocal practice and band rehearsals every week',
    'home.feature.lessons': 'Lessons & Programs',
    'home.feature.lessons.desc': 'Vocal, piano, orchestral, guitar, ukulele, drums and exam preparation',
    
    // Packages page
    'packages.title': 'Membership Packages',
    'packages.subtitle': 'Choose the package that fits your musical journey',
    'packages.singer': 'Singer Package',
    'packages.musician': 'Musician Package',
    'packages.sessions': '8 Sessions',
    'packages.selectPlan': 'Select Package',
    'packages.popular': 'Popular',
    'packages.singer.desc': 'For vocalists who want to develop their singing skills',
    'packages.musician.desc': 'For instrumentalists looking to jam and improve',
    'packages.features.sessions': '8 weekly sessions included',
    'packages.features.vocal': 'Solo vocal practice access',
    'packages.features.band': 'Band rehearsal participation',
    'packages.features.memberCard': 'Digital membership card',
    'packages.features.roomDiscount': 'Practice room booking discount',
    'packages.features.community': 'Community access',
    'packages.note': 'Members can be both singers and musicians. Choose your role for each session!',
    
    // Practice Room
    'rooms.title': 'Practice Room',
    'rooms.subtitle': 'Book our fully equipped practice space',
    'rooms.equipment': 'Equipment Available',
    'rooms.capacity': 'max capacity',
    'rooms.bookNow': 'Book This Slot',
    'rooms.available': 'Available',
    'rooms.booked': 'Booked',
    'rooms.selectDate': 'Select Date',
    'rooms.timeSlots': 'Available Time Slots',
    'rooms.noSlots': 'No available slots for this date',
    'rooms.roomName': 'Main Practice Room',
    'rooms.roomDesc': 'Professional practice space with full band equipment',
    
    // Sessions
    'sessions.title': 'Weekly Sessions',
    'sessions.subtitle': 'Join our regular practice and rehearsal sessions',
    'sessions.tuesday': 'Tuesday',
    'sessions.thursday': 'Thursday',
    'sessions.soloVocal': 'Solo Vocal Practice',
    'sessions.bandSession': 'Band Rehearsal',
    'sessions.register': 'Register',
    'sessions.registered': 'Registered',
    'sessions.waitlist': 'Join Waitlist',
    'sessions.full': 'Session Full',
    'sessions.spots': 'spots left',
    'sessions.roles': 'Register as',
    'sessions.vocal': 'Vocal',
    'sessions.guitar': 'Guitar',
    'sessions.drums': 'Drums',
    'sessions.bass': 'Bass',
    'sessions.keyboard': 'Keyboard',
    'sessions.both': 'Both',
    'sessions.chooseRole': 'Choose your role for this session',
    
    // Lessons
    'lessons.title': 'Lessons & Programs',
    'lessons.subtitle': 'Professional instruction across vocal, instrumental, and performance programs',
    'lessons.vocal': 'Vocal Training',
    'lessons.piano': 'Piano',
    'lessons.guitar': 'Guitar & Ukulele',
    'lessons.drums': 'Drums',
    'lessons.bass': 'Orchestral & Folk Instruments',
    'lessons.inquire': 'Inquire Now',
    'lessons.priceNote': 'Pricing based on student level assessment',
    'lessons.contactUs': 'Contact us for pricing',
    'lessons.description': 'We offer vocal (solo, duet, choir), instrumental (piano, orchestral, folk, guitar, ukulele, drums), and programs including band performances, original music, grading exams, concerts, competitions, musical theatre, and personal IP branding.',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.memberCard': 'Member Card',
    'profile.memberSince': 'Member since',
    'profile.validUntil': 'Valid until',
    'profile.status.active': 'Active',
    'profile.status.expiring': 'Expiring Soon',
    'profile.status.expired': 'Expired',
    'profile.roles': 'Roles',
    'profile.tier': 'Package',
    'profile.renew': 'Renew Membership',
    'profile.upgrade': 'Upgrade Package',
    
    // Bookings
    'bookings.title': 'My Bookings',
    'bookings.upcoming': 'Upcoming Bookings',
    'bookings.past': 'Past Bookings',
    'bookings.cancel': 'Cancel',
    'bookings.reschedule': 'Reschedule',
    'bookings.noBookings': 'No bookings yet',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.roles': 'I want to join as...',
    'auth.singer': 'Singer',
    'auth.musician': 'Musician',
    'auth.both': 'Both Singer & Musician',
    'auth.instruments': 'Instruments I play',
    'auth.guitar': 'Guitar',
    'auth.drums': 'Drums',
    'auth.bass': 'Bass',
    'auth.keyboard': 'Keyboard',
    'auth.selectMultiple': 'Select all that apply',
    'auth.roleNote': 'You can choose your role for each session',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.language': 'Language',
    'common.english': 'English',
    'common.chinese': '中文',
    
    // Sections
    'home.whatWeOffer': 'What We Offer',

    // Footer
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact Us',
    'footer.about': 'About Us',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.packages': '会员配套',
    'nav.rooms': '练习室',
    'nav.sessions': '每周活动',
    'nav.lessons': '课程',
    'nav.profile': '我的资料',
    'nav.bookings': '我的预约',
    'nav.admin': '管理后台',
    'nav.login': '登录',
    'nav.logout': '退出',
    'nav.signup': '注册',
    
    // Home page
    'home.welcome': '星月之音文化俱乐部',
    'home.subtitle': '致力于通过钢琴、声乐等专业教学培养音乐人才的创意空间',
    'home.cta.packages': '查看会员配套',
    'home.cta.rooms': '预约练习室',
    'home.cta.sessions': '参加活动',
    'home.feature.membership': '会员配套',
    'home.feature.membership.desc': '以歌手、乐手或两者身份加入，灵活的按次配套',
    'home.feature.rooms': '练习室',
    'home.feature.rooms.desc': '设备齐全的练习空间可供预约',
    'home.feature.sessions': '每周活动',
    'home.feature.sessions.desc': '每周独唱练习和乐队排练',
    'home.feature.lessons': '课程与项目',
    'home.feature.lessons.desc': '声乐、钢琴、管弦乐、民乐、吉他、尤克里里、架子鼓及考级培训',
    
    // Packages page
    'packages.title': '会员配套',
    'packages.subtitle': '选择适合您音乐之旅的配套',
    'packages.singer': '歌手配套',
    'packages.musician': '乐手配套',
    'packages.sessions': '8次活动',
    'packages.selectPlan': '选择配套',
    'packages.popular': '热门',
    'packages.singer.desc': '适合想要提升歌唱技巧的歌手',
    'packages.musician.desc': '适合想要合奏和进步的乐手',
    'packages.features.sessions': '包含8次每周活动',
    'packages.features.vocal': '独唱练习权限',
    'packages.features.band': '乐队排练参与',
    'packages.features.memberCard': '电子会员卡',
    'packages.features.roomDiscount': '练习室预约折扣',
    'packages.features.community': '社群权限',
    'packages.note': '会员可以同时是歌手和乐手。每次活动可选择您的角色！',
    
    // Practice Room
    'rooms.title': '练习室',
    'rooms.subtitle': '预约我们设备齐全的练习空间',
    'rooms.equipment': '可用设备',
    'rooms.capacity': '最大容量',
    'rooms.bookNow': '预约此时段',
    'rooms.available': '可预约',
    'rooms.booked': '已预约',
    'rooms.selectDate': '选择日期',
    'rooms.timeSlots': '可用时段',
    'rooms.noSlots': '该日期无可用时段',
    'rooms.roomName': '主练习室',
    'rooms.roomDesc': '配备全套乐队设备的专业练习空间',
    
    // Sessions
    'sessions.title': '每周活动',
    'sessions.subtitle': '加入我们的常规练习和排练活动',
    'sessions.tuesday': '周二',
    'sessions.thursday': '周四',
    'sessions.soloVocal': '独唱练习',
    'sessions.bandSession': '乐队排练',
    'sessions.register': '报名',
    'sessions.registered': '已报名',
    'sessions.waitlist': '加入候补',
    'sessions.full': '名额已满',
    'sessions.spots': '个名额剩余',
    'sessions.roles': '报名身份',
    'sessions.vocal': '主唱',
    'sessions.guitar': '吉他',
    'sessions.drums': '鼓',
    'sessions.bass': '贝斯',
    'sessions.keyboard': '键盘',
    'sessions.both': '两者皆可',
    'sessions.chooseRole': '选择您在此活动中的角色',
    
    // Lessons
    'lessons.title': '课程与项目',
    'lessons.subtitle': '涵盖声乐、器乐及表演项目的专业教学',
    'lessons.vocal': '声乐培训',
    'lessons.piano': '钢琴',
    'lessons.guitar': '吉他 & 尤克里里',
    'lessons.drums': '架子鼓',
    'lessons.bass': '管弦乐 & 民乐',
    'lessons.inquire': '立即咨询',
    'lessons.priceNote': '价格根据学生水平评估确定',
    'lessons.contactUs': '联系我们了解价格',
    'lessons.description': '声乐：独唱、对唱、合唱 | 器乐：钢琴、管弦乐、民乐、吉他、尤克里里、架子鼓 | 活动：乐队演出、素人原创音乐、儿童/成人考级、音乐会、比赛、音乐舞台短剧、个人IP打造',
    
    // Profile
    'profile.title': '我的资料',
    'profile.memberCard': '会员卡',
    'profile.memberSince': '加入时间',
    'profile.validUntil': '有效期至',
    'profile.status.active': '有效',
    'profile.status.expiring': '即将到期',
    'profile.status.expired': '已过期',
    'profile.roles': '身份',
    'profile.tier': '配套',
    'profile.renew': '续费会员',
    'profile.upgrade': '升级配套',
    
    // Bookings
    'bookings.title': '我的预约',
    'bookings.upcoming': '即将到来',
    'bookings.past': '历史记录',
    'bookings.cancel': '取消',
    'bookings.reschedule': '改期',
    'bookings.noBookings': '暂无预约',
    
    // Auth
    'auth.login': '登录',
    'auth.signup': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.forgotPassword': '忘记密码？',
    'auth.noAccount': '还没有账号？',
    'auth.hasAccount': '已有账号？',
    'auth.roles': '我想加入为...',
    'auth.singer': '歌手',
    'auth.musician': '乐手',
    'auth.both': '歌手和乐手',
    'auth.instruments': '我会演奏的乐器',
    'auth.guitar': '吉他',
    'auth.drums': '鼓',
    'auth.bass': '贝斯',
    'auth.keyboard': '键盘',
    'auth.selectMultiple': '选择所有适用项',
    'auth.roleNote': '每次活动您可以选择您的角色',
    
    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.next': '下一步',
    'common.submit': '提交',
    'common.language': '语言',
    'common.english': 'English',
    'common.chinese': '中文',
    
    // Sections
    'home.whatWeOffer': '我们的服务',

    // Footer
    'footer.rights': '版权所有',
    'footer.contact': '联系我们',
    'footer.about': '关于我们',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('musiccenter-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('musiccenter-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
