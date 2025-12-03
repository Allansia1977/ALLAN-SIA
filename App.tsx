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
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black">
      {appState === AppState.SELECTION ? (
        <DiceSelection onSelect={handleSelectDice} />
      ) : (
        <GameScreen diceCount={diceCount} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
