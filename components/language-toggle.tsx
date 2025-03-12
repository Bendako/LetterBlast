"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/language';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
    >
      <Globe className="w-4 h-4 mr-2" />
      {language === 'en' ? 'עברית' : 'English'}
    </Button>
  );
}