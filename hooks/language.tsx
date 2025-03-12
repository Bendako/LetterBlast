"use client"

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

type Language = 'en' | 'he';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (key: string) => string;
};

// Create translations object
const translations = {
  en: {
    // Hero Section
    'hero.title': 'LetterBlast 🎮',
    'hero.description': 'An interactive 3D shooting game where players practice English by shooting letters to form words.',
    'hero.playNow': 'Play Now',
    'hero.githubRepo': 'GitHub Repo',
    
    // Game Preview Section
    'preview.gamePreview': 'Game Preview',
    'preview.readyToPlay': 'Ready to play?',
    'preview.readyDescription': 'Click "Play Now" to jump into the 3D word-shooting experience! Spell words by shooting the correct letters in order.',
    'preview.startPlaying': 'Start Playing',
    
    // Features Section
    'features.title': 'Key Features',
    'feature.3dGameplay': '3D Gameplay',
    'feature.3dGameplayDesc': 'Shoot floating letters in a 3D space to spell words',
    'feature.difficultyLevels': 'Multiple Difficulty Levels',
    'feature.difficultyLevelsDesc': 'Easy, Medium, and Hard modes for all skill levels',
    'feature.physics': 'Real-time Physics',
    'feature.physicsDesc': 'Letters move dynamically with realistic motion',
    'feature.crossPlatform': 'Cross-Platform Support',
    'feature.crossPlatformDesc': 'Optimized for both desktop and mobile devices',
    'feature.educational': 'Educational Value',
    'feature.educationalDesc': 'Improve spelling and vocabulary while having fun',
    'feature.feedback': 'Instant Feedback',
    'feature.feedbackDesc': 'Visual and audio feedback for correct letter selection',
    
    // Development Progress Section
    'progress.title': 'Development Progress',
    'progress.complete': 'Complete',
    
    // Tech Stack Section
    'techStack.title': 'Tech Stack',
    
    // How to Play
    'howToPlay.title': 'How to Play',
    'howToPlay.step1': 'Target Word',
    'howToPlay.step1Desc': 'Look at the target word at the top of the screen.',
    'howToPlay.step2': 'Find Letters',
    'howToPlay.step2Desc': 'Locate the floating letters that match your target word.',
    'howToPlay.step3': 'Shoot in Order',
    'howToPlay.step3Desc': 'Click on the letters in the correct order to spell the word.',
    'howToPlay.step4': 'Score Points',
    'howToPlay.step4Desc': 'Complete words to score points. Harder difficulties award more points!',
    
    // Call to Action
    'cta.title': 'Ready to improve your spelling skills?',
    'cta.description': 'Jump into LetterBlast now and start building your vocabulary while having fun!',
    'cta.startPlaying': 'Start Playing',
    'cta.contribute': 'Contribute',
    
    // Footer
    'footer.rights': '© 2025 LetterBlast Game • All Rights Reserved',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.contact': 'Contact',
  },
  he: {
    // Hero Section
    'hero.title': 'מתקפת אותיות 🎮',
    'hero.description': 'משחק יריות תלת-ממדי אינטראקטיבי שבו שחקנים מתרגלים אנגלית על ידי ירי באותיות כדי ליצור מילים.',
    'hero.playNow': 'שחק עכשיו',
    'hero.githubRepo': 'מאגר GitHub',
    
    // Game Preview Section
    'preview.gamePreview': 'תצוגה מקדימה של המשחק',
    'preview.readyToPlay': 'מוכן לשחק?',
    'preview.readyDescription': 'לחץ על "שחק עכשיו" כדי לקפוץ לחוויית ירי המילים התלת-ממדית! איית מילים על ידי ירי באותיות הנכונות בסדר.',
    'preview.startPlaying': 'התחל לשחק',
    
    // Features Section
    'features.title': 'תכונות מרכזיות',
    'feature.3dGameplay': 'משחק תלת-ממדי',
    'feature.3dGameplayDesc': 'ירי באותיות צפות במרחב תלת-ממדי כדי לאיית מילים',
    'feature.difficultyLevels': 'רמות קושי מרובות',
    'feature.difficultyLevelsDesc': 'מצבים קלים, בינוניים וקשים לכל רמות המיומנות',
    'feature.physics': 'פיזיקה בזמן אמת',
    'feature.physicsDesc': 'אותיות נעות באופן דינמי עם תנועה ריאליסטית',
    'feature.crossPlatform': 'תמיכה בפלטפורמות מרובות',
    'feature.crossPlatformDesc': 'אופטימיזציה למחשבים שולחניים וניידים',
    'feature.educational': 'ערך חינוכי',
    'feature.educationalDesc': 'שפר את האיות ואוצר המילים שלך תוך כדי הנאה',
    'feature.feedback': 'משוב מיידי',
    'feature.feedbackDesc': 'משוב חזותי וקולי לבחירת אותיות נכונה',
    
    // Development Progress Section
    'progress.title': 'התקדמות פיתוח',
    'progress.complete': 'הושלם',
    
    // Tech Stack Section
    'techStack.title': 'מחסנית טכנולוגיה',
    
    // How to Play
    'howToPlay.title': 'איך לשחק',
    'howToPlay.step1': 'מילת יעד',
    'howToPlay.step1Desc': 'הסתכל על מילת היעד בחלק העליון של המסך.',
    'howToPlay.step2': 'מצא אותיות',
    'howToPlay.step2Desc': 'אתר את האותיות הצפות שמתאימות למילת היעד שלך.',
    'howToPlay.step3': 'ירי בסדר',
    'howToPlay.step3Desc': 'לחץ על האותיות בסדר הנכון כדי לאיית את המילה.',
    'howToPlay.step4': 'צבור נקודות',
    'howToPlay.step4Desc': 'השלם מילים כדי לצבור נקודות. רמות קושי גבוהות יותר מעניקות יותר נקודות!',
    
    // Call to Action
    'cta.title': 'מוכן לשפר את מיומנויות האיות שלך?',
    'cta.description': 'קפוץ למתקפת אותיות עכשיו והתחל לבנות את אוצר המילים שלך תוך כדי הנאה!',
    'cta.startPlaying': 'התחל לשחק',
    'cta.contribute': 'תרום',
    
    // Footer
    'footer.rights': '© 2025 משחק מתקפת אותיות • כל הזכויות שמורות',
    'footer.terms': 'תנאים',
    'footer.privacy': 'פרטיות',
    'footer.contact': 'צור קשר',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  isRTL: false,
  t: () => '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'he';
  const pathname = usePathname();
  
  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };
  
  // Only apply RTL direction on the homepage, not the game page
  useEffect(() => {
    // Check if we're on the game page or any other page that should be LTR only
    const isGamePage = pathname === '/game' || pathname.startsWith('/game/');
    
    // Only apply RTL if we're not on the game page and the language is Hebrew
    document.documentElement.dir = (!isGamePage && isRTL) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL, pathname]);
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);