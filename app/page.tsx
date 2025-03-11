"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function Home() {
  const features = [
    { name: "3D Gameplay", description: "Shoot floating letters in a 3D space to spell words" },
    { name: "Multiple Difficulty Levels", description: "Easy, Medium, and Hard modes for all skill levels" },
    { name: "Real-time Physics", description: "Letters move dynamically with realistic motion" },
    { name: "Cross-Platform Support", description: "Optimized for both desktop and mobile devices" },
    { name: "Educational Value", description: "Improve spelling and vocabulary while having fun" },
    { name: "Instant Feedback", description: "Visual and audio feedback for correct letter selection" },
  ];

  const phases = [
    { 
      name: "Phase 1: Core Functionality", 
      progress: 70, 
      tasks: [
        { name: "Initialize Next.js project", completed: true },
        { name: "Set up Tailwind CSS", completed: true },
        { name: "Set up shadcn/ui component library", completed: true },
        { name: "Create project folder structure", completed: true },
        { name: "Add Three.js integration", completed: true },
        { name: "Create basic state management", completed: true },
        { name: "Implement 3D letter generation", completed: true },
        { name: "Build shooting mechanics", completed: true },
        { name: "Create word completion logic", completed: true },
        { name: "Implement game difficulty levels", completed: true },
        { name: "Add sound effects", completed: false },
      ]
    },
    { 
      name: "Phase 2: Enhanced Experience", 
      progress: 10,
      tasks: [
        { name: "Settings page", completed: false },
        { name: "Visual enhancements", completed: false },
        { name: "Particle effects", completed: false },
        { name: "Audio integration", completed: false },
        { name: "Word selection API", completed: false },
        { name: "Difficulty selection", completed: true },
        { name: "Thematic environments", completed: true },
      ]
    },
    { 
      name: "Phase 3: Polish & Optimization", 
      progress: 0,
      tasks: [
        { name: "Mobile optimization", completed: false },
        { name: "Performance improvements", completed: false },
        { name: "UX enhancements", completed: false },
        { name: "Additional content", completed: false },
        { name: "Achievement system", completed: false },
      ]
    },
    { 
      name: "Phase 4: Backend Integration", 
      progress: 0,
      tasks: [
        { name: "Convex setup", completed: false },
        { name: "User accounts", completed: false },
        { name: "Progress tracking", completed: false },
        { name: "Social features", completed: false },
        { name: "Leaderboards", completed: false },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          LetterBlast 🎮
        </h1>
        <p className="text-xl max-w-2xl mb-8 text-gray-700 dark:text-gray-300">
          An interactive 3D shooting game where players practice English by shooting letters to form words.
        </p>
        <div className="flex gap-4">
          <Link href="/game">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Play Now
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.open('https://github.com/yourusername/LetterBlast', '_blank')}>
            GitHub Repo
          </Button>
        </div>
      </div>

      {/* Game Preview Section */}
      <div className="max-w-5xl mx-auto mb-20 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="aspect-video relative bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xl font-bold">Game Preview</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-8">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, i) => (
                <div 
                  key={i} 
                  className="w-16 h-16 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform"
                  style={{
                    backgroundColor: ['#ff9900', '#00aaff', '#ff00aa', '#00ffaa', '#aa00ff', '#ffaa00', '#00ffff', '#ff00ff'][i],
                    animation: `float ${2 + i % 3}s ease-in-out infinite alternate`
                  }}
                >
                  <span className="text-white text-3xl font-bold">{letter}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Ready to play?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click &quot;Play Now&quot; to jump into the 3D word-shooting experience! Spell words by shooting the correct letters in order.
            </p>
            <Link href="/game">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Playing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                {feature.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Development Progress Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Development Progress
        </h2>
        
        <div className="space-y-10">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{phase.name}</h3>
              <div className="mb-4">
                <Progress value={phase.progress} className="h-2" />
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{phase.progress}% Complete</p>
              </div>
              <div className="space-y-2 mt-4">
                {phase.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${task.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <span className={`${task.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
          {[
            { name: "Next.js", color: "bg-black text-white" },
            { name: "React", color: "bg-blue-500 text-white" },
            { name: "TypeScript", color: "bg-blue-600 text-white" },
            { name: "Three.js", color: "bg-black text-white" },
            { name: "Tailwind CSS", color: "bg-sky-500 text-white" },
            { name: "shadcn/ui", color: "bg-gray-800 text-white" },
            { name: "Convex", color: "bg-purple-600 text-white" },
            { name: "Radix UI", color: "bg-gray-700 text-white" }
          ].map((tech, index) => (
            <div 
              key={index} 
              className={`${tech.color} p-4 rounded-lg shadow-sm flex items-center justify-center font-medium hover:scale-105 transition-transform`}
            >
              {tech.name}
            </div>
          ))}
        </div>
      </div>

      {/* How to Play Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg my-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          How to Play
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">Target Word</h3>
                <p className="text-gray-600 dark:text-gray-300">Look at the target word at the top of the screen.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">Find Letters</h3>
                <p className="text-gray-600 dark:text-gray-300">Locate the floating letters that match your target word.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">Shoot in Order</h3>
                <p className="text-gray-600 dark:text-gray-300">Click on the letters in the correct order to spell the word.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">4</div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">Score Points</h3>
                <p className="text-gray-600 dark:text-gray-300">Complete words to score points. Harder difficulties award more points!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to improve your spelling skills?</h2>
        <p className="max-w-2xl mx-auto mb-8">
          Jump into LetterBlast now and start building your vocabulary while having fun!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/game">
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              Start Playing
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="default" 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => window.open('https://github.com/yourusername/LetterBlast', '_blank')}
          >
            Contribute
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          © {new Date().getFullYear()} LetterBlast Game • All Rights Reserved
        </p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms</a>
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy</a>
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Contact</a>
        </div>
      </footer>

      {/* Add some CSS for the floating animation */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(3deg); }
          100% { transform: translateY(-10px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}