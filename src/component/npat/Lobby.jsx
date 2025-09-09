import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from './Navigation';

const Lobby = ({ gameContext }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { gameState, playerName, isHost, startGame, leaveRoom } = gameContext;
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (gameState.status === 'playing') {
      navigate(`/npat/game/${roomCode}`);
    } else if (gameState.status === 'final') {
      navigate(`/npat/final/${roomCode}`);
    }
  }, [gameState.status, navigate, roomCode]);

  const handleStartGame = async () => {
    const playerCount = Object.keys(gameState.players).length;
    
    if (playerCount < 2) {
      alert('At least 2 players are required to start the game.');
      return;
    }

    try {
      await startGame();
    } catch (error) {
      alert(`Failed to start game: ${error.message}`);
    }
  };

  const handleLeaveRoom = async () => {
    const confirmLeave = window.confirm(
      'Are you sure you want to leave the room?'
    );
    
    if (confirmLeave) {
      try {
        await leaveRoom();
        navigate('/npat');
      } catch (error) {
        navigate('/npat');
      }
    }
  };

  const copyRoomCode = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(roomCode);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
      setCopying(false);
    }
  };

  const playersList = Object.values(gameState.players || {});
  const isMinPlayersReached = playersList.length >= 2;

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <Navigation gameContext={gameContext} currentPath="lobby" />

        <div className="room-info">
          <h2>🎮 Game Lobby</h2>
          <div className="room-settings">
            <p>⏱️ Timer: {gameState.timerDuration}s per round</p>
            <p>🎯 Rounds: {gameState.totalRounds}</p>
            <p>👥 Players: {playersList.length}/8</p>
          </div>
        </div>

        <div className="players-section">
          <div className="players-header">
            <h3>👥 Players ({playersList.length}/8)</h3>
          </div>
          
          <div className="players-list">
            {playersList.map((player) => (
              <div key={player.name} className="player-item">
                <span className="player-name">
                  {player.name}
                  {player.name === playerName && ' (You)'}
                </span>
                <span className="player-status">
                  {player.isHost ? '👑 Host' : '👤 Player'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!isMinPlayersReached && (
          <div className="waiting-for-players">
            <p>⏳ Waiting for more players...</p>
            <p>At least 2 players needed to start the game</p>
          </div>
        )}

        <div className="lobby-actions">
          {isHost ? (
            <div className="host-actions">
              <button 
                className="btn-primary"
                onClick={handleStartGame}
                disabled={!isMinPlayersReached}
              >
                {isMinPlayersReached ? '🚀 Start Game' : '⏳ Need More Players'}
              </button>
              
              <button 
                className="btn-danger"
                onClick={handleLeaveRoom}
              >
                🚪 Leave Room
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <div className="waiting-message">
                <p>⏳ Waiting for host to start the game...</p>
              </div>
              
              <button 
                className="btn-danger"
                onClick={handleLeaveRoom}
              >
                🚪 Leave Room
              </button>
            </div>
          )}
        </div>

        <div className="room-code-display">
          <p>Share this room code with friends:</p>
          <div className="code-box">{roomCode}</div>
          <button 
            className="btn-secondary copy-code-btn"
            onClick={copyRoomCode}
            disabled={copying}
          >
            {copying ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
