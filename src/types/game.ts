export type ShootingMode = 'SINGLE' | 'RAPID' | 'CHARGED';

export interface ShootingModeConfig {
  name: string;
  cooldown: number; // milliseconds between shots
  damage: number;
  projectileSpeed: number;
  projectileSize: number;
  energyCost: number;
}

export interface PowerUp {
  id: string;
  type: 'TIME_FREEZE' | 'LETTER_HINT' | 'SCORE_MULTIPLIER';
  duration: number; // milliseconds
  strength: number; // effect multiplier
  active: boolean;
}

export interface GameState {
  currentMode: ShootingMode;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  activePowerUps: PowerUp[];
  score: number;
  multiplier: number;
}

export const SHOOTING_MODES: Record<ShootingMode, ShootingModeConfig> = {
  SINGLE: {
    name: 'Single Shot',
    cooldown: 500,
    damage: 1,
    projectileSpeed: 1,
    projectileSize: 1,
    energyCost: 10
  },
  RAPID: {
    name: 'Rapid Fire',
    cooldown: 100,
    damage: 0.5,
    projectileSpeed: 1.5,
    projectileSize: 0.7,
    energyCost: 5
  },
  CHARGED: {
    name: 'Charged Shot',
    cooldown: 1000,
    damage: 2,
    projectileSpeed: 0.8,
    projectileSize: 1.5,
    energyCost: 25
  }
}; 