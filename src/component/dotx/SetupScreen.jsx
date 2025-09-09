import React, { useContext } from 'react';
import { GameContext } from './GameContext';
import { PREDEFINED_COLORS } from './constants';
import { useNavigate } from 'react-router-dom';


const SetupScreen = () => {
    const { appState, appDispatch, handleExit } = useContext(GameContext);
    const { players, gridSize } = appState;
    
    const gridOptions = [5, 6, 8, 10, 12, 15, 18, 20];
    const playerOptions = Array.from({ length: 9 }, (_, i) => i + 2);

    const handlePlayerCountChange = (count) => {
        const newPlayers = JSON.parse(JSON.stringify(players.slice(0, count)));
        while (newPlayers.length < count) {
            newPlayers.push({ name: '', color: PREDEFINED_COLORS[newPlayers.length % PREDEFINED_COLORS.length] });
        }
        appDispatch({ type: 'UPDATE_PLAYERS', payload: newPlayers });
    };

    const handlePlayerInfoChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], name: value };
        appDispatch({ type: 'UPDATE_PLAYERS', payload: newPlayers });
    };

    const handleStartGame = () => {
        if (players.some(p => !p.name.trim())) {
            alert("Please enter a name for every player.");
            return;
        }

        const playerNames = players.map(p => p.name.trim().toLowerCase());
        const uniquePlayerNames = new Set(playerNames);

        if (uniquePlayerNames.size < playerNames.length) {
            alert("Player names must be unique. Please check for duplicates.");
            return;
        }

        appDispatch({ type: 'START_GAME' });
    };
    
 const navigate = useNavigate();
  const handleExitToHome = () => {
        handleExit();
        navigate('/');
    };
    

    return (
        <div className="setup-container">
            <div className="card">
                <h1 className="game-title">Dots and Boxes</h1>
                <div className="controls-section">
                    <div className="select-control"><label>Players:</label><select className="grid-select" value={players.length} onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}>{playerOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                    <div className="select-control"><label>Grid Size:</label><select className="grid-select" value={gridSize} onChange={(e) => appDispatch({ type: 'UPDATE_GRID_SIZE', payload: parseInt(e.target.value) })}>{gridOptions.map(size => <option key={size} value={size}>{size}x{size}</option>)}</select></div>
                </div>
                <div className="input-section">{players.map((player, index) => (<div className="player-input-row" key={index}><div className="color-display" style={{ backgroundColor: player.color }}></div><input className="input-field" type="text" placeholder={`Player ${index + 1} Name`} value={player.name} onChange={(e) => handlePlayerInfoChange(index, e.target.value)} /></div>))}</div>
                <div className="button-group">
                    <button className="btn-primary" onClick={handleStartGame}>Start Game</button>
                    <button className="btn-secondary" onClick={handleExit}>Reset</button>
                    <button className="btn-exit" onClick={handleExitToHome} >Exit</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SetupScreen);