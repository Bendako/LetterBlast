"use client";

import React, { useState, useRef, useEffect } from 'react';
import { OrientationWarningProps } from '@/lib/types/game-types';

/**
 * Touch-friendly crosshair component that adapts to different devices
 */
export const AdaptiveCrosshair: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const isUnmountedRef = useRef<boolean>(false);
  const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    isUnmountedRef.current = false;
    
    // Check if this is a touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isUnmountedRef.current) {
        setMousePosition({ x: event.clientX, y: event.clientY });
        setIsActive(true);
        
        // Hide crosshair after 3 seconds of inactivity on desktop
        if (activeTimeoutRef.current) {
          clearTimeout(activeTimeoutRef.current);
        }
        
        activeTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            setIsActive(false);
          }
        }, 3000);
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (!isUnmountedRef.current && event.touches.length === 1) {
        setMousePosition({ 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        });
        setIsActive(true);
        
        // Keep crosshair visible for touch devices, but fade out after 1s
        if (activeTimeoutRef.current) {
          clearTimeout(activeTimeoutRef.current);
        }
        
        activeTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            setIsActive(false);
          }
        }, 1000);
      }
    };
    
    // Register different event handlers based on device type
    if (isTouchDevice) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchstart', handleTouchMove);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      isUnmountedRef.current = true;
      
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
      
      if (isTouchDevice) {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchstart', handleTouchMove);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isTouchDevice]);
  
  // Size adjustments based on device type
  const crosshairSize = isTouchDevice ? 72 : 64; // Larger on touch devices
  const crosshairOpacity = isActive ? 0.6 : 0; // Fade based on activity state
  
  if (!isActive && !isTouchDevice) {
    return null; // Hide completely when inactive on desktop
  }
  
  return (
    <div 
      className="fixed pointer-events-none z-40 transition-opacity duration-300"
      style={{
        left: mousePosition.x - crosshairSize/2,
        top: mousePosition.y - crosshairSize/2,
        width: `${crosshairSize}px`,
        height: `${crosshairSize}px`,
        opacity: crosshairOpacity
      }}
    >
      {/* Outer ring - adapted for visibility on both dark and light backgrounds */}
      <div className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-80 animate-pulse"></div>
      
      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-100 animate-pulse"></div>
      
      {/* Touch-specific inner circle for touch devices */}
      {isTouchDevice && (
        <div className="absolute inset-1/4 border border-white/50 rounded-full"></div>
      )}
    </div>
  );
};

/**
 * Loading fallback for the 3D scene
 */
export const SceneLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-10">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Space Environment...</p>
    </div>
  </div>
);

/**
 * Orientation warning for mobile devices in portrait mode
 */
export const OrientationWarning: React.FC<OrientationWarningProps> = ({ isTouchDevice, isPortrait }) => {
  if (!isTouchDevice || !isPortrait) return null;
  
  return (
    <div className="fixed bottom-28 left-0 right-0 mx-auto w-auto max-w-md px-4 py-3 bg-black/80 text-white text-center rounded-md z-50 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
      <p className="flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Rotate device to landscape for best experience
      </p>
    </div>
  );
};