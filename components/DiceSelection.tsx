import React from 'react';
import { Dices } from 'lucide-react';

interface DiceSelectionProps {
  onSelect: (count: number) => void;
}

const DiceSelection: React.FC<DiceSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-700">
      <div className="mb-12 text-center">
        <Dices className="w-20 h-20 mx-auto mb-6 text-white opacity-90" />
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">MonoDice</h1>
        <p className="text-gray-300">Select the number of dice to start</p>
        {/* Changed text color from zinc-600 to white/30 for visibility on green background */}
        <p className="text-xs text-white/30 mt-2 font-medium tracking-widest uppercase">
          Allan drinking game series
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onSelect(num)}
            className="group relative flex items-center justify-between w-full p-4 bg-black/40 border border-white/10 rounded-xl hover:bg-black/60 hover:border-white/20 transition-all duration-300 active:scale-95 backdrop-blur-md"
          >
            <span className="text-xl font-medium text-white group-hover:pl-2 transition-all">
              {num} {num === 1 ? 'Die' : 'Dice'}
            </span>
            <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
              {Array.from({ length: num }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full" />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiceSelection;