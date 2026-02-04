import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.questions': 'Questions',
    'nav.exams': 'Exams',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.toggle': 'Toggle Theme',
    
    // Levels & Navigation
    'levels.title': 'Levels',
    'levels.select': 'Select a Level',
    'subjects.title': 'Subjects',
    'chapters.title': 'Chapters',
    'lessons.title': 'Lessons',
    'lesson': 'Lesson',
    
    // Questions
    'questions.title': 'Questions',
    'questions.noResults': 'No questions found',
    'questions.filter': 'Filter',
    'questions.difficulty': 'Difficulty',
    'questions.type': 'Type',
    'questions.tags': 'Tags',
    'questions.search': 'Search questions...',
    'questions.details': 'View Details',
    'questions.takeQuestion': 'Take Question',
    'questions.addToExam': 'Add to Exam',
    'questions.seeAnswer': 'See Answer',
    'questions.hideAnswer': 'Hide Answer',
    'questions.points': 'Points',
    'questions.time': 'Time',
    'questions.minutes': 'min',
    'questions.correct': 'Correct Answer',
    'questions.explanation': 'Explanation',
    'questions.options': 'Options',
    'questions.miniQuestions': 'Sub-Questions',
    
    // Difficulty
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.hard': 'Hard',
    
    // Types
    'type.mcq': 'Multiple Choice',
    'type.essay': 'Essay',
    'type.passage': 'Passage',
    'type.short_answer': 'Short Answer',
    'type.true_false': 'True/False',
    
    // Exams
    'exams.title': 'Exams',
    'exams.create': 'Create Exam',
    'exams.selected': 'Selected Questions',
    'exams.clear': 'Clear Selection',
    'exams.examTitle': 'Exam Title',
    'exams.instructions': 'Instructions',
    'exams.duration': 'Duration (minutes)',
    'exams.startTime': 'Start Time',
    'exams.deadline': 'Deadline',
    'exams.class': 'Class',
    'exams.preventCheating': 'Prevent Cheating',
    'exams.allowedAttempts': 'Allowed Attempts',
    'exams.randomizeQuestions': 'Randomize Questions',
    'exams.autoGradeRelease': 'Auto Release Grades',
    'exams.submit': 'Create Exam',
    'exams.cancel': 'Cancel',
    
    // Auth
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.loginBtn': 'Login',
    'auth.welcome': 'Welcome',
    'auth.pleaseLogin': 'Please login to continue',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.page': 'Page',
    'common.of': 'of',
    'common.noData': 'No data available',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.questions': 'الأسئلة',
    'nav.exams': 'الاختبارات',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',
    
    // Theme
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    'theme.toggle': 'تغيير السمة',
    
    // Levels & Navigation
    'levels.title': 'المستويات',
    'levels.select': 'اختر مستوى',
    'subjects.title': 'المواد',
    'chapters.title': 'الفصول',
    'lessons.title': 'الدروس',
    'lesson': 'درس',
    
    // Questions
    'questions.title': 'الأسئلة',
    'questions.noResults': 'لم يتم العثور على أسئلة',
    'questions.filter': 'تصفية',
    'questions.difficulty': 'الصعوبة',
    'questions.type': 'النوع',
    'questions.tags': 'الوسوم',
    'questions.search': 'ابحث في الأسئلة...',
    'questions.details': 'عرض التفاصيل',
    'questions.takeQuestion': 'حل السؤال',
    'questions.addToExam': 'أضف للاختبار',
    'questions.seeAnswer': 'عرض الإجابة',
    'questions.hideAnswer': 'إخفاء الإجابة',
    'questions.points': 'النقاط',
    'questions.time': 'الوقت',
    'questions.minutes': 'دقيقة',
    'questions.correct': 'الإجابة الصحيحة',
    'questions.explanation': 'الشرح',
    'questions.options': 'الخيارات',
    'questions.miniQuestions': 'الأسئلة الفرعية',
    
    // Difficulty
    'difficulty.easy': 'سهل',
    'difficulty.medium': 'متوسط',
    'difficulty.hard': 'صعب',
    
    // Types
    'type.mcq': 'اختيار متعدد',
    'type.essay': 'مقالي',
    'type.passage': 'نص قرائي',
    'type.short_answer': 'إجابة قصيرة',
    'type.true_false': 'صح/خطأ',
    
    // Exams
    'exams.title': 'الاختبارات',
    'exams.create': 'إنشاء اختبار',
    'exams.selected': 'الأسئلة المختارة',
    'exams.clear': 'مسح الاختيار',
    'exams.examTitle': 'عنوان الاختبار',
    'exams.instructions': 'التعليمات',
    'exams.duration': 'المدة (بالدقائق)',
    'exams.startTime': 'وقت البدء',
    'exams.deadline': 'الموعد النهائي',
    'exams.class': 'الفصل',
    'exams.preventCheating': 'منع الغش',
    'exams.allowedAttempts': 'المحاولات المسموحة',
    'exams.randomizeQuestions': 'ترتيب عشوائي',
    'exams.autoGradeRelease': 'نشر الدرجات تلقائياً',
    'exams.submit': 'إنشاء الاختبار',
    'exams.cancel': 'إلغاء',
    
    // Auth
    'auth.username': 'اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.loginBtn': 'دخول',
    'auth.welcome': 'مرحباً',
    'auth.pleaseLogin': 'يرجى تسجيل الدخول للمتابعة',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.retry': 'إعادة المحاولة',
    'common.close': 'إغلاق',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.page': 'صفحة',
    'common.of': 'من',
    'common.noData': 'لا توجد بيانات',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
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
