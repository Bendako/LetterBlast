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

// A shooting range environment
const ShootingRangeEnvironment = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
      
      {/* Floor with shooting range markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#444444" />
        {/* Range markers */}
        {[5, 10, 15, 20, 25].map((dist) => (
          <mesh key={dist} position={[0, -dist, 0.01]} rotation={[0, 0, 0]}>
            <planeGeometry args={[20, 0.2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </mesh>
      
      {/* Back wall with target patterns */}
      <mesh position={[0, 2, -25]} receiveShadow>
        <boxGeometry args={[40, 10, 0.5]} />
        <meshStandardMaterial color="#555555" />
        {/* Target circles */}
        <mesh position={[0, 0, 0.3]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <ringGeometry args={[1, 1.2, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[-10, 0, 0.3]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[10, 0, 0.3]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </mesh>
      
      {/* Side walls */}
      <mesh position={[20, 2, -10]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      <mesh position={[-20, 2, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Ceiling with lights */}
      <mesh position={[0, 7, -10]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Light fixtures */}
      {[-10, 0, 10].map((x) => (
        <mesh key={`light-${x}`} position={[x, 6.9, -10]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[2, 2, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffff99" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </>
  );
};

// Props for the GameCanvas component
interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
}

// Game canvas component that contains the 3D scene
export default function GameCanvas({ letters, onShootLetter }: GameCanvasProps) {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 60 }}>
        <ShootingRangeEnvironment />
        
        {/* Render only the non-active letters (make them disappear when hit) */}
        {letters.filter(letter => !letter.active).map((letter) => (
          <Letter
            key={letter.id}
            letter={letter}
            onShoot={onShootLetter}
          />
        ))}
        
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
    </div>
  );
}