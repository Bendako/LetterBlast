"use client";

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MissEffectProps, Particle } from '@/lib/types/game-types';

/**
 * Visual effect for missed shots
 */
const MissEffect: React.FC<MissEffectProps> = ({ position }) => {
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

export default MissEffect;