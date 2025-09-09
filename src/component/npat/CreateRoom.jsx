import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = ({ gameContext }) => {
  const [settings, setSettings] = useState({
    timerDuration: 45,
    totalRounds: 15
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const roomCode = await gameContext.createRoom(gameContext.playerName, settings);
      navigate(`/npat/lobby/${roomCode}`);
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  }, [gameContext, settings, navigate]);

  const updateSettings = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBack = useCallback(() => {
    navigate('/npat');
  }, [navigate]);

  return (
    <div className="create-room-container">
      <div className="create-room-card">
        <h2>⚙️ Create Room Settings</h2>
        
        <div className="settings-section">
          <div className="setting-group">
            <label>⏱️ TIMER PER ROUND:</label>
            <div className="timer-options">
              {[30, 45, 60].map(time => (
                <button
                  key={time}
                  className={`timer-btn ${settings.timerDuration === time ? 'active' : ''}`}
                  onClick={() => updateSettings('timerDuration', time)}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>🎯 TOTAL ROUNDS:</label>
            <div className="rounds-options">
              {[10, 15, 20, 25].map(rounds => (
                <button
                  key={rounds}
                  className={`rounds-btn ${settings.totalRounds === rounds ? 'active' : ''}`}
                  onClick={() => updateSettings('totalRounds', rounds)}
                >
                  {rounds}
                </button>
              ))}
            </div>
          </div>

          <div className="scoring-rules">
            <h3>📏 SCORING RULES:</h3>
            <ul>
              <li>• Each category = 25 points</li>
              <li>• Duplicate answers = -25 points</li>
              <li>• Max per round = 100 points</li>
            </ul>
          </div>
        </div>

        <div className="create-room-actions">
          <button 
            className="btn-primary create-btn"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? 'Creating Room...' : 'Create Room with These Settings'}
          </button>

          <button 
            className="btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default CreateRoom;
