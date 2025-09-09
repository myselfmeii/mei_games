import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTimer } from './useTimer';
import PageTransition from './PageTransition';
import PlayerDisconnectNotification from './PlayerDisconnectNotification';
import Navigation from './Navigation';

const GameBoard = ({ gameContext }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { 
    gameState, 
    playerName, 
    submitAnswers, 
    isHost, 
    processRoundComplete, 
    leaveRoom,
    disconnectedPlayers,
    playerLeftMessages
  } = gameContext;
  
  const [answers, setAnswers] = useState({
    name: '',
    place: '',
    animal: '',
    thing: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState(false);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const onTimerComplete = useCallback(() => {
    if (!submitted && !isLeaving) {
      submitAnswers(answers);
      setSubmitted(true);
    }
  }, [answers, submitted, submitAnswers, isLeaving]);

  const { timeLeft, isRunning, startTimer, resetTimer, stopTimer } = useTimer(
    gameState.timerDuration,
    onTimerComplete
  );

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound > 0 && !isLeaving) {
      const isNewRound = gameState.currentRound !== gameStateRef.current?.currentRound;
      
      if (isNewRound && gameStateRef.current?.currentRound > 0) {
        setShowRoundTransition(true);
        setTimeout(() => {
          setShowRoundTransition(false);
          resetTimer(gameState.timerDuration);
          startTimer();
          setSubmitted(false);
          setAnswers({ name: '', place: '', animal: '', thing: '' });
        }, 1000);
      } else {
        resetTimer(gameState.timerDuration);
        startTimer();
        setSubmitted(false);
        setAnswers({ name: '', place: '', animal: '', thing: '' });
      }
      
      setIsTransitioning(false);
    }
  }, [gameState.currentRound, gameState.timerDuration, resetTimer, startTimer, isLeaving]);

  useEffect(() => {
    if (gameState.status === 'final') {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(`/npat/final/${roomCode}`);
      }, 800);
    } else if (gameState.status === 'waiting') {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(`/npat/lobby/${roomCode}`);
      }, 500);
    }
  }, [gameState.status, navigate, roomCode]);

  useEffect(() => {
    const remainingPlayersCount = Object.keys(gameState.players || {}).length;
    
    if (remainingPlayersCount === 1 && remainingPlayersCount > 0) {
      const winner = Object.keys(gameState.players)[0];
      
      setTimeout(() => {
        if (winner === playerName) {
          alert('🎉 Congratulations! You won because all other players left the game!');
        }
        navigate(`/npat/final/${roomCode}`);
      }, 3000);
    }
  }, [gameState.players, playerName, navigate, roomCode]);

  const handleAnswerChange = useCallback((category, value) => {
    if (!submitted && !isLeaving && !showRoundTransition) {
      setAnswers(prev => ({ ...prev, [category]: value }));
    }
  }, [submitted, isLeaving, showRoundTransition]);

  const handleSubmit = useCallback(() => {
    if (!submitted && !isLeaving && !showRoundTransition) {
      submitAnswers(answers);
      setSubmitted(true);
    }
  }, [answers, submitted, submitAnswers, isLeaving, showRoundTransition]);

  const submittedPlayers = useMemo(() => {
    return Object.keys(gameState.answers || {});
  }, [gameState.answers]);

  const totalPlayers = useMemo(() => {
    return Object.keys(gameState.players || {}).length;
  }, [gameState.players]);

  const allSubmitted = useMemo(() => {
    return submittedPlayers.length === totalPlayers && totalPlayers > 0;
  }, [submittedPlayers.length, totalPlayers]);

  useEffect(() => {
    if ((allSubmitted || timeLeft === 0) && isHost && gameState.status === 'playing' && !isLeaving && !showRoundTransition) {
      const timer = setTimeout(() => {
        processRoundComplete();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [allSubmitted, timeLeft, isHost, gameState.status, processRoundComplete, isLeaving, showRoundTransition]);

  const handleLeaveGame = useCallback(() => {
    const confirmLeave = window.confirm(
      'Are you sure you want to leave the game? Your progress will be lost.'
    );
    
    if (confirmLeave) {
      setIsLeaving(true);
      stopTimer();
      
      leaveRoom()
        .then(() => {
          navigate('/npat');
        })
        .catch(() => {
          navigate('/npat');
        });
    }
  }, [navigate, stopTimer, leaveRoom]);

  const handleBackToLobby = useCallback(() => {
    if (isHost) {
      const confirmBack = window.confirm(
        'Are you sure you want to go back to lobby? This will reset the game for all players.'
      );
      
      if (confirmBack) {
        navigate(`/npat/lobby/${roomCode}`);
      }
    }
  }, [isHost, navigate, roomCode]);

  if (isLeaving) {
    return (
      <PageTransition
        isLoading={true}
        loadingText="🚪 Leaving game..."
        loadingSubText="Disconnecting from the room"
      />
    );
  }

  if (isTransitioning) {
    let transitionText = "Processing...";
    let subText = "";

    if (gameState.status === 'final') {
      transitionText = "🏆 Game Complete!";
      subText = "Preparing final results and leaderboard";
    } else if (gameState.status === 'waiting') {
      transitionText = "🔄 Returning to Lobby";
      subText = "Taking you back to the waiting room";
    }

    return (
      <PageTransition
        isLoading={true}
        loadingText={transitionText}
        loadingSubText={subText}
      />
    );
  }

  if (showRoundTransition) {
    return (
      <PageTransition
        isLoading={true}
        loadingText={`🎯 Round ${gameState.currentRound} Starting!`}
        loadingSubText={`Get ready for letter: ${gameState.currentLetter}`}
      />
    );
  }

  if (gameState.status !== 'playing') {
    let loadingText = "🎮 Loading game...";
    let subText = "Please wait while we set up your game";

    if (gameState.status === 'waiting') {
      loadingText = "⏳ Waiting to start...";
      subText = "Host will start the game soon";
    }

    return (
      <PageTransition
        isLoading={true}
        loadingText={loadingText}
        loadingSubText={subText}
      />
    );
  }

  const getAnswerValidation = (category, value) => {
    if (!value) return '';
    
    const firstLetter = value.charAt(0).toLowerCase();
    const expectedLetter = gameState.currentLetter.toLowerCase();
    
    if (firstLetter === expectedLetter) {
      return 'valid';
    } else {
      return 'invalid';
    }
  };

  return (
    <PageTransition isLoading={false}>
      <div className="game-board">
        <Navigation gameContext={gameContext} currentPath="game" />

        <PlayerDisconnectNotification 
          playerLeftMessages={playerLeftMessages}
          gameState={gameState}
        />

        <div className="game-header">
          <div className="game-info">
            <h2>🎲 LETTER: <span className="current-letter">{gameState.currentLetter}</span></h2>
            <p>🎯 ROUND <span className="current-round">{gameState.currentRound}</span> OF {gameState.totalRounds}</p>
          </div>
          
          <div className={`timer ${timeLeft <= 10 ? 'timer-warning' : timeLeft <= 5 ? 'timer-critical' : ''}`}>
            ⏰ <span className="timer-value">{timeLeft}s</span>
          </div>
        </div>

        <div className="answers-section">
          <div className="answers-header">
            <h3>📝 ENTER ANSWERS:</h3>
            <div className="submission-status">
              {submitted ? (
                <span className="status-submitted">✅ Submitted!</span>
              ) : (
                <span className="status-pending">⏳ Pending submission</span>
              )}
            </div>
          </div>
          
          <div className="answers-grid">
            {['name', 'place', 'animal', 'thing'].map(category => {
              const validation = getAnswerValidation(category, answers[category]);
              
              return (
                <div key={category} className="answer-row">
                  <label className="answer-label">
                    <span className="category-icon">
                      {category === 'name' ? '👤' : 
                       category === 'place' ? '📍' : 
                       category === 'animal' ? '🐾' : '📦'}
                    </span>
                    <span className="category-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}:
                    </span>
                    <span className="points">(25 pts)</span>
                  </label>
                  
                  <div className="answer-input-container">
                    <input
                      type="text"
                      value={answers[category]}
                      onChange={(e) => handleAnswerChange(category, e.target.value)}
                      placeholder={`${category} starting with ${gameState.currentLetter}...`}
                      disabled={submitted || timeLeft === 0 || isLeaving || showRoundTransition}
                      className={`answer-input ${validation}`}
                      maxLength={50}
                    />
                    
                    {answers[category] && (
                      <div className={`validation-indicator ${validation}`}>
                        {validation === 'valid' ? '✅' : '❌'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="game-actions">
            <button 
              className={`btn-primary submit-btn ${submitted ? 'submitted' : ''}`}
              onClick={handleSubmit}
              disabled={submitted || timeLeft === 0 || isLeaving || showRoundTransition}
            >
              {submitted ? '✅ Submitted' : 'Submit Answers'}
            </button>
            
            <div className="secondary-actions">
              {isHost && gameState.currentRound === 1 && (
                <button 
                  className="btn-secondary back-btn"
                  onClick={handleBackToLobby}
                  disabled={isLeaving || showRoundTransition}
                >
                  🔙 Back to Lobby
                </button>
              )}
              
              <button 
                className="btn-danger leave-btn"
                onClick={handleLeaveGame}
                disabled={isLeaving || showRoundTransition}
              >
                {isLeaving ? 'Leaving...' : '🚪 Leave Game'}
              </button>
            </div>
          </div>

          {!submitted && timeLeft > 0 && !showRoundTransition && (
            <div className="answer-tips">
              <h4>💡 Quick Tips:</h4>
              <ul>
                <li>All answers must start with <strong>{gameState.currentLetter}</strong></li>
                <li>Unique answers get +25 points</li>
                <li>Duplicate answers get -25 points</li>
                <li>Empty answers get 0 points</li>
              </ul>
            </div>
          )}
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <h4>👥 PLAYER PROGRESS ({submittedPlayers.length}/{totalPlayers})</h4>
            
            {disconnectedPlayers.length > 0 && (
              <div className="disconnected-info">
                <span className="disconnected-count">
                  {disconnectedPlayers.length} player{disconnectedPlayers.length > 1 ? 's' : ''} left
                </span>
              </div>
            )}

            {timeLeft <= 10 && timeLeft > 0 && (
              <div className="urgency-message">
                ⚠️ {timeLeft} seconds remaining!
              </div>
            )}
          </div>
          
          <div className="player-status-grid">
            {Object.entries(gameState.players).map(([name, player]) => {
              const hasSubmitted = submittedPlayers.includes(name);
              const isCurrentPlayer = name === playerName;
              
              return (
                <div 
                  key={name} 
                  className={`player-status-card ${isCurrentPlayer ? 'current-player' : ''} ${hasSubmitted ? 'submitted' : 'pending'}`}
                >
                  <div className="player-info">
                    <span className="player-name">
                      {name}
                      {player.isHost && ' 👑'}
                      {isCurrentPlayer && ' (You)'}
                    </span>
                  </div>
                  
                  <div className="status-indicator">
                    {hasSubmitted ? (
                      <span className="submitted-badge">✅ Done</span>
                    ) : (
                      <span className="pending-badge">⏳ Writing...</span>
                    )}
                  </div>
                </div>
              );
            })}

            {disconnectedPlayers.map(name => (
              <div key={name} className="player-status-card disconnected">
                <div className="player-info">
                  <span className="player-name">{name}</span>
                </div>
                <div className="status-indicator">
                  <span className="disconnected-badge">❌ Left</span>
                </div>
              </div>
            ))}
          </div>
          
          {allSubmitted && !isLeaving && !showRoundTransition && (
            <div className="all-submitted-message">
              <div className="message-content">
                <h4>🎉 All players submitted!</h4>
                <p>
                  {gameState.currentRound >= gameState.totalRounds
                    ? '🏆 Calculating final results...'
                    : `🎯 Preparing Round ${gameState.currentRound + 1}...`
                  }
                </p>
              </div>
            </div>
          )}

          {timeLeft <= 5 && timeLeft > 0 && !submitted && !showRoundTransition && (
            <div className="timer-warning-message">
              <h4>⏰ TIME'S ALMOST UP!</h4>
              <p>Submit your answers now or they'll be automatically submitted!</p>
            </div>
          )}
        </div>

        <div className="game-stats">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Round:</span>
              <span className="stat-value">{gameState.currentRound}/{gameState.totalRounds}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Letter:</span>
              <span className="stat-value">{gameState.currentLetter}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Active Players:</span>
              <span className="stat-value">{totalPlayers}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Left Players:</span>
              <span className="stat-value">{disconnectedPlayers.length}</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default GameBoard;
