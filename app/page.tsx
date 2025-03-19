"use client"

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/language';
import { Globe, ArrowRight, Gamepad2 } from 'lucide-react';

// Lazy load animation-heavy components
const LazyAnimatedLetters = React.lazy(() => 
  Promise.resolve({
    default: ({ letters }: { letters: string }) => (
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: -100, 
              opacity: 0.3,
              rotate: Math.random() * 180 - 90
            }}
            animate={{ 
              y: "120vh",
              opacity: [0.3, 0.8, 0.3],
              rotate: Math.random() * 360 - 180
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className={`absolute text-4xl md:text-6xl font-bold text-blue-500/10 select-none pointer-events-none`}
          >
            {letters[Math.floor(Math.random() * letters.length)]}
          </motion.div>
        ))}
      </div>
    )
  })
);

// Loading component when animations are loading
const LoadingIndicator = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-950 to-blue-950 z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-xl">Loading LetterBlast...</p>
    </div>
  </div>
);

export default function Home() {
  const { t, language, toggleLanguage } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    
    // Stage 1: Indicate basic rendering is complete
    timeoutRef.current = setTimeout(() => {
      if (!unmountedRef.current) {
        setIsLoaded(true);
      }
    }, 200);
    
    // Stage 2: Only start animations after a short delay to prevent stuttering
    timeoutRef.current = setTimeout(() => {
      if (!unmountedRef.current) {
        setShowAnimations(true);
      }
    }, 600);
    
    return () => {
      unmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Animated letters for the hero section
  const letters = "LETTERBLAST";

  if (!isLoaded) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white overflow-hidden flex flex-col">
      {/* Language Toggle Button (Top Right) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-4 right-4 z-50"
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLanguage}
          className="bg-black/30 border-gray-700 hover:bg-black/50 hover:border-gray-600"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'en' ? 'עברית' : 'English'}
        </Button>
      </motion.div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence>
          {isLoaded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full max-w-7xl mx-auto px-6"
            >
              {/* 3D Animated Letters - Lazy loaded */}
              {showAnimations && (
                <React.Suspense fallback={null}>
                  <LazyAnimatedLetters letters={letters} />
                </React.Suspense>
              )}

              {/* Hero Content */}
              <div className="relative z-10 text-center flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="mb-6"
                >
                  <Gamepad2 className="w-16 h-16 text-blue-400 mx-auto" />
                </motion.div>
                <motion.h1 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                    LetterBlast
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="text-xl md:text-2xl max-w-2xl mb-10 text-gray-300"
                >
                  {t('hero.description')}
                </motion.p>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-8"
                >
                  <Link href="/game">
                    <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full overflow-hidden group">
                      <span className="relative z-10 flex items-center gap-2">
                        {t('hero.playNow')}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </Button>
                  </Link>
                </motion.div>

                {/* Game Instructions */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="max-w-md px-6 py-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800"
                >
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">{t('howToPlay.title')}</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">1.</span>
                      <span>{t('howToPlay.step1Desc')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">2.</span>
                      <span>{t('howToPlay.step2Desc')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      <span>{t('howToPlay.step3Desc')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">4.</span>
                      <span>{t('howToPlay.step4Desc')}</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimal Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="py-4 text-center text-gray-500 text-sm"
      >
        <p>{t('footer.rights')}</p>
      </motion.footer>
    </div>
  );
}