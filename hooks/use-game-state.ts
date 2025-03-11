"use client";

import { useState, useEffect, useRef } from 'react';
import {
  GameState,
  GameDifficulty,
  initializeGame,
  updateGameState,
  handleLetterShot,
  resetGame,
} from '@/lib/game-engine';

export const useGameState = (initialDifficulty: GameDifficulty = 'easy') => {
  const [gameState, setGameState] = useState<GameState>(initializeGame(initialDifficulty));
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const requestIdRef = useRef<number | null>(null);

  // Animation loop for game physics
  const tick = (time: number) => {
    if (isPaused) {
      lastUpdateTimeRef.current = time;
      requestIdRef.current = requestAnimationFrame(tick);
      return;
    }

    const deltaTime = (time - lastUpdateTimeRef.current) / 1000; // Convert to seconds
    lastUpdateTimeRef.current = time;

    setGameState(currentState => updateGameState(currentState, deltaTime));
    
    requestIdRef.current = requestAnimationFrame(tick);
  };

  // Start the game loop
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [isPaused]);

  // Handle shooting a letter
  const shootLetter = (letterId: string) => {
    setGameState(currentState => handleLetterShot(currentState, letterId));
  };

  // Reset the game
  const restartGame = (difficulty: GameDifficulty = initialDifficulty) => {
    setGameState(resetGame(difficulty));
  };

  // Toggle pause state
  const togglePause = () => {
    setIsPaused(current => !current);
  };

  // Change difficulty
  const changeDifficulty = (difficulty: GameDifficulty) => {
    restartGame(difficulty);
  };

  return {
    gameState,
    isPaused,
    shootLetter,
    restartGame,
    togglePause,
    changeDifficulty,
  };
};