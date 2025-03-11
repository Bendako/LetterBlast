"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Letter as LetterType } from '@/lib/game-engine';

// A component for a floating letter in 3D space
interface LetterProps {
  letter: LetterType;
  onShoot: (id: string) => void;
}

const Letter = ({ letter, onShoot }: LetterProps) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const { id, character, position, color, active } = letter;

  // Simple animation - rotate the letter
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    if (!active) {
      onShoot(id);
    }
  };

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        transparent={active}
        opacity={active ? 0.5 : 1}
      />
      <Text
        position={[0, 0, 0.51]} // Position the text slightly in front of the cube
        fontSize={0.5}
        color={active ? "gray" : "black"}
        anchorX="center"
        anchorY="middle"
      >
        {character}
      </Text>
    </mesh>
  );
};

// A simple background environment
const Environment = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[-10, 10, 5]} intensity={1} />
      
      {/* Create a basic "floor" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3f7fbf" />
      </mesh>
      
      {/* Create a simple skybox */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -15]}>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
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
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Environment />
        
        {/* Render the letters */}
        {letters.map((letter) => (
          <Letter
            key={letter.id}
            letter={letter}
            onShoot={onShootLetter}
          />
        ))}
        
        {/* Add orbit controls so the user can rotate the view */}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}