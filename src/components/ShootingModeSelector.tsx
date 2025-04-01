import React from 'react';
import { ShootingMode, SHOOTING_MODES } from '../types/game';

interface ShootingModeSelectorProps {
  currentMode: ShootingMode;
  onModeSelect: (mode: ShootingMode) => void;
  energy: number;
}

export const ShootingModeSelector: React.FC<ShootingModeSelectorProps> = ({
  currentMode,
  onModeSelect,
  energy
}) => {
  return (
    <div className="fixed bottom-4 left-4 flex gap-2 bg-black/50 p-2 rounded-lg">
      {(Object.entries(SHOOTING_MODES) as [ShootingMode, typeof SHOOTING_MODES[ShootingMode]][]).map(([mode, config]) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          className={`
            px-4 py-2 rounded-md transition-all duration-200
            flex flex-col items-center gap-1
            ${currentMode === mode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }
            ${energy < config.energyCost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          disabled={energy < config.energyCost}
          aria-label={`Select ${config.name} mode`}
          tabIndex={0}
        >
          <span className="text-sm font-bold">{config.name}</span>
          <div className="flex items-center gap-2 text-xs">
            <span>{config.energyCost}⚡</span>
            <span>{config.damage}💥</span>
          </div>
        </button>
      ))}
    </div>
  );
}; 