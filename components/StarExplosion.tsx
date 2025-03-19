"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Particle type for explosion effect
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface StarExplosionProps {
  position: [number, number, number];
  color: string;
}

export default function StarExplosion({ position, color }: StarExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize explosion particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.05;
      
      newParticles.push({
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 0.02
        ),
        color,
        size: 0.1 + Math.random() * 0.2,
        life: 1.0,
        maxLife: 1.0 + Math.random() * 0.5,
      });
    }
    
    setParticles(newParticles);
  }, [color]);
  
  // Animate particles
  useFrame((_, delta) => {
    if (!particles.length) return;
    
    setParticles(prevParticles => 
      prevParticles
        .map(particle => {
          // Update position
          particle.position.add(particle.velocity);
          
          // Update life
          particle.life -= delta;
          
          // Slow down velocity over time
          particle.velocity.multiplyScalar(0.96);
          
          return particle;
        })
        .filter(particle => particle.life > 0)
    );
  });
  
  // Remove component when all particles are dead
  if (particles.length === 0) return null;
  
  return (
    <group ref={groupRef} position={position}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <sphereGeometry args={[particle.size * (particle.life / particle.maxLife), 8, 8]} />
          <meshBasicMaterial 
            color={particle.color} 
            transparent={true} 
            opacity={particle.life / particle.maxLife}
          />
        </mesh>
      ))}
    </group>
  );
}