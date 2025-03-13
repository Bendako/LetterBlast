"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/language';
import { Globe } from 'lucide-react';

// Import icons 
import { 
  Github, 
  Code2, 
  Star, 
  ArrowRight, 
  Gamepad2, 
  Layers, 
  ShieldCheck,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { t, language, toggleLanguage } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Update progress data for the development phases
  const phases = [
    { 
      name: t('progress.phase1'), 
      progress: 70, 
      tasks: [
        { name: t('progress.task.nextjs'), completed: true },
        { name: t('progress.task.tailwind'), completed: true },
        { name: t('progress.task.shadcn'), completed: true },
        { name: t('progress.task.folderStructure'), completed: true },
        { name: t('progress.task.threejs'), completed: true },
        { name: t('progress.task.stateManagement'), completed: true },
        { name: t('progress.task.letterGeneration'), completed: true },
        { name: t('progress.task.shootingMechanics'), completed: true },
        { name: t('progress.task.wordCompletion'), completed: true },
        { name: t('progress.task.difficultyLevels'), completed: true },
        { name: t('progress.task.soundEffects'), completed: false },
      ]
    },
    { 
      name: t('progress.phase2'), 
      progress: 10,
      tasks: [
        { name: t('progress.task.settingsPage'), completed: false },
        { name: t('progress.task.visualEnhancements'), completed: false },
        { name: t('progress.task.particleEffects'), completed: false },
        { name: t('progress.task.audioIntegration'), completed: false },
        { name: t('progress.task.wordSelectionApi'), completed: false },
        { name: t('progress.task.difficultySelection'), completed: true },
        { name: t('progress.task.thematicEnvironments'), completed: true },
      ]
    },
    { 
      name: t('progress.phase3'), 
      progress: 0,
      tasks: [
        { name: t('progress.task.mobileOptimization'), completed: false },
        { name: t('progress.task.performanceImprovements'), completed: false },
        { name: t('progress.task.uxEnhancements'), completed: false },
        { name: t('progress.task.additionalContent'), completed: false },
        { name: t('progress.task.achievementSystem'), completed: false },
      ]
    },
    { 
      name: t('progress.phase4'), 
      progress: 0,
      tasks: [
        { name: t('progress.task.convexSetup'), completed: false },
        { name: t('progress.task.userAccounts'), completed: false },
        { name: t('progress.task.progressTracking'), completed: false },
        { name: t('progress.task.socialFeatures'), completed: false },
        { name: t('progress.task.leaderboards'), completed: false },
      ]
    }
  ];

  // Tech stack items with icons
  const techStack = [
    { name: "Next.js", color: "bg-black" },
    { name: "React", color: "bg-blue-500" },
    { name: "TypeScript", color: "bg-blue-600" },
    { name: "Three.js", color: "bg-zinc-800" },
    { name: "Tailwind CSS", color: "bg-sky-500" },
    { name: "shadcn/ui", color: "bg-gray-800" },
    { name: "Convex", color: "bg-purple-600" },
    { name: "Framer Motion", color: "bg-pink-500" },
  ];

  // Animated letters for the hero section
  const letters = "LETTERBLAST";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white overflow-hidden">
      {/* Navbar */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              LetterBlast
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#progress" className="text-gray-300 hover:text-white transition-colors">Progress</a>
            <a href="#tech" className="text-gray-300 hover:text-white transition-colors">Tech</a>
            <Link href="https://github.com/yourusername/LetterBlast" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {/* Language Toggle Button integrated in navbar */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage}
              className="bg-black/30 border-gray-700 hover:bg-black/50 hover:border-gray-600"
            >
              <Globe className="w-4 h-4 mr-2" />
              {language === 'en' ? 'עברית' : 'English'}
            </Button>
            <Link href="/game">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Animated Letters */}
      <main className="pt-32 pb-16">
        <AnimatePresence>
          {isLoaded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="max-w-7xl mx-auto px-6 relative"
            >
              {/* 3D Animated Letters */}
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
                  An interactive 3D shooting game where players practice English by shooting letters to form words.
                </motion.p>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link href="/game">
                    <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full overflow-hidden group">
                      <span className="relative z-10 flex items-center gap-2">
                        Play Now
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

                {/* Scroll Indicator */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  transition={{ 
                    opacity: { delay: 1.5, duration: 1 },
                    y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }}
                  className="absolute bottom-[-100px] left-1/2 transform -translate-x-1/2"
                >
                  <div className="flex flex-col items-center">
                    <div className="text-gray-400 text-sm mb-2">Scroll Down</div>
                    <div className="w-[2px] h-8 bg-gradient-to-b from-blue-500 to-transparent"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Features Section (Card-based) */}
      <section id="features" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Game Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              LetterBlast combines educational value with engaging gameplay for users of all ages.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Gamepad2 />,
                title: "3D Gameplay",
                description: "Shoot floating letters in a 3D space to spell words",
                color: "blue"
              },
              {
                icon: <Layers />,
                title: "Multiple Difficulty",
                description: "Easy, Medium, and Hard modes to challenge players of all skill levels",
                color: "purple"
              },
              {
                icon: <Star />,
                title: "Educational Value",
                description: "Improve spelling and vocabulary while having fun",
                color: "pink"
              },
              {
                icon: <ShieldCheck />,
                title: "Cross-Platform",
                description: "Optimized for both desktop and mobile devices",
                color: "indigo"
              },
              {
                icon: <Settings />,
                title: "Real-time Physics",
                description: "Letters move dynamically with realistic motion and collision",
                color: "green"
              },
              {
                icon: <Sparkles />,
                title: "Instant Feedback",
                description: "Visual and audio feedback for correct letter selection",
                color: "amber"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-700 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section - Animated Grid */}
      <section id="tech" className="py-24 bg-gradient-to-b from-gray-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built with modern technologies for optimal performance and experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2 } }}
                className={`${tech.color} p-4 rounded-xl h-24 flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Progress Section */}
      <section id="progress" className="py-24 bg-blue-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Development Progress</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Track our journey in building LetterBlast from concept to completion.
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {phases.map((phase, phaseIndex) => (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: phaseIndex * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold mb-3">{phase.name}</h3>
                <div className="mb-4">
                  <Progress value={phase.progress} className="h-2" />
                  <p className="flex justify-between items-center text-sm text-gray-400 mt-2">
                    <span>Progress</span>
                    <span>{phase.progress}% Complete</span>
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  {phase.tasks.map((task, taskIndex) => (
                    <motion.div 
                      key={taskIndex}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + taskIndex * 0.05 }}
                      className="flex items-center"
                    >
                      <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${task.completed ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                      <span className={`${task.completed ? 'text-gray-200' : 'text-gray-400'} text-sm`}>
                        {task.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-b from-blue-950 to-indigo-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-10 border border-blue-500/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Playing?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Jump into LetterBlast now and start building your vocabulary while having fun!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/game">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full">
                  Play Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-950 text-gray-400 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-4 mb-6">
            <motion.a 
              href="https://github.com/yourusername/LetterBlast"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, color: "#fff" }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="#"
              whileHover={{ y: -3, color: "#fff" }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Code2 className="w-6 h-6" />
            </motion.a>
          </div>
          <p>© 2025 LetterBlast Game • All Rights Reserved</p>
          <div className="mt-4 flex justify-center space-x-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}