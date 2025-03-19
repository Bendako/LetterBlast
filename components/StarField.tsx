"use client";

import React, { useRef, useEffect } from 'react';

interface StarFieldProps {
  starsCount?: number;
  speed?: number;
  backgroundColor?: string;
  className?: string;
}

/**
 * StarField - An animated background of stars using canvas
 * This component uses the canvas API for efficient star rendering
 */
export default function StarField({
  starsCount = 300,
  speed = 0.5,
  backgroundColor = '#000010',
  className = '',
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number}[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < starsCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * speed + 0.1,
        });
      }
    };
    
    // Update stars positions
    const updateStars = () => {
      starsRef.current.forEach(star => {
        star.y += star.speed;
        
        // Reset star position if it moves off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
    };
    
    // Draw stars on canvas
    const drawStars = () => {
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      starsRef.current.forEach(star => {
        // Create a gradient for the star glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };
    
    // Animation loop
    const animate = () => {
      updateStars();
      drawStars();
      requestAnimationFrame(animate);
    };
    
    // Handle window resize
    window.addEventListener('resize', () => {
      setCanvasSize();
      initStars();
    });
    
    // Initialize
    setCanvasSize();
    initStars();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [starsCount, speed, backgroundColor]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 -z-10 w-full h-full ${className}`}
    />
  );
}