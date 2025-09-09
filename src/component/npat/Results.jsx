import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from './PageTransition';
import PlayerDisconnectNotification from './PlayerDisconnectNotification';

const Results = ({ gameContext }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { gameState, isHost, disconnectedPlayers, playerLeftMessages } = gameContext;
  const [countdown, setCountdown] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (gameState.status === 'playing') {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(`/npat/game/${roomCode}`);
      }, 800);
    } else if (gameState.status === 'final') {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(`/npat/final/${roomCode}`);
      }, 800);
    }
  }, [gameState.status, navigate, roomCode]);

  useEffect(() => {
    if (gameState.status === 'roundComplete') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.status]);

  const sortedPlayers = useMemo(() => {
    return Object.keys(gameState.players)
      .map(playerName => ({
        name: playerName,
        roundScore: gameState.roundScores?.[playerName] || 0,
        totalScore: gameState.scores?.[playerName] || 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [gameState.players, gameState.roundScores, gameState.scores]);

  if (isTransitioning) {
    const isLastRound = gameState.currentRound >= gameState.totalRounds;
    let transitionText = "Preparing...";
    let subText = "";

    if (gameState.status === 'playing') {
      transitionText = `🎯 Starting Round ${gameState.currentRound}`;
      subText = "Get ready for the next challenge!";
    } else if (gameState.status === 'final') {
      transitionText = "🏆 Preparing Final Results";
      subText = "Calculating final scores and rankings";
    }

    return (
      <PageTransition
        isLoading={true}
        loadingText={transitionText}
        loadingSubText={subText}
      />
    );
  }

  if (gameState.status !== 'roundComplete') {
    return (
      <PageTransition
        isLoading={true}
        loadingText="📊 Loading results..."
        loadingSubText="Processing round data and calculating scores"
      />
    );
  }

  const isLastRound = gameState.currentRound >= gameState.totalRounds;

  return (
    <PageTransition isLoading={false}>
      <div className="results-container">
        <PlayerDisconnectNotification 
          playerLeftMessages={playerLeftMessages}
          gameState={gameState}
        />

        <div className="results-header">
          <h2>🎲 ROUND {gameState.currentRound} RESULTS - LETTER: {gameState.currentLetter}</h2>
        </div>

        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Name</th>
                <th>Place</th>
                <th>Animal</th>
                <th>Thing</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map(player => (
                <tr key={player.name}>
                  <td>{player.name}</td>
                  {['name', 'place', 'animal', 'thing'].map(category => {
                    const answer = gameState.answers?.[player.name]?.[category] || '';
                    const isDuplicate = gameState.duplicates?.[category]?.[answer?.toLowerCase().trim()]?.includes(player.name);
                    
                    return (
                      <td key={category} className={isDuplicate ? 'duplicate' : 'unique'}>
                        {answer}
                        {answer && (isDuplicate ? '❌(-25)' : '✅(25)')}
                      </td>
                    );
                  })}
                  <td className="score">{player.roundScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Object.keys(gameState.duplicates || {}).length > 0 && (
          <div className="duplicates-section">
            <h3>🔍 DUPLICATES:</h3>
            {Object.entries(gameState.duplicates).map(([category, categoryDupes]) => (
              <div key={category}>
                {Object.entries(categoryDupes).map(([answer, players]) => (
                  <p key={answer}>
                    • {answer}: {players.join(', ')} (-25 each)
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="leaderboard-section">
          <h3>🏆 LEADERBOARD AFTER ROUND {gameState.currentRound}</h3>
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Player</th>
                <th>Round {gameState.currentRound}</th>
                <th>Total</th>
                <th>Rank</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={player.name}>
                  <td>{player.name}</td>
                  <td>{player.roundScore}</td>
                  <td>{player.totalScore}</td>
                  <td>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    {index + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {disconnectedPlayers.length > 0 && (
          <div className="disconnected-section">
            <h3>👋 Players Who Left:</h3>
            <div className="disconnected-players">
              {disconnectedPlayers.map(name => (
                <span key={name} className="disconnected-player-tag">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="auto-advance-section">
          <div className="countdown-display">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            
            {isLastRound ? (
              <div className="countdown-text">
                <h3>🎉 Game Complete!</h3>
                <p>Showing final results in {countdown}s...</p>
                <div className="final-game-info">
                  <span>🏆 Time to see who won!</span>
                </div>
              </div>
            ) : (
              <div className="countdown-text">
                <h3>🎯 Next Round Starting Soon!</h3>
                <p>Round {gameState.currentRound + 1} begins in {countdown}s...</p>
                <div className="next-round-info">
                  <span>Get ready for the next letter! 🎲</span>
                </div>
              </div>
            )}
          </div>
          
          {isHost && (
            <button 
              className="btn-secondary skip-btn" 
              onClick={() => navigate(`/npat/lobby/${roomCode}`)}
            >
              End Game Early
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Results;
