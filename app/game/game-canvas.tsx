"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Stars } from '@react-three/drei';
import { Letter as LetterType } from '@/lib/game-engine';
import * as THREE from 'three';

// Import existing components directly
import StarExplosion from '@/components/StarExplosion';
import LaserBeam from '@/components/LaserBeam';
import ExplosionSound from '@/components/ExplosionSound';
import MissedShotSound from '@/components/MissedShotSound';

// Import types and utility functions
import { 
  LaserBeamEffect, 
  MissEffectState,
  isTouchDevice as checkIsTouchDevice, 
  isPortraitOrientation, 
  getCameraPosition,
  getOrbitControlsSettings,
  getPixelRatioLimit
} from '@/lib/types/game-types';

// === COMPONENT DEFINITIONS ===

/**
 * Visual effect for missed shots
 */
const MissEffect: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }

  const [particles, setParticles] = useState<Particle[]>(() => {
    const result: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 0.03 + Math.random() * 0.02;
      result.push({
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0
        ),
        life: 1.0,
        maxLife: 1.0,
      });
    }
    return result;
  });
  
  useFrame((_, delta) => {
    setParticles(prev =>
      prev
        .map(particle => {
          particle.position.add(particle.velocity);
          particle.life -= delta * 2; // Faster fadeout than explosion
          return particle;
        })
        .filter(particle => particle.life > 0)
    );
  });
  
  if (particles.length === 0) return null;
  
  return (
    <group position={position}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <sphereGeometry args={[0.1 * (particle.life / particle.maxLife), 8, 8]} />
          <meshBasicMaterial 
            color="red" 
            transparent={true} 
            opacity={particle.life / particle.maxLife}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Star Letter component that appears as a shooting star with a comet trail
 */
const StarLetter: React.FC<{ 
  letter: LetterType; 
  onShoot: (id: string) => void; 
  isMuted?: boolean; 
  isTouchDevice?: boolean 
}> = ({ letter, onShoot, isMuted = false, isTouchDevice = false }) => {
  const { id, character, position, color, active } = letter;
  
  // State for explosion effects
  const [exploded, setExploded] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  
  // References for animation
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const isUnmountedRef = useRef(false);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);
  
  // Animate the letter to follow its velocity direction
  useFrame(() => {
    if (isUnmountedRef.current) return;
    
    if (groupRef.current && !active && !exploded) {
      // Calculate rotation based on velocity to point in movement direction
      const [vx, vy] = letter.velocity;
      const angle = Math.atan2(vy, vx);
      groupRef.current.rotation.z = angle;
      
      // Slightly vary the trail scale for a twinkling effect
      if (trailRef.current && Math.random() > 0.8) {
        const scaleVar = Math.random() * 0.1 + 0.95;
        trailRef.current.scale.set(scaleVar, scaleVar, 1);
      }
    }
  });

  // When a letter is hit directly (not through raycasting)
  const handleClick = (event: React.MouseEvent) => {
    // On touch devices, we rely on the raycaster for better hit detection
    if (isTouchDevice) return;
    
    // Stop propagation to prevent double-firing of events
    event.stopPropagation();
    
    if (isUnmountedRef.current) return;
    
    if (!active && !exploded) {
      // Trigger explosion effects
      setExploded(true);
      setShowFlash(true);
      setPlaySound(true);
      
      // Call the shoot handler
      onShoot(id);
      
      // Add haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Hide flash after a short time
      const flashTimeout = setTimeout(() => {
        if (!isUnmountedRef.current) {
          setShowFlash(false);
        }
      }, 100);
      
      // Clean up timeout if component unmounts
      return () => {
        clearTimeout(flashTimeout);
      };
    }
  };

  // If exploded but letter not active yet, show explosion
  if (exploded && !active) {
    return (
      <>
        <StarExplosion position={position} color={color} />
        {showFlash && (
          <pointLight 
            position={position} 
            intensity={5} 
            distance={10} 
            color="white"
          />
        )}
        <ExplosionSound play={playSound} isMuted={isMuted} />
      </>
    );
  }

  // If letter is active (shot), don't render it
  if (active) return null;

  // Generate a color gradient for the star trail
  const starColor = color;
  // Get a darker version of the color for the trail end
  const trailColor = color.replace(/^#/, '');
  const r = parseInt(trailColor.substring(0, 2), 16);
  const g = parseInt(trailColor.substring(2, 4), 16);
  const b = parseInt(trailColor.substring(4, 6), 16);
  const darkerTrailColor = `#${Math.floor(r * 0.4).toString(16).padStart(2, '0')}${Math.floor(g * 0.4).toString(16).padStart(2, '0')}${Math.floor(b * 0.4).toString(16).padStart(2, '0')}`;

  // Add touch-friendly scaling for mobile
  const letterScale = isTouchDevice ? 1.3 : 1.0; // Larger on touch devices

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={handleClick}
      userData={{ letterId: id }} // Add letterId to userData for raycasting
      scale={[letterScale, letterScale, letterScale]}
    >
      {/* Comet Trail */}
      <mesh 
        ref={trailRef}
        position={[-0.8, 0, -0.1]} 
      >
        <coneGeometry args={[0.3, 1.5, 8]} />
        <meshStandardMaterial 
          color={darkerTrailColor} 
          transparent={true} 
          opacity={0.7}
          emissive={darkerTrailColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Star Head with the Letter */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={starColor} 
          emissive={starColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Letter Text */}
      <Billboard follow={true}>
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {character}
        </Text>
      </Billboard>
      
      {/* Small glow effect */}
      <pointLight 
        distance={3} 
        intensity={0.6} 
        color={starColor} 
      />
    </group>
  );
};

/**
 * Enhanced raycaster for both mouse and touch events
 */
const Raycaster: React.FC<{ 
  onShoot: (data: { id: string | null; point: THREE.Vector3; start: THREE.Vector3 }) => void; 
  isGameOver: boolean 
}> = ({ onShoot, isGameOver }) => {
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

/**
 * Low detail space environment for performance optimization
 */
const LowDetailSpaceEnvironment: React.FC = () => {
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
const HighDetailSpaceEnvironment: React.FC = () => {
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
 */
const AdaptiveSpaceEnvironment: React.FC = () => {
  const [isHighPerformance, setIsHighPerformance] = useState<boolean>(true);
  const isUnmountedRef = useRef<boolean>(false);
  
  useEffect(() => {
    isUnmountedRef.current = false;
    
    // Comprehensive device performance check
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
      if (!isUnmountedRef.current) {
        setIsHighPerformance(performanceScore >= 2); // Threshold for high performance
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

/**
 * Touch-friendly crosshair component that adapts to different devices
 */
const AdaptiveCrosshair: React.FC = () => {
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
      {/* Outer ring */}
      <div className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-80 animate-pulse"></div>
      
      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-100 animate-pulse"></div>
      
      {/* Touch-specific inner circle */}
      {isTouchDevice && (
        <div className="absolute inset-1/4 border border-white/50 rounded-full"></div>
      )}
    </div>
  );
};

/**
 * Loading fallback for the 3D scene
 */
const SceneLoadingFallback: React.FC = () => (
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
const OrientationWarning: React.FC<{ isTouchDevice: boolean, isPortrait: boolean }> = ({ 
  isTouchDevice, 
  isPortrait 
}) => {
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

// === MAIN GAME CANVAS COMPONENT ===

/**
 * The main GameCanvas component that renders the 3D game world
 */
export interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
  isGameOver: boolean;
  isMuted: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  letters, 
  onShootLetter, 
  isGameOver,
  isMuted 
}) => {
  // Track scene loading
  const [isSceneLoaded, setIsSceneLoaded] = useState<boolean>(false);
  const isUnmountedRef = useRef<boolean>(false);
  
  // State for visual effects
  const [laserBeams, setLaserBeams] = useState<LaserBeamEffect[]>([]);
  const [missEffects, setMissEffects] = useState<MissEffectState[]>([]);
  const [playMissSound, setPlayMissSound] = useState<boolean>(false);
  
  // Device capability detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  
  // Detect device capabilities and orientation
  useEffect(() => {
    setIsTouchDevice(checkIsTouchDevice());
    setIsPortrait(isPortraitOrientation());
    
    const handleResize = () => {
      if (!isUnmountedRef.current) {
        setIsPortrait(isPortraitOrientation());
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  // Memoize letters to prevent unnecessary re-renders
  const memoizedLetters = useMemo(() => letters, [letters]);
  
  // Clean up old effects
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setLaserBeams(prev => prev.filter(beam => now - beam.timestamp < 300));
      setMissEffects(prev => prev.filter(effect => now - effect.timestamp < 1000));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update cursor style based on game state
  useEffect(() => {
    isUnmountedRef.current = false;
    
    // Only hide the cursor if the game is not over and not on a touch device
    if (!isGameOver && !isTouchDevice) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    return () => {
      isUnmountedRef.current = true;
      document.body.style.cursor = 'auto';
    };
  }, [isGameOver, isTouchDevice]); 
  
  // Handle scene load complete with cleanup for timeouts
  useEffect(() => {
    if (isUnmountedRef.current) return;
    
    const timer = setTimeout(() => {
      if (!isUnmountedRef.current) {
        setIsSceneLoaded(true);
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Shoot handler with improved visual feedback
  const handleShoot = useCallback(({ 
    id, 
    point, 
    start 
  }: { 
    id: string | null; 
    point: THREE.Vector3; 
    start: THREE.Vector3 
  }) => {
    if (isGameOver) return;
    
    // Create a slightly offset starting position that works well on all device types
    const adjustedStart = new THREE.Vector3(
      start.x + (isTouchDevice ? 0.8 : 1.5),  // Less offset on touch devices
      start.y - (isTouchDevice ? 0.5 : 1),    // Less offset on touch devices
      start.z         // Keep same Z position
    );
    
    // Add laser beam effect with adjusted starting position
    const beam: LaserBeamEffect = {
      id: `beam-${Date.now()}`,
      start: adjustedStart,
      end: new THREE.Vector3(point.x, point.y, point.z),
      color: id ? '#4fc3f7' : '#ff5252', // Blue for potential hit, red for definite miss
      timestamp: Date.now()
    };
    
    // Replace previous beams rather than adding to them
    setLaserBeams([beam]);
    
    if (id) {
      // Attempt to shoot a letter
      onShootLetter(id);
      
      // Add haptic feedback for mobile devices if supported
      if (isTouchDevice && navigator.vibrate) {
        navigator.vibrate(25);
      }
    } else {
      // Definitely missed all letters, show miss effect
      const missPosition: [number, number, number] = [point.x, point.y, point.z];
      setMissEffects(prev => [
        ...prev, 
        {
          id: `miss-${Date.now()}`,
          position: missPosition,
          timestamp: Date.now()
        }
      ]);
      
      // Play miss sound
      setPlayMissSound(true);
      setTimeout(() => setPlayMissSound(false), 50);
    }
  }, [isGameOver, isTouchDevice, onShootLetter]);
  
  // Get orbit controls settings
  const orbitSettings = useMemo(() => 
    getOrbitControlsSettings(isTouchDevice, isGameOver),
    [isTouchDevice, isGameOver]
  );
  
  // Get camera position
  const cameraPosition = useMemo(() => 
    getCameraPosition(isTouchDevice, isPortrait),
    [isTouchDevice, isPortrait]
  );
  
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      {!isSceneLoaded && <SceneLoadingFallback />}
      
      <Canvas 
        shadows 
        camera={{ position: cameraPosition, fov: isTouchDevice ? 65 : 60 }}
        onCreated={({ gl }) => {
          // Force WebGL context optimization
          gl.setPixelRatio(getPixelRatioLimit(isTouchDevice));
          
          // Additional touch-specific optimizations
          if (isTouchDevice) {
            gl.shadowMap.enabled = false; // Disable shadows on mobile
            gl.setClearColor(new THREE.Color('#000010')); // Set clear color for performance
          }
        }}
        gl={{
          antialias: !isTouchDevice, // Enable antialiasing only on non-touch devices
          alpha: false,              // No transparency needed for background
          powerPreference: isTouchDevice ? 'low-power' : 'high-performance',
          stencil: false,            // Disable stencil buffer for performance
          depth: true,               // Keep depth buffer for 3D
          preserveDrawingBuffer: false, // Improve performance
        }}
        style={{ 
          // Give canvas a lower z-index than the HUD elements
          position: 'absolute', 
          zIndex: 10 
        }}
      >
        <Suspense fallback={null}>
          <AdaptiveSpaceEnvironment />
          
          {/* Add raycaster for better click detection */}
          <Raycaster onShoot={handleShoot} isGameOver={isGameOver} />
          
          {/* Render letters as shooting stars */}
          {memoizedLetters.map((letter) => (
            <StarLetter
              key={letter.id}
              letter={letter}
              isMuted={isMuted}
              isTouchDevice={isTouchDevice}
              onShoot={(id: string) => handleShoot({
                id,
                point: new THREE.Vector3(...letter.position),
                start: new THREE.Vector3(0, 0, cameraPosition[2])
              })}
            />
          ))}
          
          {/* Render all active laser beams */}
          {laserBeams.map(beam => (
            <LaserBeam 
              key={beam.id}
              start={beam.start}
              end={beam.end}
              color={beam.color}
              duration={0.4}
              thickness={isTouchDevice ? 0.04 : 0.03} // Thicker beams on touch devices
            />
          ))}
          
          {/* Render all miss effects */}
          {missEffects.map(effect => (
            <MissEffect 
              key={effect.id}
              position={effect.position}
            />
          ))}
          
          {/* Orbit controls with settings based on device type */}
          <OrbitControls 
            enableZoom={orbitSettings.enableZoom}
            enableRotate={orbitSettings.enableRotate}
            minPolarAngle={orbitSettings.minPolarAngle}
            maxPolarAngle={orbitSettings.maxPolarAngle}
            enablePan={orbitSettings.enablePan}
            panSpeed={orbitSettings.panSpeed}
            rotateSpeed={orbitSettings.rotateSpeed || 1}
            target={new THREE.Vector3(...orbitSettings.target)}
            maxDistance={orbitSettings.maxDistance}
            minDistance={orbitSettings.minDistance}
            enabled={orbitSettings.enabled}
            dampingFactor={orbitSettings.dampingFactor}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>
      
      {/* Sound effect for missed shots - with mute support */}
      <MissedShotSound play={playMissSound} isMuted={isMuted} />
      
      {/* Only show the crosshair when the game is not over */}
      {!isGameOver && <AdaptiveCrosshair />}
      
      {/* Orientation advice for mobile users */}
      <OrientationWarning isTouchDevice={isTouchDevice} isPortrait={isPortrait} />
    </div>
  );
};

export default GameCanvas;