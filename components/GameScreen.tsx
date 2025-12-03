import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import Dice3D from './Dice3D';
import { DiceValue } from '../types';

// --- Sound Synthesis Helpers ---

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
};

const playClickSound = (ctx: AudioContext) => {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // High pitch short blip
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
  
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(t + 0.1);
};

const playDiceRollSound = (ctx: AudioContext) => {
  const t = ctx.currentTime;
  
  // Create a reusable noise buffer for impacts
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // Generate impacts for 3 seconds of rolling
  // Increased count and spread compared to previous version
  const impactCount = 15 + Math.floor(Math.random() * 10); 

  for (let i = 0; i < impactCount; i++) {
    // Spread impacts over ~2.9 seconds
    // Using power curve to cluster them slightly more at the start but keep them going
    const offset = Math.pow(Math.random(), 1.2) * 2.9; 
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Vary the pitch
    source.playbackRate.value = 0.8 + Math.random() * 0.6;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800 + Math.random() * 1000;
    filter.Q.value = 0.5;
    
    const gain = ctx.createGain();
    // Volume envelope
    const volumeScale = (1 - (offset / 3.0)) * 0.4;
    
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(Math.max(0, volumeScale), t + offset + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(t + offset);
  }
};

interface GameScreenProps {
  diceCount: number;
  onReset: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ diceCount, onReset }) => {
  const [values, setValues] = useState<DiceValue[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollTrigger, setRollTrigger] = useState(0);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext lazily
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const initAudioIfNeeded = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = getAudioContext();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Initialize dice with random values on mount (Sorted)
  useEffect(() => {
    const initialValues = Array.from({ length: diceCount }).map(() => 
      (Math.floor(Math.random() * 6) + 1) as DiceValue
    );
    // Sort ascending
    initialValues.sort((a, b) => a - b);
    setValues(initialValues);
  }, [diceCount]);

  const handleRoll = () => {
    if (isRolling) return;

    // Trigger Sound
    const ctx = initAudioIfNeeded();
    if (ctx) playDiceRollSound(ctx);

    setIsRolling(true);
    setRollTrigger(prev => prev + 1);

    // Generate new values immediately
    const newValues = Array.from({ length: diceCount }).map(() => 
      (Math.floor(Math.random() * 6) + 1) as DiceValue
    );
    
    // Sort ascending so they land in order
    newValues.sort((a, b) => a - b);
    
    setValues(newValues);

    // 3 Second Roll Duration
    setTimeout(() => {
      setIsRolling(false);
    }, 3000);
  };

  const handleReset = () => {
    const ctx = initAudioIfNeeded();
    if (ctx) playClickSound(ctx);
    onReset();
  };

  // Determine container constraints based on dice count to force wrapping
  const getContainerWidthClass = () => {
    if (diceCount === 3 || diceCount === 4) {
      // Force 2 items per row
      // Layout goal: 2 top, 1 bottom (for 3) OR 2 top, 2 below (for 4)
      return 'max-w-[15rem] md:max-w-[22rem]';
    }
    if (diceCount === 5) {
      // Force 3 items per row
      // Layout goal: 3 top, 2 below
      return 'max-w-[22rem] md:max-w-[30rem]';
    }
    // 1 or 2 dice: let them fit in one row
    return 'max-w-5xl';
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-black text-white relative">
      {/* Header with Reset Button */}
      <div className="absolute top-0 right-0 p-6 z-10">
        <button 
          onClick={handleReset}
          className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Reset Game"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Main Dice Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`flex flex-wrap justify-center items-center gap-4 transition-all duration-500 ease-in-out ${getContainerWidthClass()}`}>
          {values.map((val, idx) => (
            <Dice3D 
              key={idx} 
              value={val} 
              rolling={isRolling} 
              rollTrigger={rollTrigger}
            />
          ))}
        </div>
      </div>

      {/* Footer with Roll Button */}
      <div className="p-8 pb-12 flex justify-center">
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`
            w-full max-w-xs py-4 px-8 rounded-2xl text-xl font-bold tracking-wide
            transition-all duration-200 transform active:scale-95
            ${isRolling 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }
          `}
        >
          {isRolling ? 'Rolling...' : 'ROLL'}
        </button>
      </div>
    </div>
  );
};

export default GameScreen;