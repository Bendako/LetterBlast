"use client";

import { useEffect, useRef } from 'react';

interface MissedShotSoundProps {
  play: boolean;
  isMuted?: boolean; // New prop
}

export default function MissedShotSound({ play, isMuted = false }: MissedShotSoundProps) {
  // Track audio nodes for cleanup
  const audioNodesRef = useRef<{
    context?: AudioContext | null;
    oscillator?: OscillatorNode | null;
    gainNode?: GainNode | null;
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
    if (play && isMountedRef.current && !isMuted) { // Check if not muted
      try {
        // Create audio context with proper typing
        const AudioContextClass = window.AudioContext || 
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        audioNodesRef.current.context = audioContext;
        
        // Configure sound for missed shot - higher pitch, shorter duration
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        audioNodesRef.current.oscillator = oscillator;
        audioNodesRef.current.gainNode = gainNode;
        
        // Use different parameters for a "miss" sound
        // Higher pitch, shorter duration than hit sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(480, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        
        // Lower volume than hit sound
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
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
        }, 300); // Slightly longer than the sound duration
        
      } catch (error) {
        console.error("Error playing missed shot sound:", error);
      }
    }
    
    return () => {
      // This cleanup runs when the play prop changes
      // We don't do immediate cleanup here as it might interrupt the sound
      // The setTimeout above handles the proper cleanup timing
    };
  }, [play, isMuted]);
  
  return null;
}