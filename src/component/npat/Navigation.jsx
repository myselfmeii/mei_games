import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ gameContext, currentPath }) => {
  const navigate = useNavigate();
  const { roomCode, gameState, isHost, leaveRoom } = gameContext;

  const handleHome = () => {
    const confirmLeave = window.confirm(
      'Are you sure you want to go home? You will leave the current game.'
    );
    
    if (confirmLeave) {
      if (roomCode) {
        leaveRoom().then(() => {
          navigate('/');
        }).catch(() => {
          navigate('/');
        });
      } else {
        navigate('/');
      }
    }
  };

  const handleEndGame = () => {
    if (!isHost) {
      alert('Only the host can end the game.');
      return;
    }

    const confirmEnd = window.confirm(
      'Are you sure you want to end the game for all players?'
    );
    
    if (confirmEnd) {
      navigate(`/npat/final/${roomCode}`);
    }
  };

  const handleCurrentMatch = () => {
    if (roomCode) {
      if (gameState.status === 'playing') {
        navigate(`/npat/game/${roomCode}`);
      } else if (gameState.status === 'waiting') {
        navigate(`/npat/lobby/${roomCode}`);
      } else if (gameState.status === 'final') {
        navigate(`/npat/final/${roomCode}`);
      }
    } else {
      navigate('/npat');
    }
  };

  return (
    <nav className="game-navigation">
      <button 
        className="nav-btn home-btn"
        onClick={handleHome}
        title="Go to Home"
      >
        🏠 Home
      </button>
      
      {roomCode && (
        <button 
          className="nav-btn match-btn"
          onClick={handleCurrentMatch}
          title="Go to Current Match"
        >
          🎮 Match
        </button>
      )}
      
      {roomCode && isHost && gameState.status === 'playing' && (
        <button 
          className="nav-btn end-btn"
          onClick={handleEndGame}
          title="End Game (Host Only)"
        >
          🏁 End Game
        </button>
      )}
    </nav>
  );
};

export default Navigation;
