import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useShootingMechanics } from '../hooks/useShootingMechanics';
import { useTargetSystem } from '../hooks/useTargetSystem';
import { ShootingModeSelector } from './ShootingModeSelector';
import { EnergyBar } from './EnergyBar';

export const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  );

  const {
    currentWord,
    progress,
    updateTargets,
    handleTargetHit
  } = useTargetSystem({
    scene: sceneRef.current
  });

  const {
    gameState,
    shoot,
    switchMode,
    startCharging,
    releaseCharge,
    isCharging
  } = useShootingMechanics({
    scene: sceneRef.current,
    camera: cameraRef.current,
    onHit: handleTargetHit
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue background
    containerRef.current.appendChild(renderer.domElement);

    // Setup camera
    cameraRef.current.position.z = 5;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    sceneRef.current.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      updateTargets();
      renderer.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [updateTargets]);

  // Handle mouse/keyboard input
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Prevent default browser actions, like text selection
      event.preventDefault(); 
      if (gameState.currentMode === 'CHARGED') {
        startCharging();
      } else {
        shoot();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      if (gameState.currentMode === 'CHARGED') {
        releaseCharge();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for spacebar if needed
      if (e.key === ' ') e.preventDefault(); 
      
      switch (e.key) {
        case '1':
          switchMode('SINGLE');
          break;
        case '2':
          switchMode('RAPID');
          break;
        case '3':
          switchMode('CHARGED');
          break;
        case ' ':
          handleMouseDown(new MouseEvent('mousedown'));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleMouseUp(new MouseEvent('mouseup'));
      }
    };

    // Use the container for mouse events to avoid triggering outside the game area
    const currentContainer = containerRef.current;
    if (currentContainer) {
        currentContainer.addEventListener('mousedown', handleMouseDown);
        currentContainer.addEventListener('mouseup', handleMouseUp);
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (currentContainer) {
          currentContainer.removeEventListener('mousedown', handleMouseDown);
          currentContainer.removeEventListener('mouseup', handleMouseUp);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.currentMode, shoot, switchMode, startCharging, releaseCharge]);

  return (
    <div ref={containerRef} className="w-full h-full cursor-crosshair" tabIndex={0}>
      {/* Word Display */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-3 rounded-lg text-center pointer-events-none">
        <div className="text-white text-sm mb-1">Shoot the letters to spell:</div>
        <div className="text-3xl font-bold text-white">{currentWord}</div>
        <div className="text-2xl font-mono tracking-wider text-blue-300 mt-2">
          {progress.join(' ')}
        </div>
      </div>

      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className={`w-6 h-6 border-2 rounded-full transition-all duration-200
          ${isCharging ? 'scale-150 border-yellow-500' : 'border-white'}
        `} />
      </div>

      {/* HUD Elements - Ensure they don't block clicks */}
      <div className="fixed bottom-4 left-4 pointer-events-none">
          <ShootingModeSelector
            currentMode={gameState.currentMode}
            onModeSelect={switchMode}
            energy={gameState.energy}
          />
      </div>
       <div className="fixed top-4 left-4 pointer-events-none">
          <EnergyBar
            current={gameState.energy}
            max={gameState.maxEnergy}
            regenRate={gameState.energyRegenRate}
          />
      </div>
    </div>
  );
}; 