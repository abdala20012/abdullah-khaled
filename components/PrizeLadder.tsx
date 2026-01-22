
import React from 'react';
import { PRIZES } from '../types';

interface PrizeLadderProps {
  currentLevel: number;
}

const PrizeLadder: React.FC<PrizeLadderProps> = ({ currentLevel }) => {
  return (
    <div className="hidden md:flex flex-col-reverse bg-emerald-950 p-4 rounded-xl border border-yellow-600 shadow-2xl h-full overflow-y-auto">
      {PRIZES.map((prize, index) => {
        const level = index + 1;
        const isActive = level === currentLevel;
        const isPast = level < currentLevel;
        const isSafePoint = level % 5 === 0;

        return (
          <div
            key={level}
            className={`flex items-center gap-4 px-4 py-1 rounded transition-all duration-300 ${
              isActive ? 'bg-yellow-600 text-white scale-105 font-bold shadow-lg' : 
              isPast ? 'text-gray-400' : 
              isSafePoint ? 'text-white border-b border-white/20' : 'text-yellow-500/80'
            }`}
          >
            <span className="w-6 text-left text-xs opacity-50">{level}</span>
            <span className="text-sm">
              {prize} <span className="text-[10px]">ريال</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PrizeLadder;
