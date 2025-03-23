"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Stars } from '@react-three/drei';
import { Letter as LetterType } from '@/lib/game-engine';
import * as THREE from 'three';
import StarExplosion from '@/components/StarExplosion';
import ExplosionSound from '@/components/ExplosionSound';
import LaserBeam from '@/components/LaserBeam';

// Type definition for missed shot sound props
interface MissedShotSoundProps {
  play: boolean;
  isMuted?: boolean;
}

// Add a missed shot sound component
const MissedShotSound: React.FC<MissedShotSoundProps> = ({ play, isMuted = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      audioRef.current = null;
    };
  }, []);
  
  useEffect(() => {
    if (play && !isMuted && isMountedRef.current && !audioRef.current) {
      try {
        // Create audio context
        const AudioContextClass = window.AudioContext || 
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        
        const audioContext = new AudioContextClass();
        
        // Configure sound for missed shot - higher pitch, shorter duration
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(480, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        // Cleanup
        setTimeout(() => {
          if (isMountedRef.current) {
            oscillator.disconnect();
            gainNode.disconnect();
            audioRef.current = null;
          }
        }, 300);
        
      } catch (error) {
        console.error("Error playing missed shot sound:", error);
      }
    }
    
    return () => {
      // Cleanup logic if needed
    };
  }, [play, isMuted]);
  
  return null;
};

// Type definitions for MissEffect props
interface MissEffectProps {
  position: [number, number, number];
}

// Visual effect for missed shots
const MissEffect: React.FC<MissEffectProps> = ({ position }) => {
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

// Type definition for Raycaster props
interface RaycasterProps {
  onShoot: (data: { id: string | null; point: THREE.Vector3; start: THREE.Vector3 }) => void;
  isGameOver: boolean;
}

// Enhanced raycaster for both mouse and touch events
const Raycaster: React.FC<RaycasterProps> = ({ onShoot, isGameOver }) => {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchDevice = useRef(false);
  const lastShootTime = useRef(0);
  
  // Detect if device supports touch events
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);
  
  // Normalized coordinate calculation from screen position
  const getNormalizedCoords = (clientX: number, clientY: number) => {
    return {
      x: (clientX / gl.domElement.clientWidth) * 2 - 1,
      y: -(clientY / gl.domElement.clientHeight) * 2 + 1
    };
  };
  
  // Perform ray casting and shooting logic
  const performRaycast = (normalizedX: number, normalizedY: number) => {
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
  };
  
  // Mouse event handlers
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Skip if this is a touch device - we'll use touch events instead
      if (isTouchDevice.current) return;
      
      const coords = getNormalizedCoords(event.clientX, event.clientY);
      performRaycast(coords.x, coords.y);
    };
    
    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, isGameOver, onShoot, raycaster, scene.children]);
  
  // Touch event handlers
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      
      // Store initial touch position for potential drag detection
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      
      // Prevent default to avoid scrolling/zooming
      event.preventDefault();
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      // Only process if we have a valid touch start position
      if (!touchStartRef.current) return;
      
      // Get the position of the touch end or use the last touch start position
      const touchEndX = event.changedTouches[0]?.clientX || touchStartRef.current.x;
      const touchEndY = event.changedTouches[0]?.clientY || touchStartRef.current.y;
      
      // Calculate distance from start to detect if this was a tap vs. a drag
      const distanceX = touchEndX - touchStartRef.current.x;
      const distanceY = touchEndY - touchStartRef.current.y;
      const dragDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // If drag distance is small enough, consider it a tap/shoot
      if (dragDistance < 20) {
        const coords = getNormalizedCoords(touchEndX, touchEndY);
        performRaycast(coords.x, coords.y);
      }
      
      // Reset touch start ref
      touchStartRef.current = null;
      
      // Prevent default to avoid any unwanted behaviors
      event.preventDefault();
    };
    
    // Add touch event listeners only if this is a touch device
    if (isTouchDevice.current) {
      const canvas = gl.domElement;
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    return undefined;
  }, [camera, gl, isGameOver, onShoot, raycaster, scene.children]);
  
  return null;
};

// Star Letter component that appears as a shooting star with a comet trail
interface LetterProps {
  letter: LetterType;
  onShoot: (id: string) => void;
  isMuted?: boolean;
  isTouchDevice?: boolean; // New prop for touch detection
}

const StarLetter = React.memo(({ letter, onShoot, isMuted = false, isTouchDevice = false }: LetterProps) => {
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
});

StarLetter.displayName = 'StarLetter';

// Low detail space environment for performance optimization
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
        count={800} // Further reduced from 1000 for mobile
        factor={3}
        saturation={0}
        fade
      />
    </>
  );
};

// Full detail space environment
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

// Improved adaptive space environment that considers more device factors
const AdaptiveSpaceEnvironment: React.FC = () => {
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

// Touch-friendly crosshair component that adapts to different devices
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
      className="fixed pointer-events-none z-50 transition-opacity duration-300"
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

// Loading fallback for the 3D scene
const SceneLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-10">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Space Environment...</p>
    </div>
  </div>
);

// Props for the GameCanvas component
interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
  isGameOver: boolean;
  isMuted: boolean;
}

// Type for laser beam state object
interface LaserBeam {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  timestamp: number;
}

// Type for miss effect state object
interface MissEffect {
  id: string;
  position: [number, number, number];
  timestamp: number;
}

// Enhanced Game canvas component with responsive design for all screen sizes
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
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const [missEffects, setMissEffects] = useState<MissEffect[]>([]);
  const [playMissSound, setPlayMissSound] = useState<boolean>(false);
  
  // Device capability detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  
  // Detect device capabilities and orientation
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsPortrait(window.innerHeight > window.innerWidth);
    
    const handleResize = () => {
      if (!isUnmountedRef.current) {
        setIsPortrait(window.innerHeight > window.innerWidth);
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
  
  // Update the useEffect to conditionally set the cursor style
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
  
  // Enhanced shoot handler with improved visual feedback and touch support
  const handleShoot = ({ 
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
    const beam: LaserBeam = {
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
  };
  
  // Camera position calculation based on device orientation and type
  const getCameraPosition = (): [number, number, number] => {
    if (isTouchDevice) {
      // For touch devices, adjust camera position based on orientation
      if (isPortrait) {
        return [0, 0, 12]; // Move camera further back in portrait for better view
      } else {
        return [0, 0, 11]; // Slightly closer in landscape
      }
    } else {
      // Desktop default
      return [0, 0, 10];
    }
  };
  
  // OrbitControls settings calculation based on device type
  const getOrbitControlsSettings = () => {
    if (isTouchDevice) {
      return {
        enableZoom: true,
        enableRotate: true,
        minPolarAngle: Math.PI * 0.2, // Limit rotation more on mobile
        maxPolarAngle: Math.PI * 0.8, // Limit rotation more on mobile
        enablePan: true,
        panSpeed: 0.5,
        rotateSpeed: 0.5, // Slower rotation for more precision on touch
        target: new THREE.Vector3(0, 0, -15),
        maxDistance: 18,
        minDistance: 6,
        enabled: !isGameOver, // Disable controls when game is over
      };
    } else {
      // Desktop default
      return {
        enableZoom: true,
        enableRotate: true,
        minPolarAngle: Math.PI * 0.1,
        maxPolarAngle: Math.PI * 0.9,
        enablePan: true,
        panSpeed: 0.5,
        target: new THREE.Vector3(0, 0, -15),
        maxDistance: 20,
        minDistance: 5,
        enabled: !isGameOver, // Disable controls when game is over
      };
    }
  };
  
  // Calculate pixel ratio limit based on device
  const getPixelRatioLimit = () => {
    // Limit pixel ratio more aggressively on touch devices
    return isTouchDevice ? 
      Math.min(window.devicePixelRatio, 1.5) : // Lower for mobile for better performance
      Math.min(window.devicePixelRatio, 2);    // Higher limit for desktop
  };
  
  // Orientation warning for mobile devices in portrait mode
  const OrientationWarning = () => {
    if (!isTouchDevice || !isPortrait) return null;
    
    return (
      <div className="fixed bottom-28 left-0 right-0 mx-auto w-auto max-w-md px-4 py-2 bg-black/70 text-white text-center rounded-md z-50 backdrop-blur-sm">
        <p>Rotate device to landscape for best experience</p>
      </div>
    );
  };
  
  // Get orbit controls settings
  const orbitSettings = getOrbitControlsSettings();
  
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      {!isSceneLoaded && <SceneLoadingFallback />}
      
      <Canvas 
        shadows 
        camera={{ position: getCameraPosition(), fov: isTouchDevice ? 70 : 60 }}
        onCreated={({ gl }) => {
          // Force WebGL context optimization
          gl.setPixelRatio(getPixelRatioLimit());
          
          // Additional touch-specific optimizations
          if (isTouchDevice) {
            gl.shadowMap.enabled = false; // Disable shadows on mobile
          }
        }}
        gl={{
          antialias: !isTouchDevice, // Enable antialiasing only on non-touch devices
          alpha: false,              // No transparency needed for background
          powerPreference: isTouchDevice ? 'low-power' : 'high-performance',
          stencil: false,            // Disable stencil buffer for performance
          depth: true,               // Keep depth buffer for 3D
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
              onShoot={(id) => handleShoot({
                id,
                point: new THREE.Vector3(...letter.position),
                start: new THREE.Vector3(0, 0, getCameraPosition()[2])
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
            rotateSpeed={orbitSettings.rotateSpeed}
            target={orbitSettings.target}
            maxDistance={orbitSettings.maxDistance}
            minDistance={orbitSettings.minDistance}
            enabled={orbitSettings.enabled}
          />
        </Suspense>
      </Canvas>
      
      {/* Sound effect for missed shots - with mute support */}
      <MissedShotSound play={playMissSound} isMuted={isMuted} />
      
      {/* Only show the crosshair when the game is not over */}
      {!isGameOver && <AdaptiveCrosshair />}
      
      {/* Orientation advice for mobile users */}
      <OrientationWarning />
    </div>
  );
};

export default GameCanvas;