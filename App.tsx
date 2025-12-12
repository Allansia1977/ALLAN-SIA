import React, { useState } from 'react';
import DiceSelection from './components/DiceSelection';
import GameScreen from './components/GameScreen';
import { AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SELECTION);
  const [diceCount, setDiceCount] = useState<number>(1);

  const handleSelectDice = (count: number) => {
    setDiceCount(count);
    setAppState(AppState.GAME);
  };

  const handleReset = () => {
    setAppState(AppState.SELECTION);
  };

  return (
    // Applied radial gradient for casino table effect: Felt Green -> Dark Green
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_#35654d_0%,_#1e3b2d_100%)] text-white font-sans antialiased selection:bg-white selection:text-black">
      {appState === AppState.SELECTION ? (
        <DiceSelection onSelect={handleSelectDice} />
      ) : (
        <GameScreen diceCount={diceCount} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;