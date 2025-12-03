import React, { useEffect, useState, useMemo } from 'react';
import { DiceValue } from '../types';

interface Dice3DProps {
  value: DiceValue;
  rolling: boolean;
  rollTrigger: number;
}

// Map dice values to visible pip positions in a 3x3 grid
// Grid indices: 0-8
// 0 1 2
// 3 4 5
// 6 7 8
const PIPS: Record<DiceValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const Dice3D: React.FC<Dice3DProps> = ({ value, rolling, rollTrigger }) => {
  const [displayValue, setDisplayValue] = useState<DiceValue>(value);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // If not rolling, ensure we display the correct final value
    if (!rolling) {
      setDisplayValue(value);
      setRotation(0);
      setScale(1);
      return;
    }

    const duration = 3000; // 3 seconds total roll time
    const intervalTime = 100; // Change face every 100ms
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        clearInterval(intervalId);
        setDisplayValue(value);
        setRotation(0);
        setScale(1);
      } else {
        // Show random face
        setDisplayValue((Math.floor(Math.random() * 6) + 1) as DiceValue);
        
        // Random slight rotation for "shaking" effect (-15 to 15 degrees)
        setRotation(Math.random() * 30 - 15);
        
        // Slight pulse scale
        setScale(0.95 + Math.random() * 0.1);
      }
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [rollTrigger, value, rolling]);

  const pips = PIPS[displayValue];
  
  // Determine pip color based on value (Red for 1 and 4, Black for others)
  const pipColor = (displayValue === 1 || displayValue === 4) 
    ? 'bg-red-600' 
    : 'bg-black';

  return (
    <div className="p-2 transition-all duration-100 ease-out" 
         style={{ 
           transform: `rotate(${rotation}deg) scale(${scale})` 
         }}>
      <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-2xl shadow-lg border-2 border-gray-300 flex items-center justify-center relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
        
        {/* Pips Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 md:gap-2 w-full h-full p-3 md:p-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              {pips.includes(i) && (
                <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full shadow-sm ${pipColor}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dice3D;