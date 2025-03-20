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
 * LaserBeam Component
 * Creates a dynamic side-firing laser beam effect with enhanced visuals
 */
export default function LaserBeam({ 
  start, 
  end, 
  color = '#4fc3f7', 
  duration = 0.4,
  thickness = 0.03 
}: LaserBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
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
    const particleCount = Math.floor(distance * 3); // More particles for longer beams
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      // Position particles along the beam with some random offset
      const progress = i / particleCount;
      const basePosition = new THREE.Vector3().lerpVectors(start, end, progress);
      
      // Add slight random offset from beam center
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
      );
      
      basePosition.add(offset);
      
      // Random velocity perpendicular to beam direction
      const perpendicular = new THREE.Vector3().crossVectors(
        direction,
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      ).normalize();
      
      newParticles.push({
        position: basePosition,
        velocity: perpendicular.multiplyScalar(0.01 + Math.random() * 0.02),
        life: 0.5 + Math.random() * 0.5,
        size: thickness * (0.2 + Math.random() * 0.4),
        color: color
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
  
  // Animate beam opacity and pulse effect
  useFrame(() => {
    if (!visible) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const progress = Math.min(1, elapsed / duration);
    
    // Fade out beam gradually
    const newOpacity = Math.max(0, 1 - (progress * 1.2));
    setOpacity(newOpacity);
    
    // Move pulse along the beam
    if (pulseRef.current) {
      const pulseProgress = Math.min(1, progress * 2.5); // Pulse moves faster than the fade
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const distance = start.distanceTo(end);
      
      const pulsePosition = new THREE.Vector3().copy(start).add(
        direction.clone().multiplyScalar(distance * pulseProgress)
      );
      
      pulseRef.current.position.copy(pulsePosition);
      
      // Pulse gets smaller as it travels
      const pulseScale = Math.max(0.1, 1 - pulseProgress);
      pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
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
    
    // Add slight random variation to the beam for energy effect
    if (meshRef.current) {
      const variationScale = 0.002;
      meshRef.current.position.x += (Math.random() - 0.5) * variationScale;
      meshRef.current.position.y += (Math.random() - 0.5) * variationScale;
    }
  });
  
  if (!visible) return null;
  
  // ===== IMPROVED: Modify the starting position to be more side-firing =====
  // Instead of starting directly from the camera, offset to bottom right corner 
  // to create a "gun position" effect
  const adjustedStart = new THREE.Vector3(
    start.x + 1.5,  // Offset to the right 
    start.y - 1,    // Offset down
    start.z         // Keep same z distance
  );
  
  // Calculate beam direction and length
  const direction = new THREE.Vector3().subVectors(end, adjustedStart).normalize();
  const distance = adjustedStart.distanceTo(end);
  
  // Calculate beam position (midpoint)
  const position = new THREE.Vector3().addVectors(
    adjustedStart, 
    direction.clone().multiplyScalar(distance / 2)
  );
  
  // Calculate rotation to point from start to end
  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4().lookAt(
    adjustedStart, 
    end, 
    new THREE.Vector3(0, 1, 0)
  );
  quaternion.setFromRotationMatrix(matrix);
  
  return (
    <group>
      {/* Main laser beam */}
      <mesh 
        ref={meshRef} 
        position={[position.x, position.y, position.z]} 
        quaternion={quaternion}
      >
        <cylinderGeometry args={[thickness, thickness, distance, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={opacity * 0.7}
          toneMapped={false}
        />
      </mesh>
      
      {/* Glow effect around the beam */}
      <mesh 
        position={[position.x, position.y, position.z]} 
        quaternion={quaternion}
      >
        <cylinderGeometry args={[thickness * 2, thickness * 2, distance, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={opacity * 0.3}
          toneMapped={false}
        />
      </mesh>
      
      {/* NEW: Traveling pulse effect along the beam */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[thickness * 5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={opacity * 0.6}
          toneMapped={false}
        />
      </mesh>
      
      {/* Point light following the beam for dynamic lighting */}
      <pointLight
        position={[position.x, position.y, position.z]}
        color={color}
        intensity={2 * opacity}
        distance={3}
        decay={2}
      />
      
      {/* Enhanced muzzle flash at the start point */}
      <mesh position={[adjustedStart.x, adjustedStart.y, adjustedStart.z]}>
        <sphereGeometry args={[thickness * 2, 16, 16]} />
        <meshBasicMaterial 
          color="white" 
          transparent={true} 
          opacity={opacity * 0.8}
          toneMapped={false}
        />
      </mesh>
      
      {/* Cone-shaped muzzle flash */}
      <mesh 
        position={[adjustedStart.x, adjustedStart.y, adjustedStart.z]} 
        quaternion={quaternion}
      >
        <coneGeometry args={[thickness * 3, thickness * 6, 8]} />
        <meshBasicMaterial 
          color={color}
          transparent={true} 
          opacity={opacity * 0.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Enhanced impact flash at the end point */}
      <mesh position={[end.x, end.y, end.z]}>
        <sphereGeometry args={[thickness * 4, 16, 16]} />
        <meshBasicMaterial 
          color="white" 
          transparent={true} 
          opacity={opacity * 0.9}
          toneMapped={false}
        />
      </mesh>
      
      {/* Secondary impact flash (larger, different color) */}
      <mesh position={[end.x, end.y, end.z]}>
        <sphereGeometry args={[thickness * 6, 8, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={opacity * 0.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Particles along beam */}
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