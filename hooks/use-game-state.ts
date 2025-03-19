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
  const activeTimeoutsRef = useRef<number[]>([]);

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

  // Improved cleanup function that focuses only on game components
  const cleanupGameLoop = useCallback(() => {
    // Signal that component is unmounting to prevent further updates
    isUnmountedRef.current = true;
    
    // Cancel our specific animation frame
    if (requestIdRef.current !== null) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    
    // Clean up any timeouts that were registered by this component
    activeTimeoutsRef.current.forEach(id => {
      clearTimeout(id);
    });
    activeTimeoutsRef.current = [];
  }, []);

  // A safer setTimeout that tracks IDs
  const safeSetTimeout = useCallback((callback: () => void, delay: number): number => {
    const timeoutId = window.setTimeout(() => {
      // Remove this ID from our tracking array when it executes
      activeTimeoutsRef.current = activeTimeoutsRef.current.filter(id => id !== timeoutId);
      callback();
    }, delay);
    
    // Track this timeout ID
    activeTimeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  // Start the game loop with proper cleanup
  useEffect(() => {
    isUnmountedRef.current = false;
    requestIdRef.current = requestAnimationFrame(tick);
    
    return () => {
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
    safeSetTimeout,
  };
};