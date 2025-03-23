"use client";

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RaycasterProps } from '@/lib/types/game-types';

/**
 * Enhanced raycaster for both mouse and touch events
 */
const Raycaster: React.FC<RaycasterProps> = ({ onShoot, isGameOver }) => {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchDevice = useRef(false);
  const lastShootTime = useRef(0);
  const touchMoveCountRef = useRef(0);
  
  // Detect if device supports touch events
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);
  
  // Normalized coordinate calculation from screen position
  const getNormalizedCoords = useCallback((clientX: number, clientY: number) => {
    return {
      x: (clientX / gl.domElement.clientWidth) * 2 - 1,
      y: -(clientY / gl.domElement.clientHeight) * 2 + 1
    };
  }, [gl.domElement.clientWidth, gl.domElement.clientHeight]);
  
  // Perform ray casting and shooting logic
  const performRaycast = useCallback((normalizedX: number, normalizedY: number) => {
    if (isGameOver) return;
    
    // Rate limit shooting to prevent accidental rapid taps/clicks
    const now = Date.now();
    if (now - lastShootTime.current < 150) return;
    lastShootTime.current = now;
    
    // Set ray coordinates
    mouse.x = normalizedX;
    mouse.y = normalizedY;
    
    // Update the picking ray
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      // Find the closest object that has userData.letterId
      for (const intersect of intersects) {
        let obj = intersect.object;
        
        // Traverse up to find an object with letterId
        while (obj && !obj.userData.letterId) {
          if (obj.parent) {
            obj = obj.parent;
          } else {
            break;
          }
        }
        
        if (obj && obj.userData.letterId) {
          // Create a laser beam from camera to hit point
          const start = new THREE.Vector3(0, 0, 5).applyMatrix4(camera.matrixWorld);
          onShoot({
            id: obj.userData.letterId,
            point: intersect.point,
            start,
          });
          
          // Add haptic feedback for touch devices
          if (isTouchDevice.current && navigator.vibrate) {
            navigator.vibrate(25);
          }
          
          break;
        }
      }
    } else {
      // Shot missed all letters - provide feedback for missed shot
      const start = new THREE.Vector3(0, 0, 5).applyMatrix4(camera.matrixWorld);
      
      // Get point far in the distance along ray direction
      const direction = raycaster.ray.direction.clone();
      const farPoint = new THREE.Vector3().addVectors(
        start, 
        direction.multiplyScalar(100)
      );
      
      onShoot({
        id: null,
        point: farPoint,
        start,
      });
    }
  }, [camera, isGameOver, mouse, onShoot, raycaster, scene.children]);
  
  // Mouse event handlers
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Skip if this is a touch device - we'll use touch events instead
      if (isTouchDevice.current) return;
      
      // Skip if clicked on a UI element with pointer-events-auto
      const target = event.target as Element;
      if (target.closest('.pointer-events-auto')) return;
      
      const coords = getNormalizedCoords(event.clientX, event.clientY);
      performRaycast(coords.x, coords.y);
    };
    
    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl.domElement, getNormalizedCoords, performRaycast]);
  
  // Touch event handlers with improved touch detection
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      
      // Skip if touched on a UI element with pointer-events-auto
      const target = event.target as Element;
      if (target.closest('.pointer-events-auto')) return;
      
      // Store initial touch position for potential drag detection
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      
      // Reset touch move counter on new touch
      touchMoveCountRef.current = 0;
      
      // Prevent default only for game canvas interactions (not UI)
      if (!target.closest('.pointer-events-auto')) {
        event.preventDefault();
      }
    };
    
    const handleTouchMove = () => {
      // Increment move counter to track dragging
      touchMoveCountRef.current++;
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      // Only process if we have a valid touch start position
      if (!touchStartRef.current) return;
      
      // Skip if touched on a UI element with pointer-events-auto
      const target = event.target as Element;
      if (target.closest('.pointer-events-auto')) {
        touchStartRef.current = null;
        return;
      }
      
      // Get the position of the touch end or use the last touch start position
      const touchEndX = event.changedTouches[0]?.clientX || touchStartRef.current.x;
      const touchEndY = event.changedTouches[0]?.clientY || touchStartRef.current.y;
      
      // Calculate distance from start to detect if this was a tap vs. a drag
      const distanceX = touchEndX - touchStartRef.current.x;
      const distanceY = touchEndY - touchStartRef.current.y;
      const dragDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // If drag distance is small enough and not too many move events (more reliable tap detection)
      if (dragDistance < 20 && touchMoveCountRef.current < 5) {
        const coords = getNormalizedCoords(touchEndX, touchEndY);
        performRaycast(coords.x, coords.y);
      }
      
      // Reset touch start ref
      touchStartRef.current = null;
      
      // Prevent default to avoid any unwanted behaviors
      if (!target.closest('.pointer-events-auto')) {
        event.preventDefault();
      }
    };
    
    // Add touch event listeners only if this is a touch device
    if (isTouchDevice.current) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    return undefined;
  }, [getNormalizedCoords, performRaycast]);
  
  return null;
};

export default Raycaster;