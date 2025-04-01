import React from 'react';

interface EnergyBarProps {
  current: number;
  max: number;
  regenRate: number;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({ current, max, regenRate }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="fixed top-4 left-4 w-48 bg-black/50 p-2 rounded-lg">
      <div className="flex justify-between text-xs text-white mb-1">
        <span>Energy</span>
        <span>{Math.round(current)}/{max} (+{regenRate}/s)</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 rounded-full
            ${percentage > 66 ? 'bg-blue-500' :
              percentage > 33 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}; 