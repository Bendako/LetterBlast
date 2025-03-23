"use client";

import { useEffect, useRef } from 'react';

interface ExplosionSoundProps {
  play: boolean;
  isMuted?: boolean;
  isCorrect?: boolean;
}

export default function ExplosionSound({ play, isMuted = false, isCorrect = true }: ExplosionSoundProps) {
  // Clean up audio nodes
  const audioNodesRef = useRef<{
    context?: AudioContext | null;
    oscillator?: OscillatorNode | null;
    gainNode?: GainNode | null;
    filter?: BiquadFilterNode | null;
    delayNode?: DelayNode | null; // Added for more interesting effects
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
      
      if (audioNodesRef.current.delayNode) {
        try {
          audioNodesRef.current.delayNode.disconnect();
        } catch {
          // Ignore disconnect errors
        }
        audioNodesRef.current.delayNode = null;
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
        // Create the explosion sound with proper typing
        const AudioContextClass = window.AudioContext || 
          ((window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        audioNodesRef.current.context = audioContext;
        
        // Configure sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Optional delay for echo effect (only for correct hits)
        let delayNode: DelayNode | null = null;
        if (isCorrect) {
          delayNode = audioContext.createDelay(0.5);
          delayNode.delayTime.value = 0.1;
          audioNodesRef.current.delayNode = delayNode;
        }
        
        audioNodesRef.current.oscillator = oscillator;
        audioNodesRef.current.gainNode = gainNode;
        audioNodesRef.current.filter = filter;
        
        if (isCorrect) {
          // Correct hit sound - more satisfying, longer, with sci-fi feel
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(380, audioContext.currentTime); // Slightly lower start
          oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);
          
          // Add a more sophisticated vibrato effect for satisfying hit sound
          const vibrato = 15;
          const vibratoSpeed = 0.025; // Faster vibrato
          for (let i = 0; i < 10; i++) {
            const time = audioContext.currentTime + (i * vibratoSpeed);
            const direction = i % 2 === 0 ? 1 : -1;
            const frequencyValue = 380 - (i * 30) + (direction * vibrato);
            oscillator.frequency.setValueAtTime(frequencyValue, time);
          }
          
          // Add rising sweep at the end for a satisfying finish
          oscillator.frequency.setValueAtTime(120, audioContext.currentTime + 0.33);
          oscillator.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 0.4);
          
          // More volume for correct hit with smoother release
          gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          // Filter for richer sound
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, audioContext.currentTime);
          filter.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + 0.2);
          filter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.5);
          filter.Q.value = 5;
        } else {
          // Miss sound - higher pitch, shorter
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
          
          // Add wobble for miss sound
          const wobble = 30;
          for (let i = 0; i < 4; i++) {
            const time = audioContext.currentTime + (i * 0.05);
            const direction = i % 2 === 0 ? 1 : -1;
            oscillator.frequency.setValueAtTime(
              520 - (i * 80) + (direction * wobble), 
              time
            );
          }
          
          // Lower volume for miss
          gainNode.gain.setValueAtTime(0.17, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          // Different filter characteristics
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(400, audioContext.currentTime);
          filter.Q.value = 2;
        }
        
        // Connect and play with optional delay effect
        if (isCorrect && delayNode) {
          // Main output path
          oscillator.connect(filter);
          filter.connect(gainNode);
          
          // Create delay feedback loop
          const delayGain = audioContext.createGain();
          delayGain.gain.value = 0.2; // Echo volume
          
          // Connect main signal to output and delay
          gainNode.connect(audioContext.destination);
          gainNode.connect(delayNode);
          
          // Create feedback loop for delay
          delayNode.connect(delayGain);
          delayGain.connect(delayNode); // Feedback
          delayGain.connect(audioContext.destination); // Output the delay
        } else {
          // Simpler connection for incorrect
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
        }
        
        oscillator.start();
        
        // Use a safer approach to stopping the oscillator
        const stopTime = audioContext.currentTime + (isCorrect ? 0.5 : 0.3);
        oscillator.stop(stopTime);
        
        // Schedule cleanup after sound is finished and any echoes
        setTimeout(() => {
          if (isMountedRef.current) {
            try {
              oscillator.disconnect();
              filter.disconnect();
              gainNode.disconnect();
              
              if (delayNode) {
                delayNode.disconnect();
              }
              
              if (audioContext.state !== 'closed') {
                audioContext.close().catch(() => {}); // Safe closing
              }
              
              audioNodesRef.current = {};
            } catch {
              // Ignore cleanup errors
            }
          }
        }, isCorrect ? 800 : 500); // Longer for correct hits to include delay effect
        
      } catch (error) {
        console.error("Error playing explosion sound:", error);
      }
    }
    
    return () => {
      // This cleanup runs when the play prop changes
    };
  }, [play, isCorrect, isMuted]);
  
  return null;
}