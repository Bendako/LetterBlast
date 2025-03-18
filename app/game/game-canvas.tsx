"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import { Letter as LetterType } from '@/lib/game-engine';

// A component for a floating letter in 3D space
interface LetterProps {
  letter: LetterType;
  onShoot: (id: string) => void;
}

const Letter = ({ letter, onShoot }: LetterProps) => {
  const { id, character, position, color, active } = letter;

  const handleClick = () => {
    if (!active) {
      onShoot(id);
    }
  };

  return (
    <Billboard
      position={position}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <mesh
        scale={active ? 1.5 : 1}
        onClick={handleClick}
      >
        <planeGeometry args={[1, 1]} /> 
        <meshStandardMaterial 
          color={color} 
          transparent={active}
          opacity={active ? 0.5 : 1}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.6}
          color={active ? "gray" : "white"}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {character}
        </Text>
      </mesh>
    </Billboard>
  );
};

// Outdoor shooting range environment - replacing the original indoor range
const OutdoorShootingRangeEnvironment = () => {
  return (
    <>
      {/* Sky */}
      <color attach="background" args={["#87CEEB"]} />
      
      {/* Ambient and directional lights for outdoor setting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.4} />
      
      {/* Ground/grass field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      
      {/* Target range strip - a lighter colored grass area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.99, -15]} receiveShadow>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color="#a5d6a7" />
      </mesh>
      
      {/* Distance markers */}
      {[5, 10, 15, 20, 25].map((dist) => (
        <mesh key={dist} position={[0, -2.98, -dist]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Target backing wall */}
      <mesh position={[0, 2, -30]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#795548" />
      </mesh>
      
      {/* Simple target circles on the wall */}
      <mesh position={[-5, 2, -29.7]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#f44336" />
      </mesh>
      <mesh position={[5, 2, -29.7]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#f44336" />
      </mesh>
      
      {/* Trees around the perimeter */}
      {[
        [-15, -2, -20],
        [15, -2, -20],
        [-20, -2, -10],
        [20, -2, -10],
        [-18, -2, -30],
        [18, -2, -30],
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          {/* Tree trunk */}
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.7, 4, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Tree foliage */}
          <mesh position={[0, 5.5, 0]} castShadow>
            <coneGeometry args={[3, 5, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
      
      {/* Mountain backdrop */}
      <mesh position={[0, 15, -60]} receiveShadow>
        <boxGeometry args={[100, 30, 1]} />
        <meshStandardMaterial color="#9E9E9E" />
      </mesh>
    </>
  );
};

// Rifle component that will appear in the foreground
const Rifle = () => {
  return (
    <group position={[0.7, -0.5, 1]} rotation={[0, 0, 0]}>
      {/* Rifle body */}
      <mesh position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      {/* Rifle barrel */}
      <mesh position={[-0.8, 0.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      
      {/* Rifle stock */}
      <mesh position={[0.6, -0.1, 0]} rotation={[0, -Math.PI / 2, 0.2]}>
        <boxGeometry args={[0.8, 0.2, 0.15]} />
        <meshStandardMaterial color="#795548" />
      </mesh>
      
      {/* Scope on top */}
      <mesh position={[-0.3, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 8]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
    </group>
  );
};

// Scope overlay component that follows the mouse position
const ScopeOverlay = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    // Handle mouse movement to update cursor position
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    // Add event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      className="fixed pointer-events-none"
      style={{
        left: mousePosition.x - 32, // Center the 64px wide crosshair
        top: mousePosition.y - 32,  // Center the 64px tall crosshair
        width: '64px',
        height: '64px',
        zIndex: 100
      }}
    >
      {/* Outer scope ring */}
      <div className="absolute inset-0 border-2 border-black rounded-full opacity-70"></div>
      
      {/* Crosshairs */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black opacity-70"></div>
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black opacity-70"></div>
      
      {/* Inner circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-red-500 opacity-80"></div>
    </div>
  );
};

// Props for the GameCanvas component
interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
}

// Game canvas component that contains the 3D scene
export default function GameCanvas({ letters, onShootLetter }: GameCanvasProps) {
  // Hide the default cursor
  React.useEffect(() => {
    document.body.style.cursor = 'none';
    
    // Restore cursor when component unmounts
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  // Handle shooting when clicking
  const handleCanvasClick = () => {
    // Raycasting is already handled by Three.js in the Letter component
    // We just need to make sure the cursor shows
  };
  
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 10], fov: 60 }}
        onClick={handleCanvasClick}
      >
        <OutdoorShootingRangeEnvironment />
        
        {/* Render only the non-active letters (make them disappear when hit) */}
        {letters.filter(letter => !letter.active).map((letter) => (
          <Letter
            key={letter.id}
            letter={letter}
            onShoot={onShootLetter}
          />
        ))}
        
        {/* Add rifle in foreground */}
        <Rifle />
        
        {/* Add orbit controls with very limited movement to maintain front view */}
        <OrbitControls 
          enableZoom={true}
          enableRotate={false}    // Disable rotation completely to keep front view
          enablePan={true}        // Allow panning to move around the 2D plane
          panSpeed={0.5}          // Reduce pan speed for better control
          target={[0, 0, -15]}    // Look at the center of where letters are
          maxDistance={20}        // Limit how far you can zoom out
          minDistance={5}         // Limit how close you can zoom in
        />
      </Canvas>
      
      {/* Add custom mouse-following crosshair */}
      <ScopeOverlay />
    </div>
  );
}