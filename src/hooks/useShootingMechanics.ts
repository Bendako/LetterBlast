import { useState, useCallback, useEffect } from 'react';
import { ShootingMode, ShootingModeConfig, SHOOTING_MODES, GameState } from '../types/game';
import * as THREE from 'three';

interface UseShootingMechanicsProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  onHit: (target: THREE.Object3D) => void;
}

export const useShootingMechanics = ({ scene, camera, onHit }: UseShootingMechanicsProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentMode: 'SINGLE',
    energy: 100,
    maxEnergy: 100,
    energyRegenRate: 5,
    activePowerUps: [],
    score: 0,
    multiplier: 1
  });

  const [isCharging, setIsCharging] = useState(false);
  const [chargeStartTime, setChargeStartTime] = useState(0);
  const [lastShotTime, setLastShotTime] = useState(0);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        energy: Math.min(prev.energy + prev.energyRegenRate, prev.maxEnergy)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Power-up management
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        activePowerUps: prev.activePowerUps.filter(powerUp => {
          if (powerUp.active && Date.now() - powerUp.duration > 0) {
            // Handle power-up expiration
            switch (powerUp.type) {
              case 'SCORE_MULTIPLIER':
                return { ...prev, multiplier: 1 };
              // Add other power-up expiration logic
            }
            return false;
          }
          return true;
        })
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const createProjectile = useCallback((mode: ShootingModeConfig, chargeMultiplier = 1) => {
    const geometry = new THREE.SphereGeometry(mode.projectileSize * chargeMultiplier);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const projectile = new THREE.Mesh(geometry, material);

    // Set initial position at camera
    projectile.position.copy(camera.position);
    
    // Calculate direction from camera
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Add velocity to projectile
    const velocity = direction.multiplyScalar(mode.projectileSpeed);
    projectile.userData.velocity = velocity;
    projectile.userData.damage = mode.damage * chargeMultiplier;

    scene.add(projectile);

    // Animate projectile
    const animate = () => {
      projectile.position.add(projectile.userData.velocity);
      
      // Check for collisions
      const raycaster = new THREE.Raycaster(
        projectile.position,
        projectile.userData.velocity.clone().normalize()
      );
      
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object.userData.isTarget) {
          onHit(hit.object);
          scene.remove(projectile);
          return;
        }
      }

      // Remove if out of bounds
      if (projectile.position.length() > 1000) {
        scene.remove(projectile);
        return;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [scene, camera, onHit]);

  const shoot = useCallback(() => {
    const currentTime = Date.now();
    const mode = SHOOTING_MODES[gameState.currentMode];

    // Check cooldown
    if (currentTime - lastShotTime < mode.cooldown) return;
    
    // Check energy
    if (gameState.energy < mode.energyCost) return;

    // Calculate charge multiplier for charged shots
    let chargeMultiplier = 1;
    if (gameState.currentMode === 'CHARGED' && isCharging) {
      const chargeTime = currentTime - chargeStartTime;
      chargeMultiplier = Math.min(chargeTime / 1000, 3); // Max 3x charge
    }

    // Create and fire projectile
    createProjectile(mode, chargeMultiplier);

    // Update state
    setLastShotTime(currentTime);
    setGameState(prev => ({
      ...prev,
      energy: prev.energy - mode.energyCost
    }));
  }, [gameState, isCharging, chargeStartTime, lastShotTime, createProjectile]);

  const switchMode = useCallback((mode: ShootingMode) => {
    setGameState(prev => ({ ...prev, currentMode: mode }));
  }, []);

  const startCharging = useCallback(() => {
    if (gameState.currentMode === 'CHARGED') {
      setIsCharging(true);
      setChargeStartTime(Date.now());
    }
  }, [gameState.currentMode]);

  const releaseCharge = useCallback(() => {
    if (gameState.currentMode === 'CHARGED' && isCharging) {
      shoot();
      setIsCharging(false);
    }
  }, [gameState.currentMode, isCharging, shoot]);

  return {
    gameState,
    shoot,
    switchMode,
    startCharging,
    releaseCharge,
    isCharging
  };
}; 