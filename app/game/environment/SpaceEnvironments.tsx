"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Stars } from '@react-three/drei';

/**
 * Low detail space environment for performance optimization
 */
export const LowDetailSpaceEnvironment: React.FC = () => {
  return (
    <>
      {/* Dark space background */}
      <color attach="background" args={["#000010"]} />
      
      {/* Reduced lighting for better performance */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Simplified stars with fewer particles */}
      <Stars 
        radius={100}
        depth={50}
        count={800} // Reduced for mobile
        factor={3}
        saturation={0}
        fade
      />
    </>
  );
};

/**
 * Full detail space environment
 */
export const HighDetailSpaceEnvironment: React.FC = () => {
  return (
    <>
      {/* Dark space background */}
      <color attach="background" args={["#000010"]} />
      
      {/* Ambient and directional lights for space setting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-5, 2, -10]} intensity={1} color="#4169e1" />
      <pointLight position={[5, -2, -15]} intensity={0.8} color="#800080" />
      
      {/* Built-in drei Stars component for background */}
      <Stars 
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />
      
      {/* Distant planets */}
      <mesh position={[-20, 10, -50]} castShadow>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial color="#4169e1" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#4169e1" distance={10} />
      </mesh>
      
      <mesh position={[25, -15, -70]} castShadow>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#8A2BE2" />
      </mesh>
      
      {/* Nebula effect with particles - reduced count */}
      <group position={[0, 0, -30]}>
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 2 + 0.5;
          const x = (Math.random() - 0.5) * 60;
          const y = (Math.random() - 0.5) * 40;
          const z = (Math.random() - 0.5) * 30 - 10;
          
          return (
            <mesh key={`nebula-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#4B0082" : "#8A2BE2"} 
                transparent={true}
                opacity={0.05 + Math.random() * 0.1}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
};

/**
 * Adaptive space environment that intelligently selects rendering detail
 * based on device capabilities and performance factors
 */
export const AdaptiveSpaceEnvironment: React.FC = () => {
  // Use state to track if device is high-end or low-end
  const [isHighPerformance, setIsHighPerformance] = useState<boolean>(true);
  const isUnmountedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Setup unmounted flag
    isUnmountedRef.current = false;
    
    // More comprehensive device performance check
    const checkPerformance = () => {
      // Performance factors to consider
      const pixelRatio = window.devicePixelRatio || 1;
      const cpuCores = navigator.hardwareConcurrency || 4;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const screenSize = window.innerWidth * window.innerHeight;
      const isSmallScreen = screenSize < 500000; // Roughly a 800x600 screen
      
      // Combined scoring system for performance determination
      let performanceScore = 0;
      
      if (pixelRatio >= 2) performanceScore += 1;
      if (cpuCores >= 4) performanceScore += 1;
      if (!isMobile) performanceScore += 2;
      if (!isSmallScreen) performanceScore += 1;
      
      // Check for GPU blacklist or performance issues in the browser
      let gpuLimitations = false;
      try {
        const canvas = document.createElement('canvas');
        // Specifically request WebGL context
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        if (!gl) {
          gpuLimitations = true;
        } else {
          // Only try to access debug info if gl is available
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Check for known low-performance GPUs (simplified)
            if (typeof renderer === 'string' && renderer.includes('Intel') && !renderer.includes('Iris')) {
              performanceScore -= 1;
            }
          }
        }
      } catch {
        gpuLimitations = true;
      }
      
      if (gpuLimitations) performanceScore -= 1;
      
      // Memory considerations - if we can detect it
      if ('deviceMemory' in navigator) {
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
        if (memory < 4) performanceScore -= 1;
      }
      
      // Battery considerations without using the Battery API directly
      // Check if browser has low-power mode or similar indicators
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        performanceScore -= 1;
      }
      
      // Make determination
      determinePerformance(performanceScore);
    };
    
    const determinePerformance = (score: number) => {
      if (!isUnmountedRef.current) {
        setIsHighPerformance(score >= 2); // Threshold for high performance
      }
    };
    
    checkPerformance();
    
    // Detect orientation changes or resizes
    const handleResize = () => {
      if (!isUnmountedRef.current) {
        checkPerformance();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Clean up
    return () => {
      isUnmountedRef.current = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return isHighPerformance ? <HighDetailSpaceEnvironment /> : <LowDetailSpaceEnvironment />;
};