"use client";

import { useEffect, useRef } from 'react';

interface ExplosionSoundProps {
  play: boolean;
  isCorrect?: boolean; // New prop to distinguish between hit and miss sounds
}

export default function ExplosionSound({ play, isCorrect = true }: ExplosionSoundProps) {
  // Clean up audio nodes
  const audioNodesRef = useRef<{
    context?: AudioContext | null;
    oscillator?: OscillatorNode | null;
    gainNode?: GainNode | null;
    filter?: BiquadFilterNode | null; // Added filter for more interesting sounds
  }>({});
  
  // Track component mount state
  const isMountedRef = useRef(true);
  
  // Setup and cleanup mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      
      // Clean up any lingering audio nodes when component unmounts
      if (audioNodesRef.current.oscillator) {
        try {
          audioNodesRef.current.oscillator.disconnect();
        } catch {
          // Ignore disconnect errors
        }
        audioNodesRef.current.oscillator = null;
      }
      
      if (audioNodesRef.current.gainNode) {
        try {
          audioNodesRef.current.gainNode.disconnect();
        } catch {
          // Ignore disconnect errors
        }
        audioNodesRef.current.gainNode = null;
      }
      
      if (audioNodesRef.current.filter) {
        try {
          audioNodesRef.current.filter.disconnect();
        } catch {
          // Ignore disconnect errors
        }
        audioNodesRef.current.filter = null;
      }
      
      if (audioNodesRef.current.context) {
        try {
          if (audioNodesRef.current.context.state !== 'closed') {
            audioNodesRef.current.context.close();
          }
        } catch {
          // Ignore close errors
        }
        audioNodesRef.current.context = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (play && isMountedRef.current) {
      try {
        // Create the explosion sound with proper typing
        const AudioContextClass = window.AudioContext || 
          ((window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        audioNodesRef.current.context = audioContext;
        
        // Configure sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        audioNodesRef.current.oscillator = oscillator;
        audioNodesRef.current.gainNode = gainNode;
        audioNodesRef.current.filter = filter;
        
        if (isCorrect) {
          // Correct hit sound - more satisfying, longer
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);
          
          // Add a slight vibrato effect for satisfying hit sound
          const vibrato = 10;
          for (let i = 0; i < 10; i++) {
            const time = audioContext.currentTime + (i * 0.02);
            const direction = i % 2 === 0 ? 1 : -1;
            oscillator.frequency.setValueAtTime(
              400 - (i * 30) + (direction * vibrato), 
              time
            );
          }
          
          // More volume for correct hit
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          
          // Filter for richer sound
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, audioContext.currentTime);
          filter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.4);
          filter.Q.value = 5;
        } else {
          // Miss sound - higher pitch, shorter
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
          
          // Lower volume for miss
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          // Different filter characteristics
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(400, audioContext.currentTime);
          filter.Q.value = 2;
        }
        
        // Connect and play
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Use a safer approach to stopping the oscillator
        const stopTime = audioContext.currentTime + (isCorrect ? 0.4 : 0.2);
        oscillator.stop(stopTime);
        
        // Schedule cleanup after sound is finished
        setTimeout(() => {
          if (isMountedRef.current) {
            try {
              oscillator.disconnect();
              filter.disconnect();
              gainNode.disconnect();
              
              // Don't close the context here as it might be reused
              audioNodesRef.current = {};
            } catch {
              // Ignore cleanup errors
            }
          }
        }, isCorrect ? 500 : 300); // Slightly longer than the sound duration
        
      } catch (error) {
        console.error("Error playing explosion sound:", error);
      }
    }
    
    return () => {
      // This cleanup runs when the play prop changes
      // We don't do immediate cleanup here as it might interrupt the sound
      // The setTimeout above handles the proper cleanup timing
    };
  }, [play, isCorrect]);
  
  return null;
}