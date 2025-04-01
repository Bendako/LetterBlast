import { useState, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Target extends THREE.Mesh {
  userData: {
    letter: string;
    isTarget: boolean;
    velocity: THREE.Vector3;
    speed: number;
  };
}

interface UseTargetSystemProps {
  scene: THREE.Scene;
  difficulty?: number;
}

export const useTargetSystem = ({ scene, difficulty = 1 }: UseTargetSystemProps) => {
  const targetsRef = useRef<Target[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentWord, setCurrentWord] = useState('CAT'); // Example word, disable warning for now
  const [progress, setProgress] = useState<string[]>(['_', '_', '_']);

  const createLetterTexture = (letter: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Draw background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw letter
    context.fillStyle = '#000000';
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(letter, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  };

  const createTarget = useCallback((letter: string) => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const texture = createLetterTexture(letter);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const target = new THREE.Mesh(geometry, material);

    const side = Math.random() > 0.5 ? -10 : 10;
    const speed = 0.05 * difficulty;
    const velocity = new THREE.Vector3(-Math.sign(side) * speed, 0, 0);

    // Assign properties directly to the generic userData
    target.userData.letter = letter;
    target.userData.isTarget = true;
    target.userData.speed = speed;
    target.userData.velocity = velocity;

    target.position.set(side, Math.random() * 6 - 3, -5);

    scene.add(target);
    
    // *** Fix: Cast to unknown first, then to Target ***
    targetsRef.current.push(target as unknown as Target);

  }, [scene, difficulty]);

  const spawnTargets = useCallback(() => {
    // Create a pool of letters (current word + random letters)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wordLetters = currentWord.split('');
    
    // Ensure we have at least one of each needed letter
    wordLetters.forEach(letter => {
      createTarget(letter);
    });

    // Add some random letters
    for (let i = 0; i < 3; i++) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      createTarget(randomLetter);
    }
  }, [createTarget, currentWord]);

  const updateTargets = useCallback(() => {
    // Use a copy of the array or iterate backwards when removing elements
    for (let i = targetsRef.current.length - 1; i >= 0; i--) {
      const target = targetsRef.current[i];
      target.position.add(target.userData.velocity);

      if (Math.abs(target.position.x) > 15) {
        scene.remove(target);
        targetsRef.current.splice(i, 1);
      }
    }

    // Spawn new targets if needed
    if (targetsRef.current.length < 5) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      createTarget(randomLetter);
    }
  }, [scene, createTarget]);

  const handleTargetHit = useCallback((hitObject: THREE.Object3D) => {
    // Check if it's a Mesh and if it's one of our targets
    if (!(hitObject instanceof THREE.Mesh) || !hitObject.userData.isTarget) {
        return; // Exit if not a valid target mesh
    }

    // Now we can safely assume it has our specific userData structure
    const target = hitObject as Target;
    const hitLetter = target.userData.letter;
    const nextLetterIndex = progress.findIndex(l => l === '_');

    if (nextLetterIndex !== -1 && currentWord[nextLetterIndex] === hitLetter) {
      // Correct letter hit
      const newProgress = [...progress];
      newProgress[nextLetterIndex] = hitLetter;
      setProgress(newProgress);

      // Remove hit target
      scene.remove(target);
      // Filter the array safely
      targetsRef.current = targetsRef.current.filter(t => t.uuid !== target.uuid);

      // Check if word is complete
      if (!newProgress.includes('_')) {
        console.log('Word completed!');
        // TODO: Add logic for word completion (fetch new word, update score, etc.)
        // Example: Fetch a new word
        // setCurrentWord("NEXT"); // Need to implement word fetching
        // setProgress(Array(4).fill('_')); // Reset progress for new word
      }
    } else {
        // Incorrect letter hit or already completed letter hit
        console.log('Incorrect hit or letter already found:', hitLetter);
        // Optional: Add feedback for wrong hit (e.g., flash red, sound effect)
    }
  }, [currentWord, progress, scene]); // Removed setCurrentWord from deps for now

  // Initialize targets
  useEffect(() => {
    spawnTargets();
    return () => {
      // Cleanup targets
      targetsRef.current.forEach(target => scene.remove(target));
      targetsRef.current = [];
    };
  }, [scene, spawnTargets]);

  return {
    currentWord,
    progress,
    updateTargets,
    handleTargetHit // This function now correctly handles Object3D
  };
}; 