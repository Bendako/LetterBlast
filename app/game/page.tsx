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
    <div className="h-screen w-full overflow-hidden relative">
      {/* Main Game Canvas (Full Screen) */}
      <GameCanvas 
        letters={gameState.letters} 
        onShootLetter={shootLetter} 
      />
      
      {/* Game HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD Bar */}
        <div className="pointer-events-auto bg-black/30 backdrop-blur-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">LetterBlast</h1>
          
          <div className="flex items-center space-x-6">
            {/* Score Display */}
            <div className="bg-white/10 rounded-lg p-3 text-white">
              <div className="text-sm opacity-80">Score</div>
              <div className="text-2xl font-bold">{gameState.score}</div>
            </div>
            
            {/* Lives Display */}
            <div className="bg-white/10 rounded-lg p-3 text-white">
              <div className="text-sm opacity-80">Lives</div>
              <div className="text-2xl font-bold flex">
                {Array.from({ length: gameState.lives }).map((_, i) => (
                  <span key={i} className="text-red-500 mr-1">❤️</span>
                ))}
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="bg-white/10 rounded-lg p-3 text-white">
              <div className="text-sm opacity-80">Time</div>
              <div className="text-2xl font-bold">{Math.ceil(gameState.timeRemaining)}s</div>
            </div>
            
            {/* Controls */}
            <div className="flex gap-2 pointer-events-auto">
              <Button 
                variant={isPaused ? "default" : "outline"}
                onClick={togglePause}
                className="bg-white/20 text-white hover:bg-white/40"
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Link href="/">
                <Button variant="outline" className="bg-white/20 text-white hover:bg-white/40">
                  Exit
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Target Word Display (Center Top) */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full pointer-events-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Target: {gameState.targetWord}</h2>
          </div>
        </div>
        
        {/* Current Progress (Bottom Center) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm p-4 rounded-lg pointer-events-auto">
          <div className="flex gap-2 justify-center">
            {gameState.targetWord.split('').map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold ${
                  index < gameState.currentWord.length 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-white/20 text-white/50'
                }`}
              >
                {index < gameState.currentWord.length ? gameState.currentWord[index] : letter}
              </span>
            ))}
          </div>
        </div>
        
        {/* Difficulty Controls (Bottom Right) */}
        <div className="absolute bottom-8 right-8 bg-black/30 backdrop-blur-sm p-3 rounded-lg pointer-events-auto">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'easy' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('easy')}
              className={gameState.difficulty === 'easy' ? 'bg-green-500 hover:bg-green-600' : 'bg-white/20 text-white hover:bg-white/40'}
            >
              Easy
            </Button>
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'medium' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('medium')}
              className={gameState.difficulty === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white/20 text-white hover:bg-white/40'}
            >
              Medium
            </Button>
            <Button 
              size="sm" 
              variant={gameState.difficulty === 'hard' ? 'default' : 'outline'} 
              onClick={() => handleDifficultyChange('hard')}
              className={gameState.difficulty === 'hard' ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/40'}
            >
              Hard
            </Button>
          </div>
        </div>
        
        {/* Game Tip (Bottom Left) */}
        <div className="absolute bottom-8 left-8 bg-black/30 backdrop-blur-sm p-3 rounded-lg max-w-xs">
          <p className="text-sm text-white/80">
            <strong>Tip:</strong> Click the correct letters in order to spell &quot;{gameState.targetWord}&quot;. 
            Drag to rotate the scene. Scroll to zoom.
          </p>
        </div>
      </div>
      
      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full text-white">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="mb-6 text-xl">Your final score: <span className="font-bold text-green-400">{gameState.score}</span></p>
            
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowGameOver(false)} 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Close
              </Button>
              <Button 
                onClick={handleRestart}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Play Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}