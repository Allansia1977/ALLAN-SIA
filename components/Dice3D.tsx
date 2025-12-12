import React, { useEffect, useState, useRef } from 'react';
import { DiceValue } from '../types';

interface Dice3DProps {
  value: DiceValue;
  rolling: boolean;
  rollTrigger: number;
}

// Helper to generate pip positions for a face
const getPips = (val: number) => {
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const map: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return map[val] || [];
};

const DiceFace: React.FC<{ value: number; transform: string }> = ({ value, transform }) => {
  const pips = getPips(value);
  // Red pips for Ace (1) and 4 (traditional asian/casino style often red for 1 and 4)
  const pipColor = (value === 1 || value === 4) ? 'bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]' : 'bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]';

  return (
    <div
      className="absolute w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-200 rounded-2xl border border-gray-300 flex items-center justify-center backface-visible shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]"
      style={{ 
        transform,
        backfaceVisibility: 'hidden', // Hide backfaces for cleaner look when spinning
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {pips.includes(i) && (
              <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full ${pipColor}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dice3D: React.FC<Dice3DProps> = ({ value, rolling, rollTrigger }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Standard Cube Face Transforms (Size 6rem = 96px, translateZ = 48px)
  // We use a fixed internal size and scale the container for responsiveness
  const translateZ = 'translateZ(3rem)'; 

  // Target rotations to bring a specific face to the FRONT
  // Base orientation: Face 1 is Front.
  const getTargetRotation = (val: DiceValue) => {
    switch (val) {
      case 1: return { x: 0, y: 0 };       // Front
      case 6: return { x: 180, y: 0 };     // Back (rotate X 180 flips it vertically)
      case 2: return { x: -90, y: 0 };     // Top (rotate X -90 brings top to front)
      case 5: return { x: 90, y: 0 };      // Bottom
      case 3: return { x: 0, y: -90 };     // Right (rotate Y -90 brings right to front)
      case 4: return { x: 0, y: 90 };      // Left
      default: return { x: 0, y: 0 };
    }
  };

  useEffect(() => {
    // If initial mount (rollTrigger 0), just set position without spin
    if (rollTrigger === 0) {
      setRotation(getTargetRotation(value));
      return;
    }

    if (rolling) {
      const target = getTargetRotation(value);
      
      // Add random extra spins (3 to 6 full rotations) for effect
      // We add to the *current* rotation to ensure continuous spinning direction
      // or alternate. Monotonic increase on axes usually looks cleaner.
      const extraSpinsX = (3 + Math.floor(Math.random() * 3)) * 360;
      const extraSpinsY = (3 + Math.floor(Math.random() * 3)) * 360;

      // To ensure we land on the correct face, we calculate the next multiple of 360 
      // relative to current rotation + target offset.
      
      setRotation(prev => {
        // Calculate new total rotation
        // We want to move 'forward' (positive or negative direction consistently or random)
        // Let's add positive spin
        const newX = prev.x + extraSpinsX + (target.x - (prev.x % 360));
        const newY = prev.y + extraSpinsY + (target.y - (prev.y % 360));
        
        // Correction: The math above might be slightly off due to modular arithmetic on negative numbers.
        // Simplified approach: Just add the big spin to the target base.
        // But we need to account for current rotation to avoid snapping back.
        // Let's just set strictly additive rotations.
        
        return {
          x: prev.x + extraSpinsX + target.x - (prev.x % 360),
          y: prev.y + extraSpinsY + target.y - (prev.y % 360)
        };
      });
    }
  }, [rollTrigger, value, rolling]);

  return (
    // Scale wrapper for responsiveness: smaller on mobile, larger on desktop
    // The internal dice is fixed at w-24 (6rem)
    <div className="transform scale-75 md:scale-110 transition-transform duration-300">
      <div 
        className="w-24 h-24 relative preserve-3d"
        style={{ perspective: '800px' }}
      >
        <div
          className="w-full h-full relative preserve-3d ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: rolling ? 'transform 3s cubic-bezier(0.15, 0.9, 0.35, 1)' : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Face 1: Front */}
          <DiceFace value={1} transform={`rotateY(0deg) ${translateZ}`} />
          
          {/* Face 6: Back */}
          <DiceFace value={6} transform={`rotateX(180deg) ${translateZ}`} />
          
          {/* Face 2: Top */}
          <DiceFace value={2} transform={`rotateX(90deg) ${translateZ}`} />
          
          {/* Face 5: Bottom */}
          <DiceFace value={5} transform={`rotateX(-90deg) ${translateZ}`} />
          
          {/* Face 3: Right */}
          <DiceFace value={3} transform={`rotateY(90deg) ${translateZ}`} />
          
          {/* Face 4: Left */}
          <DiceFace value={4} transform={`rotateY(-90deg) ${translateZ}`} />
        </div>
      </div>
      
      {/* Simple shadow underneath */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/40 blur-md rounded-[100%] transition-all duration-300"
           style={{ 
             opacity: rolling ? 0.2 : 0.6,
             transform: `translateX(-50%) scale(${rolling ? 0.8 : 1})`
           }} 
      />
    </div>
  );
};

export default Dice3D;