import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = ({ gameContext }) => {
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomStatus, setRoomStatus] = useState(null);
  const navigate = useNavigate();
  const { isJoining } = gameContext;

  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCreateRoom = useCallback(async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      gameContext.resetGameState();
      gameContext.setPlayerName(nickname.trim());
      navigate('/npat/create');
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  }, [nickname, gameContext, navigate]);

  const handleCheckRoom = useCallback(async () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');
    setRoomStatus(null);

    try {
      const status = await gameContext.checkRoomStatus(joinCode.trim().toUpperCase());
      
      if (!status.exists) {
        setError('Room not found');
        setRoomStatus(null);
        return;
      }

      setRoomStatus(status);
      
      
      
    } catch (err) {
      setError('Failed to check room status');
      setRoomStatus(null);
    } finally {
      setLoading(false);
    }
  }, [joinCode, gameContext]);

  const handleJoinRoom = useCallback(async () => {
    if (!nickname.trim() || !joinCode.trim()) {
      setError('Please enter both nickname and room code');
      return;
    }

    if (!roomStatus || !roomStatus.canJoin) {
      setError('Cannot join this room');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await gameContext.joinRoom(nickname.trim(), joinCode.trim().toUpperCase());
      navigate(`/npat/lobby/${joinCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  }, [nickname, joinCode, gameContext, navigate, roomStatus]);

  const shouldShowCreateButton = !isJoining && (!roomStatus || !roomStatus.canJoin);
  const shouldShowJoinButton = roomStatus && roomStatus.canJoin && !isJoining;

  return (
    <div className="landing-container">
      <div className="landing-card">
        <div className="page-header">
          <button 
            className="btn-danger exit-btn"
            onClick={handleExit}
            title="Exit to Home"
          >
            🚪 Exit
          </button>
        </div>

        <h1 className="game-title">Name Place Animal Thing</h1>
        
        <div className="input-section">
          <label htmlFor="nickname">Enter Nickname</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
            maxLength={20}
            disabled={loading || isJoining}
          />
        </div>

        {shouldShowCreateButton && (
          <button 
            className="btn-primary"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? 'Creating...' : '🎮 Create Room'}
          </button>
        )}

        {isJoining && (
          <div className="joining-status">
            <p>🔄 Joining room...</p>
          </div>
        )}

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="join-section">
          <label htmlFor="roomCode">Room Code</label>
          <div className="room-check-section">
            <input
              id="roomCode"
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setRoomStatus(null);
                setError('');
              }}
              placeholder="Enter room code"
              maxLength={6}
              disabled={loading || isJoining}
            />
            
            <button 
              className="btn-secondary check-btn"
              onClick={handleCheckRoom}
              disabled={loading || !joinCode.trim() || isJoining}
            >
              {loading ? '🔍' : '🔍 Check'}
            </button>
          </div>

          {roomStatus && (
            <div className={`room-status ${roomStatus.canJoin ? 'available' : 'unavailable'}`}>
              <h4>📋 Room Status:</h4>
              <p><strong>Players:</strong> {roomStatus.playerCount}/8</p>
              <p><strong>Status:</strong> {roomStatus.status}</p>
              {roomStatus.players && roomStatus.players.length > 0 && (
                <p><strong>Players in room:</strong> {roomStatus.players.join(', ')}</p>
              )}
              
              {roomStatus.canJoin ? (
                <p className="status-message available">✅ Room available to join!</p>
              ) : (
                <p className="status-message unavailable">
                  ❌ {roomStatus.status !== 'waiting' 
                    ? 'Game already in progress - you can create a new room' 
                    : 'Room is full - you can create a new room'}
                </p>
              )}
            </div>
          )}
          
          {shouldShowJoinButton && (
            <button 
              className="btn-secondary join-btn"
              onClick={handleJoinRoom}
              disabled={loading || isJoining}
            >
              {loading ? 'Joining...' : '🎯 Join Room'}
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Landing;
