import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';

const GameContent: React.FC = () => {
  const { gameState, playerId, isConnected } = useGame();

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        Loading...
      </div>
    );
  }

  const hasJoined = gameState?.players.some(p => p.id === playerId);

  if (hasJoined) {
    return <GameBoard />;
  }

  return <Lobby />;
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
