"use client";

import { useEffect } from 'react';

interface ExplosionSoundProps {
  play: boolean;
}

export default function ExplosionSound({ play }: ExplosionSoundProps) {
  useEffect(() => {
    if (play) {
      try {
        // Create the explosion sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create oscillator for the explosion sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Cleanup
        return () => {
          oscillator.disconnect();
          gainNode.disconnect();
        };
      } catch (error) {
        console.error("Error playing explosion sound:", error);
      }
    }
  }, [play]);
  
  return null;
}