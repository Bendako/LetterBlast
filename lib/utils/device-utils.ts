/**
 * Utility functions for device detection and capabilities
 */

/**
 * Detects if the current device is a touch device
 */
export const isTouchDevice = (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  
  /**
   * Detects if the current device is in portrait orientation
   */
  export const isPortraitOrientation = (): boolean => {
    return window.innerHeight > window.innerWidth;
  };
  
  /**
   * Gets appropriate camera position based on device type and orientation
   */
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
  
  /**
   * Gets orbit controls settings based on device type
   */
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
  
  /**
   * Gets appropriate pixel ratio limit based on device
   */
  export const getPixelRatioLimit = (isTouchDevice: boolean): number => {
    // Limit pixel ratio more aggressively on touch devices
    return isTouchDevice ? 
      Math.min(window.devicePixelRatio, 1.5) : // Lower for mobile for better performance
      Math.min(window.devicePixelRatio, 2);    // Higher limit for desktop
  };