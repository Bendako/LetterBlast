"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const features = [
    { name: "3D Gameplay", description: "Shoot floating letters in a 3D space to spell words" },
    { name: "Multiple Difficulty Levels", description: "Easy, Medium, and Hard modes for all skill levels" },
    { name: "Custom Environments", description: "Thematic backgrounds matching word categories" },
    { name: "Cross-Platform Support", description: "Optimized for both desktop and mobile devices" },
    { name: "Educational Value", description: "Improve spelling and vocabulary while having fun" },
  ];

  const phases = [
    { 
      name: "Phase 1: Core Functionality", 
      progress: 20, 
      tasks: [
        { name: "Initialize Next.js project", completed: true },
        { name: "Set up Tailwind CSS", completed: true },
        { name: "Set up shadcn/ui component library", completed: true },
        { name: "Create project folder structure", completed: true },
        { name: "Add Three.js integration", completed: false },
        { name: "Create basic state management", completed: false },
        { name: "Implement game mechanics", completed: false },
      ]
    },
    { 
      name: "Phase 2: Enhanced Experience", 
      progress: 0,
      tasks: [
        { name: "Settings page", completed: false },
        { name: "Visual enhancements", completed: false },
        { name: "Audio integration", completed: false },
        { name: "Word selection API", completed: false },
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
          <Button disabled className="bg-blue-600 hover:bg-blue-700">
            Play Game (Coming Soon)
          </Button>
          <Button variant="outline" onClick={() => window.open('https://github.com/Bendako/LetterBlast', '_blank')}>
            GitHub Repo
          </Button>
        </div>
      </div>

      {/* Development Progress Section - Moved higher */}
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
              className={`${tech.color} p-4 rounded-lg shadow-sm flex items-center justify-center font-medium`}
            >
              {tech.name}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Want to help build LetterBlast?</h2>
        <p className="max-w-2xl mx-auto mb-8">
          We&apos;re looking for contributors to help bring this educational game to life!
        </p>
        <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
          Join the Team
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} LetterBlast Game • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}