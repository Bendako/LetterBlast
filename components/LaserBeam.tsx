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
 * Creates a visual laser beam effect between two points in 3D space
 */
export default function LaserBeam({ 
  start, 
  end, 
  color = '#4fc3f7', 
  duration = 0.3,
  thickness = 0.03 
}: LaserBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const startTimeRef = useRef(Date.now());
  
  // Remove beam after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration * 1000);
    
    startTimeRef.current = Date.now();
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  // Animate beam opacity for a fade-out effect
  useFrame(() => {
    if (!visible) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const newOpacity = Math.max(0, 1 - (elapsed / duration));
    setOpacity(newOpacity);
    
    // Add slight random variation to the beam for energy effect
    if (meshRef.current) {
      const variationScale = 0.002;
      meshRef.current.position.x += (Math.random() - 0.5) * variationScale;
      meshRef.current.position.y += (Math.random() - 0.5) * variationScale;
    }
  });
  
  if (!visible) return null;
  
  // Calculate beam direction and length
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const distance = start.distanceTo(end);
  
  // Calculate beam position (midpoint)
  const position = new THREE.Vector3().addVectors(
    start, 
    direction.clone().multiplyScalar(distance / 2)
  );
  
  // Calculate rotation to point from start to end
  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4().lookAt(
    start, 
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
      
      {/* Point light following the beam for dynamic lighting */}
      <pointLight
        position={[position.x, position.y, position.z]}
        color={color}
        intensity={2 * opacity}
        distance={2}
        decay={2}
      />
      
      {/* Small flash at the start point */}
      <mesh position={[start.x, start.y, start.z]}>
        <sphereGeometry args={[thickness * 3, 8, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={opacity * 0.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Impact flash at the end point */}
      <mesh position={[end.x, end.y, end.z]}>
        <sphereGeometry args={[thickness * 4, 8, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={opacity * 0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}