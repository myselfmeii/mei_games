import React, { memo, useMemo } from 'react';

const Leaderboard = memo(({ players, scores, currentRound, className = '' }) => {
  const sortedPlayers = useMemo(() => {
    return players
      .map(player => ({
        ...player,
        score: scores[player.name] || 0
      }))
      .sort((a, b) => b.score - a.score);
  }, [players, scores]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <div className={`leaderboard ${className}`}>
      <h3>🏆 LEADERBOARD {currentRound ? `AFTER ROUND ${currentRound}` : ''}</h3>
      
      <div className="leaderboard-list">
        {sortedPlayers.map((player, index) => (
          <div key={player.name} className={`leaderboard-item ${index === 0 ? 'leader' : ''}`}>
            <div className="player-rank">
              <span className="rank-icon">{getRankIcon(index)}</span>
              <span className="rank-number">{index + 1}</span>
            </div>
            
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              {player.isHost && <span className="host-badge">HOST</span>}
            </div>
            
            <div className="player-score">{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

Leaderboard.displayName = 'Leaderboard';

export default Leaderboard;
