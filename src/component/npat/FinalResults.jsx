import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerDisconnectNotification from './PlayerDisconnectNotification';
import Navigation from './Navigation';

const FinalResults = ({ gameContext }) => {
  const { gameState, playerLeftMessages } = gameContext;
  const navigate = useNavigate();

  const finalScores = useMemo(() => {
    return Object.keys(gameState.players)
      .map(playerName => ({
        name: playerName,
        score: gameState.scores?.[playerName] || 0
      }))
      .sort((a, b) => b.score - a.score);
  }, [gameState.players, gameState.scores]);

  const winner = finalScores[0];

  const stats = useMemo(() => {
    const totalRoundsPlayed = gameState.currentRound;
    const avgScore = finalScores.reduce((sum, p) => sum + p.score, 0) / finalScores.length;
    
    return {
      totalRoundsPlayed,
      avgScore: Math.round(avgScore),
      highestScore: winner?.score || 0,
      totalPlayers: Object.keys(gameState.players).length,
      playersLeft: gameContext.disconnectedPlayers?.length || 0
    };
  }, [finalScores, winner, gameState, gameContext.disconnectedPlayers]);

  const handlePlayAgain = () => {
    navigate('/npat');
  };

  const handleNewRoom = () => {
    navigate('/npat');
  };

  const handleExit = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit? You will leave the game results.'
    );
    
    if (confirmExit) {
      navigate('/');
    }
  };

  return (
    <div className="final-results-container">
      <PlayerDisconnectNotification 
        playerLeftMessages={playerLeftMessages}
        gameState={gameState}
      />
      
      <div className="final-results-card">
        <Navigation gameContext={gameContext} currentPath="final" />

        <div className="winner-announcement">
          <h1>🎉 GAME COMPLETE!</h1>
          {winner && (
            <h2>🏆 {winner.name.toUpperCase()} WINS WITH {winner.score} POINTS!</h2>
          )}
          <p className="game-summary">
            {stats.totalRoundsPlayed} rounds completed with {stats.totalPlayers} players
          </p>
        </div>

        <div className="final-scoreboard">
          <h3>🏆 FINAL LEADERBOARD:</h3>
          <table className="final-scores-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Final Score</th>
                <th>Avg Per Round</th>
              </tr>
            </thead>
            <tbody>
              {finalScores.map((player, index) => (
                <tr key={player.name} className={index === 0 ? 'winner-row' : ''}>
                  <td className="rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </td>
                  <td className="player-name">{player.name}</td>
                  <td className="final-score">{player.score}</td>
                  <td className="avg-score">
                    {Math.round(player.score / stats.totalRoundsPlayed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gameContext.disconnectedPlayers?.length > 0 && (
          <div className="disconnected-players-final">
            <h3>👋 Players Who Left During Game:</h3>
            <div className="disconnected-list">
              {gameContext.disconnectedPlayers.map(name => (
                <span key={name} className="disconnected-tag">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="game-stats">
          <h3>📈 GAME STATISTICS:</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Rounds Played:</span>
              <span className="stat-value">{stats.totalRoundsPlayed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Players:</span>
              <span className="stat-value">{stats.totalPlayers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Score:</span>
              <span className="stat-value">{stats.avgScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Highest Score:</span>
              <span className="stat-value">{stats.highestScore}</span>
            </div>
            {stats.playersLeft > 0 && (
              <div className="stat-item">
                <span className="stat-label">Players Left:</span>
                <span className="stat-value">{stats.playersLeft}</span>
              </div>
            )}
          </div>
        </div>

        <div className="final-actions">
          <button className="btn-primary" onClick={handlePlayAgain}>
            🎮 Play Again
          </button>
          <button className="btn-secondary" onClick={handleNewRoom}>
            🏠 New Room
          </button>
          <button className="btn-danger" onClick={handleExit}>
            🚪 Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalResults;
