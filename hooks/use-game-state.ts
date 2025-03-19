"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const isUnmountedRef = useRef<boolean>(false);

  // Animation loop for game physics
  const tick = useCallback((time: number) => {
    if (isUnmountedRef.current) return;
    
    if (isPaused) {
      lastUpdateTimeRef.current = time;
      requestIdRef.current = requestAnimationFrame(tick);
      return;
    }

    const deltaTime = (time - lastUpdateTimeRef.current) / 1000; // Convert to seconds
    lastUpdateTimeRef.current = time;

    setGameState(currentState => updateGameState(currentState, deltaTime));
    
    requestIdRef.current = requestAnimationFrame(tick);
  }, [isPaused]);

  // Clean up function to ensure all animations are stopped
  const cleanupGameLoop = useCallback(() => {
    if (requestIdRef.current !== null) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    
    // Force cleanup of any other potentially running animation frames
    for (let i = 1; i < 1000; i++) {
      cancelAnimationFrame(i);
    }
  }, []);

  // Start the game loop with proper cleanup
  useEffect(() => {
    isUnmountedRef.current = false;
    requestIdRef.current = requestAnimationFrame(tick);
    
    return () => {
      isUnmountedRef.current = true;
      cleanupGameLoop();
    };
  }, [tick, cleanupGameLoop]);

  // Handle shooting a letter
  const shootLetter = useCallback((letterId: string) => {
    if (isUnmountedRef.current) return;
    setGameState(currentState => handleLetterShot(currentState, letterId));
  }, []);

  // Reset the game
  const restartGame = useCallback((difficulty: GameDifficulty = initialDifficulty) => {
    if (isUnmountedRef.current) return;
    setGameState(resetGame(difficulty));
  }, [initialDifficulty]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (isUnmountedRef.current) return;
    setIsPaused(current => !current);
  }, []);

  // Change difficulty
  const changeDifficulty = useCallback((difficulty: GameDifficulty) => {
    if (isUnmountedRef.current) return;
    restartGame(difficulty);
  }, [restartGame]);

  return {
    gameState,
    isPaused,
    shootLetter,
    restartGame,
    togglePause,
    changeDifficulty,
    cleanupGameLoop,
  };
};