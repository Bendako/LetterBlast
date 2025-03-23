"use client";

import { useEffect, useRef } from 'react';

interface MissedShotSoundProps {
  play: boolean;
  isMuted?: boolean;
}

export default function MissedShotSound({ play, isMuted = false }: MissedShotSoundProps) {
  // Track audio nodes for cleanup
  const audioNodesRef = useRef<{
    context?: AudioContext | null;
    oscillator?: OscillatorNode | null;
    gainNode?: GainNode | null;
    filter?: BiquadFilterNode | null; // Added filter for better sound effects
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
    if (play && isMountedRef.current && !isMuted) { // Check if not muted
      try {
        // Create audio context with proper typing
        const AudioContextClass = window.AudioContext || 
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        audioNodesRef.current.context = audioContext;
        
        // Configure sound for missed shot - improved characteristics
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        audioNodesRef.current.oscillator = oscillator;
        audioNodesRef.current.gainNode = gainNode;
        audioNodesRef.current.filter = filter;
        
        // Higher pitch, shorter duration, better filter for missed shot sound
        oscillator.type = 'sawtooth'; // More distinct sound
        oscillator.frequency.setValueAtTime(480, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.2);
        
        // Add a slight wobble for a more "error" sound
        const wobbleAmount = 20;
        for (let i = 0; i < 4; i++) {
          const time = audioContext.currentTime + (i * 0.05);
          const direction = i % 2 === 0 ? 1 : -1;
          oscillator.frequency.setValueAtTime(
            480 - (i * 80) + (direction * wobbleAmount), 
            time
          );
        }
        
        // Filter setup for sharper sound
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, audioContext.currentTime);
        filter.Q.value = 2;
        
        // Lower volume to prevent jarring sound
        gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Connect and play
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Schedule cleanup after sound is finished
        setTimeout(() => {
          if (isMountedRef.current) {
            try {
              oscillator.disconnect();
              filter.disconnect();
              gainNode.disconnect();
              
              if (audioContext.state !== 'closed') {
                audioContext.close().catch(() => {}); // Safe closing
              }
              
              audioNodesRef.current = {};
            } catch {
              // Ignore cleanup errors
            }
          }
        }, 400); // Slightly longer than the sound duration
        
      } catch (error) {
        console.error("Error playing missed shot sound:", error);
      }
    }
    
    return () => {
      // This cleanup runs when the play prop changes
    };
  }, [play, isMuted]);
  
  return null;
}