"use client";

import React, { useState, useEffect } from 'react';
import GameCanvas from '@/app/game/game-canvas';
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
    changeDifficulty,
    cleanupGameLoop 
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
  useEffect(() => {
    if (gameState.isGameOver && !showGameOver) {
      setShowGameOver(true);
    }
  }, [gameState.isGameOver, showGameOver]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Ensure cursor is reset when component unmounts
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  // Generate starry background for the entire game UI
  const StarryBackground = () => {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-70 z-0">
        {Array.from({ length: 100 }).map((_, index) => {
          const size = Math.random() + 0.5; // 0.5 to 1.5px
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          const animationDelay = Math.random() * 5; // 0-5s
          
          return (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-[twinkle_4s_infinite]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left,
                top,
                animationDelay: `${animationDelay}s`,
              }}
            />
          );
        })}
      </div>
    );
  };
  
  // Clear pending timeouts
  const clearPendingTimeouts = () => {
    const highestId = window.setTimeout(() => {}, 0);
    for (let i = highestId; i >= 0; i--) {
      window.clearTimeout(i);
    }
  };
  
  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* Add keyframes for star twinkling directly in the component */}
      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
      
      {/* Background stars */}
      <StarryBackground />
      
      {/* Main Game Canvas (Full Screen) */}
      <GameCanvas 
        letters={gameState.letters} 
        onShootLetter={shootLetter}
        isGameOver={gameState.isGameOver || showGameOver} // Pass the game over state
      />
      
      {/* Game HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* HUD Elements - No Navbar */}
        
        {/* Game Stats and Controls - Repositioned to top right */}
        <div className="absolute top-4 right-4 flex gap-3 flex-wrap justify-end pointer-events-auto">
          {/* Score Display */}
          <div className="bg-gray-900/70 backdrop-blur-md p-3 rounded-lg text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
            <div className="text-sm opacity-80">Score</div>
            <div className="text-2xl font-bold drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{gameState.score}</div>
          </div>
          
          {/* Lives Display */}
          <div className="bg-gray-900/70 backdrop-blur-md p-3 rounded-lg text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
            <div className="text-sm opacity-80">Lives</div>
            <div className="text-2xl font-bold flex">
              {Array.from({ length: gameState.lives }).map((_, i) => (
                <span key={i} className="text-purple-400 mr-1 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">★</span>
              ))}
            </div>
          </div>
          
          {/* Timer Display */}
          <div className="bg-gray-900/70 backdrop-blur-md p-3 rounded-lg text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
            <div className="text-sm opacity-80">Time</div>
            <div className="text-2xl font-bold drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{Math.ceil(gameState.timeRemaining)}s</div>
          </div>
        </div>

        {/* Controls - Repositioned to top left */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto">
          <button 
            onClick={togglePause}
            className={`px-4 py-2 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] ${
              isPaused 
                ? 'bg-gradient-to-r from-purple-700 to-purple-600' 
                : 'bg-gradient-to-r from-indigo-700 to-blue-600'
            }`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <Link href="/">
            <button 
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-indigo-500/30"
              onClick={() => {
                // Only clean up game-specific animations
                cleanupGameLoop();
                
                // Reset cursor style before navigation
                document.body.style.cursor = 'auto';
                
                // Clear any running timeouts
                clearPendingTimeouts();
              }}
            >
              Exit
            </button>
          </Link>
        </div>
        
        {/* Target Word Display (Center Top) */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/70 backdrop-blur-md px-6 py-3 rounded-full pointer-events-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">Target: {gameState.targetWord}</h2>
          </div>
        </div>
        
        {/* Current Progress (Bottom Center) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/70 backdrop-blur-md p-4 rounded-lg pointer-events-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
          <div className="flex gap-2 justify-center">
            {gameState.targetWord.split('').map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold ${
                  index < gameState.currentWord.length 
                    ? 'bg-indigo-600 text-white drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]' 
                    : 'bg-gray-800/70 text-white/50'
                }`}
              >
                {index < gameState.currentWord.length ? gameState.currentWord[index] : letter}
              </span>
            ))}
          </div>
        </div>
        
        {/* Difficulty Controls (Bottom Right) */}
        <div className="absolute bottom-8 right-8 bg-gray-900/70 backdrop-blur-md p-3 rounded-lg pointer-events-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleDifficultyChange('easy')}
              className={`px-3 py-1 rounded text-sm ${
                gameState.difficulty === 'easy' 
                  ? 'bg-indigo-600 text-white drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              Easy
            </button>
            <button 
              onClick={() => handleDifficultyChange('medium')}
              className={`px-3 py-1 rounded text-sm ${
                gameState.difficulty === 'medium' 
                  ? 'bg-purple-600 text-white drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              Medium
            </button>
            <button 
              onClick={() => handleDifficultyChange('hard')}
              className={`px-3 py-1 rounded text-sm ${
                gameState.difficulty === 'hard' 
                  ? 'bg-pink-600 text-white drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900/70 backdrop-blur-md p-8 rounded-xl max-w-md w-full text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
            <h2 className="text-3xl font-bold mb-4 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">Mission Complete</h2>
            <p className="mb-6 text-xl">
              Your final score: <span className="font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{gameState.score}</span>
            </p>
            
            <div className="flex justify-end space-x-4">
              <Link href="/">
                <button 
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-indigo-500/30"
                  onClick={() => {
                    // Clean up before navigation
                    cleanupGameLoop();
                    document.body.style.cursor = 'auto';
                    clearPendingTimeouts();
                  }}
                >
                  Close
                </button>
              </Link>
              <button 
                onClick={handleRestart}
                className="px-4 py-2 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-indigo-700 to-blue-600 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] hover:from-indigo-800 hover:to-blue-700"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}