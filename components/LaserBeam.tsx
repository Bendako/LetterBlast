"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface LaserBeamProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: string;
  duration?: number;
  thickness?: number;
}

/**
 * LaserBeam Component - Particle-Only Version
 * Creates a dotted laser beam effect using only particles
 */
export default function LaserBeam({ 
  start, 
  end, 
  color = '#4fc3f7', 
  duration = 0.4,
  thickness = 0.03 
}: LaserBeamProps) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const startTimeRef = useRef(Date.now());
  const [particles, setParticles] = useState<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    size: number;
    color: string;
  }[]>([]);
  
  // Initialize beam with particles
  useEffect(() => {
    // Create initial particles along the beam
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const distance = start.distanceTo(end);
    
    // Increased particle count for a more visible dotted effect
    const particleCount = Math.floor(distance * 5); 
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      // Position particles along the beam with minimal random offset
      const progress = i / particleCount;
      const basePosition = new THREE.Vector3().lerpVectors(start, end, progress);
      
      // Add slight random offset from beam center (reduced offset for straighter line)
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      
      basePosition.add(offset);
      
      // Random velocity perpendicular to beam direction (reduced for less spread)
      const perpendicular = new THREE.Vector3().crossVectors(
        direction,
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      ).normalize();
      
      // Smaller velocity for more stable particles
      const particleVelocity = perpendicular.multiplyScalar(0.005 + Math.random() * 0.01);
      
      newParticles.push({
        position: basePosition,
        velocity: particleVelocity,
        life: 0.5 + Math.random() * 0.5,
        size: thickness * (0.2 + Math.random() * 0.3), // More consistent size
        color: i % 5 === 0 ? '#ff7e5f' : color // Every 5th particle is accent colored for visual interest
      });
    }
    
    setParticles(newParticles);
    
    // Remove beam after duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration * 1000);
    
    startTimeRef.current = Date.now();
    
    return () => clearTimeout(timer);
  }, [start, end, duration, color, thickness]);
  
  // Animate particles and fade effect
  useFrame(() => {
    if (!visible) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const progress = Math.min(1, elapsed / duration);
    
    // Fade out gradually
    const newOpacity = Math.max(0, 1 - (progress * 1.2));
    setOpacity(newOpacity);
    
    // Update particles
    setParticles(prevParticles => 
      prevParticles
        .map(particle => {
          // Update position
          particle.position.add(particle.velocity);
          
          // Decrease life
          particle.life -= 0.016; // Roughly based on 60fps
          
          return particle;
        })
        .filter(particle => particle.life > 0)
    );
  });
  
  if (!visible) return null;
  
  return (
    <group>
      {/* Small impact flash at the end point */}
      <mesh position={[end.x, end.y, end.z]}>
        <sphereGeometry args={[thickness * 2, 8, 8]} />
        <meshBasicMaterial 
          color="white" 
          transparent={true} 
          opacity={opacity * 0.7}
          toneMapped={false}
        />
      </mesh>
      
      {/* Particles along beam - the main visual element */}
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent={true}
            opacity={(particle.life) * opacity}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}