"use client";

import React, { useState, useEffect } from 'react';
import GameCanvas from '@/app/game/game-canvas';
import Link from 'next/link';
import { useGameState } from '@/hooks/use-game-state';
import { GameDifficulty } from '@/lib/game-engine';
import { Volume2, VolumeX, Home, Pause, Play } from 'lucide-react';

export default function GamePage() {
  const { 
    gameState, 
    isPaused, 
    isMuted,
    shootLetter, 
    restartGame, 
    togglePause, 
    toggleMute,
    changeDifficulty,
    cleanupGameLoop 
  } = useGameState('easy');
  
  // Game over modal visibility
  const [showGameOver, setShowGameOver] = useState(false);

  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
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
  
  // Detect device and orientation
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768 || 
                     'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0;
      const portrait = window.innerHeight > window.innerWidth;
      const smallScreen = window.innerHeight < 700;
      
      setIsMobile(mobile);
      setIsPortrait(portrait);
      setIsSmallScreen(smallScreen);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
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
  
  // Get bottom position for current word progress - adjusted for better spacing
  const getProgressBottomPosition = () => {
    if (isMobile && isPortrait) {
      return isSmallScreen ? "bottom-32" : "bottom-28"; // Increased from bottom-20
    }
    return "bottom-16"; // Increased from bottom-8 for better spacing
  };
  
  // Get position for difficulty buttons - adjusted to avoid overlap
  const getDifficultyPosition = () => {
    if (isMobile && isPortrait) {
      // Center align at bottom with more space
      return "bottom-6 left-0 right-0 mx-auto w-fit"; // Increased from bottom-4
    }
    // For landscape and desktop, keep on bottom right with more space
    return "bottom-4 right-4 md:right-8"; // Adjusted spacing
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
        isGameOver={gameState.isGameOver || showGameOver}
        isMuted={isMuted}
      />
      
      {/* Game HUD Overlay with improved mobile responsiveness */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top HUD Row - Responsive layout for all device sizes */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2 md:p-4 z-30">
          {/* Controls - Left side */}
          <div className="flex gap-1 md:gap-2 pointer-events-auto">
            <button 
              onClick={togglePause}
              className="p-2 md:px-4 md:py-2 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] bg-black/50 backdrop-blur-sm md:text-base text-sm flex items-center gap-1 md:gap-2 border border-indigo-500/30"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4 md:w-5 md:h-5" /> : <Pause className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
            </button>
            
            {/* Sound toggle button */}
            <button 
              onClick={toggleMute}
              className="p-2 md:px-4 md:py-2 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] bg-black/50 backdrop-blur-sm flex items-center border border-indigo-500/30"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            
            {/* Home button */}
            <Link href="/">
              <button 
                className="p-2 md:px-4 md:py-2 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] bg-black/50 backdrop-blur-sm flex items-center border border-indigo-500/30"
                onClick={() => {
                  cleanupGameLoop();
                  document.body.style.cursor = 'auto';
                  clearPendingTimeouts();
                }}
                aria-label="Exit to Home"
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline ml-1">Exit</span>
              </button>
            </Link>
          </div>
          
          {/* Game Stats - Right side with dynamic sizing */}
          <div className="flex gap-1 md:gap-3 flex-wrap justify-end pointer-events-auto">
            {/* Score Display */}
            <div className="bg-black/50 backdrop-blur-sm p-2 md:p-3 rounded-lg text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
              <div className="text-xs md:text-sm opacity-80">Score</div>
              <div className="text-lg md:text-2xl font-bold drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{gameState.score}</div>
            </div>
            
            {/* Lives Display */}
            <div className="bg-black/50 backdrop-blur-sm p-2 md:p-3 rounded-lg text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
              <div className="text-xs md:text-sm opacity-80">Lives</div>
              <div className="text-lg md:text-2xl font-bold flex">
                {Array.from({ length: gameState.difficulty === 'easy' ? 5 : gameState.difficulty === 'medium' ? 4 : 3 }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`mr-0.5 md:mr-1 ${
                      i < gameState.lives 
                        ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]' 
                        : 'text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="bg-black/50 backdrop-blur-sm p-2 md:p-3 rounded-lg text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
              <div className="text-xs md:text-sm opacity-80">Time</div>
              <div className="text-lg md:text-2xl font-bold drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{Math.ceil(gameState.timeRemaining)}s</div>
            </div>
          </div>
        </div>
        
        {/* Current Progress (Bottom Center) - Adaptive positioning with more space */}
        <div className={`absolute left-0 right-0 mx-auto w-auto max-w-md bg-black/60 backdrop-blur-md p-2 md:p-4 rounded-lg pointer-events-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)] z-30 ${getProgressBottomPosition()}`}>
          <div className="flex gap-1 md:gap-2 justify-center items-center">
            {gameState.targetWord.split('').map((letter, index) => (
              <span 
                key={index} 
                className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-md text-base md:text-xl font-bold ${
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
        
        {/* Difficulty Controls - Repositioned with better spacing */}
        <div className={`absolute bg-black/60 backdrop-blur-md p-2 md:p-3 rounded-lg pointer-events-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)] z-30 ${getDifficultyPosition()}`}>
          <div className="flex space-x-1 md:space-x-2">
            <button 
              onClick={() => handleDifficultyChange('easy')}
              className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm ${
                gameState.difficulty === 'easy' 
                  ? 'bg-indigo-600 text-white drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              Easy
            </button>
            <button 
              onClick={() => handleDifficultyChange('medium')}
              className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm ${
                gameState.difficulty === 'medium' 
                  ? 'bg-purple-600 text-white drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              Medium
            </button>
            <button 
              onClick={() => handleDifficultyChange('hard')}
              className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm ${
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
      
      {/* Game Over Modal - Improved for mobile */}
      {showGameOver && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900/70 backdrop-blur-md p-4 md:p-8 rounded-xl max-w-md w-full mx-4 text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(66,135,245,0.2)]">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">Mission Complete</h2>
            <p className="mb-4 md:mb-6 text-lg md:text-xl">
              Your final score: <span className="font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(66,135,245,0.8)]">{gameState.score}</span>
            </p>
            
            <div className="flex justify-end space-x-2 md:space-x-4">
              <Link href="/">
                <button 
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg bg-gray-800 text-white border border-indigo-500/30"
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
                className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-indigo-700 to-blue-600 shadow-lg hover:shadow-[0_0_15px_rgba(66,135,245,0.5)] hover:from-indigo-800 hover:to-blue-700"
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