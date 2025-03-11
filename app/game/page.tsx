"use client";

import React, { useState } from 'react';
import GameCanvas from '@/app/game/game-canvas';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGameState } from '@/hooks/use-game-state';
import { GameDifficulty } from '@/lib/game-engine';

export default function GamePage() {
  const { 
    gameState, 
    isPaused, 
    shootLetter, 
    restartGame, 
    togglePause, 
    changeDifficulty 
  } = useGameState('easy');
  
  // Game over modal visibility
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Handle restart button
  const handleRestart = () => {
    restartGame();
    setShowGameOver(false);
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (difficulty: GameDifficulty) => {
    changeDifficulty(difficulty);
  };
  
  // Show game over modal if game is over
  if (gameState.isGameOver && !showGameOver) {
    setShowGameOver(true);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">LetterBlast Game</h1>
        <div className="flex gap-2">
          <Button 
            variant={isPaused ? "default" : "outline"}
            onClick={togglePause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Link href="/">
            <Button variant="outline">Exit Game</Button>
          </Link>
        </div>
      </div>
      
      {/* Game Information Bar */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
          <div className="text-2xl font-bold">{gameState.score}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Lives</div>
          <div className="text-2xl font-bold flex">
            {Array.from({ length: gameState.lives }).map((_, i) => (
              <span key={i} className="text-red-500 mr-1">❤️</span>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
          <div className="text-2xl font-bold">{Math.ceil(gameState.timeRemaining)}s</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
          <div className="text-2xl font-bold capitalize">{gameState.difficulty}</div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Target: {gameState.targetWord}</h2>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'easy' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('easy')}
            >
              Easy
            </Button>
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'medium' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('medium')}
            >
              Medium
            </Button>
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'hard' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('hard')}
            >
              Hard
            </Button>
          </div>
        </div>
        
        {/* Game canvas component */}
        <GameCanvas 
          letters={gameState.letters} 
          onShootLetter={shootLetter} 
        />
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Click the correct letters in order to spell &quot;{gameState.targetWord}&quot;. 
            Click and drag to rotate the scene. Scroll to zoom in and out.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Click on letters to select them (in the correct order)</li>
            <li>Drag to rotate the view</li>
            <li>Scroll to zoom in and out</li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Current Progress</h2>
          <div className="flex gap-2 text-2xl font-bold">
            {gameState.targetWord.split('').map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block w-10 h-10 flex items-center justify-center rounded-md ${
                  index < gameState.currentWord.length 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                    : 'bg-blue-100 dark:bg-blue-900 text-gray-400 dark:text-gray-600'
                }`}
              >
                {index < gameState.currentWord.length ? gameState.currentWord[index] : '_'}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="mb-6 text-lg">Your final score: <span className="font-bold">{gameState.score}</span></p>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowGameOver(false)}>
                Close
              </Button>
              <Button onClick={handleRestart}>
                Play Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}