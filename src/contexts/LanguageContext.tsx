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
    'nav.packages': 'Packages',
    'nav.rooms': 'Practice Rooms',
    'nav.sessions': 'Weekly Sessions',
    'nav.profile': 'My Profile',
    'nav.bookings': 'My Bookings',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.signup': 'Sign Up',
    
    // Home page
    'home.welcome': 'Welcome to Music Center',
    'home.subtitle': 'Your creative space for music practice and collaboration',
    'home.cta.packages': 'View Packages',
    'home.cta.rooms': 'Book a Room',
    'home.cta.sessions': 'Join Sessions',
    'home.feature.membership': 'Membership',
    'home.feature.membership.desc': 'Join as a singer or musician with flexible plans',
    'home.feature.rooms': 'Practice Rooms',
    'home.feature.rooms.desc': 'Fully equipped rooms for your practice sessions',
    'home.feature.sessions': 'Weekly Jams',
    'home.feature.sessions.desc': 'Collaborate with other musicians every week',
    
    // Packages page
    'packages.title': 'Membership Packages',
    'packages.subtitle': 'Choose the plan that fits your musical journey',
    'packages.standard': 'Standard',
    'packages.student': 'Student',
    'packages.professional': 'Professional',
    'packages.monthly': 'Monthly',
    'packages.quarterly': 'Quarterly',
    'packages.annual': 'Annual',
    'packages.perMonth': '/month',
    'packages.selectPlan': 'Select Plan',
    'packages.popular': 'Most Popular',
    'packages.features.roomBooking': 'Room booking access',
    'packages.features.sessionJoin': 'Weekly session participation',
    'packages.features.memberCard': 'Digital membership card',
    'packages.features.priority': 'Priority booking',
    'packages.features.discount': 'Equipment rental discount',
    'packages.features.guest': 'Guest passes',
    
    // Practice Rooms
    'rooms.title': 'Practice Rooms',
    'rooms.subtitle': 'Find the perfect space for your practice',
    'rooms.filter.all': 'All Rooms',
    'rooms.filter.small': 'Small',
    'rooms.filter.medium': 'Medium',
    'rooms.filter.large': 'Large',
    'rooms.equipment': 'Equipment',
    'rooms.capacity': 'Capacity',
    'rooms.bookNow': 'Book Now',
    'rooms.available': 'Available',
    'rooms.booked': 'Booked',
    
    // Sessions
    'sessions.title': 'Weekly Sessions',
    'sessions.subtitle': 'Join our collaborative music sessions',
    'sessions.upcoming': 'Upcoming Sessions',
    'sessions.register': 'Register',
    'sessions.registered': 'Registered',
    'sessions.waitlist': 'Join Waitlist',
    'sessions.full': 'Session Full',
    'sessions.spots': 'spots left',
    'sessions.theme': 'Theme',
    'sessions.roles': 'Roles Available',
    'sessions.vocal': 'Vocal',
    'sessions.guitar': 'Guitar',
    'sessions.drums': 'Drums',
    'sessions.bass': 'Bass',
    'sessions.keyboard': 'Keyboard',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.memberCard': 'Member Card',
    'profile.memberSince': 'Member since',
    'profile.validUntil': 'Valid until',
    'profile.status.active': 'Active',
    'profile.status.expiring': 'Expiring Soon',
    'profile.status.expired': 'Expired',
    'profile.instrument': 'Instrument',
    'profile.tier': 'Membership Tier',
    'profile.renew': 'Renew Membership',
    'profile.upgrade': 'Upgrade Plan',
    
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
    'auth.memberType': 'I am a...',
    'auth.singer': 'Singer',
    'auth.musician': 'Musician',
    'auth.instrument': 'Primary Instrument',
    'auth.guitar': 'Guitar',
    'auth.drums': 'Drums',
    'auth.bass': 'Bass',
    'auth.keyboard': 'Keyboard',
    'auth.multi': 'Multi-instrumentalist',
    
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
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.packages': '会员套餐',
    'nav.rooms': '练习室',
    'nav.sessions': '每周活动',
    'nav.profile': '我的资料',
    'nav.bookings': '我的预约',
    'nav.admin': '管理后台',
    'nav.login': '登录',
    'nav.logout': '退出',
    'nav.signup': '注册',
    
    // Home page
    'home.welcome': '欢迎来到音乐中心',
    'home.subtitle': '您的音乐练习与合作创意空间',
    'home.cta.packages': '查看套餐',
    'home.cta.rooms': '预约房间',
    'home.cta.sessions': '参加活动',
    'home.feature.membership': '会员服务',
    'home.feature.membership.desc': '以歌手或乐手身份加入，灵活的会员计划',
    'home.feature.rooms': '练习室',
    'home.feature.rooms.desc': '设备齐全的练习空间',
    'home.feature.sessions': '每周即兴',
    'home.feature.sessions.desc': '每周与其他音乐人合作演出',
    
    // Packages page
    'packages.title': '会员套餐',
    'packages.subtitle': '选择适合您音乐之旅的计划',
    'packages.standard': '标准版',
    'packages.student': '学生版',
    'packages.professional': '专业版',
    'packages.monthly': '月付',
    'packages.quarterly': '季付',
    'packages.annual': '年付',
    'packages.perMonth': '/月',
    'packages.selectPlan': '选择套餐',
    'packages.popular': '最受欢迎',
    'packages.features.roomBooking': '练习室预约',
    'packages.features.sessionJoin': '每周活动参与',
    'packages.features.memberCard': '电子会员卡',
    'packages.features.priority': '优先预约',
    'packages.features.discount': '设备租赁折扣',
    'packages.features.guest': '访客通行证',
    
    // Practice Rooms
    'rooms.title': '练习室',
    'rooms.subtitle': '找到适合您练习的完美空间',
    'rooms.filter.all': '全部房间',
    'rooms.filter.small': '小型',
    'rooms.filter.medium': '中型',
    'rooms.filter.large': '大型',
    'rooms.equipment': '设备',
    'rooms.capacity': '容量',
    'rooms.bookNow': '立即预约',
    'rooms.available': '可预约',
    'rooms.booked': '已预约',
    
    // Sessions
    'sessions.title': '每周活动',
    'sessions.subtitle': '加入我们的音乐合作活动',
    'sessions.upcoming': '即将举行的活动',
    'sessions.register': '报名',
    'sessions.registered': '已报名',
    'sessions.waitlist': '加入候补',
    'sessions.full': '名额已满',
    'sessions.spots': '个名额剩余',
    'sessions.theme': '主题',
    'sessions.roles': '可选角色',
    'sessions.vocal': '主唱',
    'sessions.guitar': '吉他',
    'sessions.drums': '鼓',
    'sessions.bass': '贝斯',
    'sessions.keyboard': '键盘',
    
    // Profile
    'profile.title': '我的资料',
    'profile.memberCard': '会员卡',
    'profile.memberSince': '加入时间',
    'profile.validUntil': '有效期至',
    'profile.status.active': '有效',
    'profile.status.expiring': '即将到期',
    'profile.status.expired': '已过期',
    'profile.instrument': '乐器',
    'profile.tier': '会员等级',
    'profile.renew': '续费会员',
    'profile.upgrade': '升级套餐',
    
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
    'auth.memberType': '我是...',
    'auth.singer': '歌手',
    'auth.musician': '乐手',
    'auth.instrument': '主要乐器',
    'auth.guitar': '吉他',
    'auth.drums': '鼓',
    'auth.bass': '贝斯',
    'auth.keyboard': '键盘',
    'auth.multi': '多乐器演奏者',
    
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
