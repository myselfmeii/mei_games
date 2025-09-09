import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import CreateRoom from './CreateRoom';
import Lobby from './Lobby';
import GameBoard from './GameBoard';
import Results from './Results';
import FinalResults from './FinalResults';
import { useGameState } from './useGameState';
import './styles.css';

const NPAT = () => {
  const gameContext = useGameState();

  return (
    <div className="npat-app">
      <Routes>
        <Route index element={<Landing gameContext={gameContext} />} />
        <Route path="create" element={<CreateRoom gameContext={gameContext} />} />
        <Route path="lobby/:roomCode" element={<Lobby gameContext={gameContext} />} />
        <Route path="game/:roomCode" element={<GameBoard gameContext={gameContext} />} />
        <Route path="results/:roomCode" element={<Results gameContext={gameContext} />} />
        <Route path="final/:roomCode" element={<FinalResults gameContext={gameContext} />} />
        <Route path="*" element={<Navigate to="/npat" replace />} />
      </Routes>
    </div>
  );
};

export default NPAT;
