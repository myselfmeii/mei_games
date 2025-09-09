import React from 'react';

const PlayerDisconnectNotification = ({ playerLeftMessages, gameState }) => {
  const remainingPlayersCount = Object.keys(gameState.players || {}).length;
  
  if (remainingPlayersCount === 1 && Object.keys(gameState.players).length > 0) {
    const winner = Object.keys(gameState.players)[0];
    return (
      <div className="winner-notification">
        <div className="winner-content">
          <div className="winner-icon">🏆</div>
          <h3>{winner} Wins!</h3>
          <p>All other players have left the game</p>
          <div className="winner-celebration">🎉 Congratulations! 🎉</div>
        </div>
      </div>
    );
  }

  if (playerLeftMessages.length === 0) return null;

  return (
    <div className="disconnect-notifications">
      {playerLeftMessages.map(message => (
        <div key={message.id} className="disconnect-message">
          <span className="disconnect-icon">👋</span>
          <div className="disconnect-content">
            <span className="disconnect-text">
              <strong>{message.playerName}</strong> has left the game
            </span>
            <span className="disconnect-time">
              {remainingPlayersCount > 1 ? 'Game continues with remaining players...' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerDisconnectNotification;
