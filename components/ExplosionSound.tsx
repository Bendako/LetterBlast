"use client";

import { useEffect, useRef } from 'react';

// Add proper type declaration for webkitAudioContext
interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface ExplosionSoundProps {
  play: boolean;
}

export default function ExplosionSound({ play }: ExplosionSoundProps) {
  // Clean up audio nodes
  const audioNodesRef = useRef<{
    context?: AudioContext;
    oscillator?: OscillatorNode;
    gainNode?: GainNode;
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
      }
      
      if (audioNodesRef.current.gainNode) {
        try {
          audioNodesRef.current.gainNode.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
      
      if (audioNodesRef.current.context) {
        try {
          if (audioNodesRef.current.context.state !== 'closed') {
            audioNodesRef.current.context.close();
          }
        } catch {
          // Ignore close errors
        }
      }
    };
  }, []);
  
  useEffect(() => {
    if (play && isMountedRef.current) {
      try {
        // Create the explosion sound with proper typing
        const AudioContextClass = window.AudioContext || 
          ((window as unknown as Window).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        audioNodesRef.current.context = audioContext;
        
        // Configure sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        audioNodesRef.current.oscillator = oscillator;
        audioNodesRef.current.gainNode = gainNode;
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Use a safer approach to stopping the oscillator
        const stopTime = audioContext.currentTime + 0.3;
        oscillator.stop(stopTime);
        
        // Schedule cleanup after sound is finished
        setTimeout(() => {
          if (isMountedRef.current) {
            try {
              oscillator.disconnect();
              gainNode.disconnect();
              
              // Don't close the context here as it might be reused
              audioNodesRef.current = {};
            } catch {
              // Ignore cleanup errors
            }
          }
        }, 400); // Slightly longer than the sound duration
        
      } catch (error) {
        console.error("Error playing explosion sound:", error);
      }
    }
    
    return () => {
      // This cleanup runs when the play prop changes
      // We don't do immediate cleanup here as it might interrupt the sound
      // The setTimeout above handles the proper cleanup timing
    };
  }, [play]);
  
  return null;
}