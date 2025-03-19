"use client";

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Stars } from '@react-three/drei';
import { Letter as LetterType } from '@/lib/game-engine';
import * as THREE from 'three';
import StarExplosion from '@/components/StarExplosion';
import ExplosionSound from '@/components/ExplosionSound';

// Star Letter component that appears as a shooting star with a comet trail
interface LetterProps {
  letter: LetterType;
  onShoot: (id: string) => void;
}

const StarLetter = ({ letter, onShoot }: LetterProps) => {
  const { id, character, position, color, active } = letter;
  
  // State for explosion effects
  const [exploded, setExploded] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  
  // References for animation
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  
  // Animate the letter to follow its velocity direction
  useFrame(() => {
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

  const handleClick = () => {
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
      setTimeout(() => setShowFlash(false), 100);
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
        <ExplosionSound play={playSound} />
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

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={handleClick}
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

// Space environment component 
const SpaceEnvironment = () => {
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
      
      {/* Nebula effect with particles */}
      <group position={[0, 0, -30]}>
        {Array.from({ length: 50 }).map((_, i) => {
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

// Crosshair component with space theme using Tailwind
const SpaceCrosshair = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: mousePosition.x - 32,
        top: mousePosition.y - 32,
        width: '64px',
        height: '64px'
      }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-80 animate-pulse"></div>
      
      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 opacity-80"></div>
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white opacity-100 animate-pulse"></div>
    </div>
  );
};

// Props for the GameCanvas component
interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
}

// Game canvas component that contains the 3D scene with space theme
export default function GameCanvas({ letters, onShootLetter }: GameCanvasProps) {
  // Hide the default cursor
  React.useEffect(() => {
    document.body.style.cursor = 'none';
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  const handleCanvasClick = () => {
    // Just for cursor visuals - shooting is handled in the StarLetter component
  };
  
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 10], fov: 60 }}
        onClick={handleCanvasClick}
      >
        <SpaceEnvironment />
        
        {/* Render letters as shooting stars */}
        {letters.map((letter) => (
          <StarLetter
            key={letter.id}
            letter={letter}
            onShoot={onShootLetter}
          />
        ))}
        
        {/* Orbit controls with limited movement */}
        <OrbitControls 
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          enablePan={true}
          panSpeed={0.5}
          target={[0, 0, -15]}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
      
      {/* Space-themed crosshair */}
      <SpaceCrosshair />
    </div>
  );
}