import { Letter as LetterType } from '@/lib/game-engine';
import * as THREE from 'three';

// Raycaster props
export interface RaycasterProps {
  onShoot: (data: { id: string | null; point: THREE.Vector3; start: THREE.Vector3 }) => void;
  isGameOver: boolean;
}

// MissEffect props
export interface MissEffectProps {
  position: [number, number, number];
}

// Star Letter component props
export interface LetterProps {
  letter: LetterType;
  onShoot: (id: string) => void;
  isMuted?: boolean;
  isTouchDevice?: boolean;
}

// GameCanvas props
export interface GameCanvasProps {
  letters: LetterType[];
  onShootLetter: (id: string) => void;
  isGameOver: boolean;
  isMuted: boolean;
}

// Laser beam state object
export interface LaserBeamEffect {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  timestamp: number;
}

// Miss effect state object
export interface MissEffectState {
  id: string;
  position: [number, number, number];
  timestamp: number;
}

// OrientationWarning props
export interface OrientationWarningProps {
  isTouchDevice: boolean;
  isPortrait: boolean;
}

// Particle interface for effects
export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

// Device utils
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isPortraitOrientation = (): boolean => {
  return window.innerHeight > window.innerWidth;
};

export const getCameraPosition = (isTouchDevice: boolean, isPortrait: boolean): [number, number, number] => {
  if (isTouchDevice) {
    // For touch devices, adjust camera position based on orientation
    if (isPortrait) {
      return [0, 0, 13]; // Move camera even further back in portrait for better view
    } else {
      return [0, 0, 12]; // Slightly closer in landscape
    }
  } else {
    // Desktop default
    return [0, 0, 10];
  }
};

export const getOrbitControlsSettings = (isTouchDevice: boolean, isGameOver: boolean) => {
  if (isTouchDevice) {
    return {
      enableZoom: true,
      enableRotate: true,
      minPolarAngle: Math.PI * 0.25, // More limited rotation on mobile
      maxPolarAngle: Math.PI * 0.75, // More limited rotation on mobile
      enablePan: true,
      panSpeed: 0.4, // Slower pan for more control
      rotateSpeed: 0.4, // Slower rotation for more control
      target: [0, 0, -15],
      maxDistance: 18,
      minDistance: 7, // Increased min distance to prevent getting too close
      enabled: !isGameOver, // Disable controls when game is over
      dampingFactor: 0.1, // Add damping for smoother control
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
      target: [0, 0, -15],
      maxDistance: 20,
      minDistance: 5,
      enabled: !isGameOver, // Disable controls when game is over
      dampingFactor: 0.05,
    };
  }
};

export const getPixelRatioLimit = (isTouchDevice: boolean): number => {
  // Limit pixel ratio more aggressively on touch devices
  return isTouchDevice ? 
    Math.min(window.devicePixelRatio, 1.5) : // Lower for mobile for better performance
    Math.min(window.devicePixelRatio, 2);    // Higher limit for desktop
};