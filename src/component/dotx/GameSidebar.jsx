import React from 'react';

const GameSidebar = ({ players, scores, turn, onExitGame }) => (
    <div className="game-sidebar">
        <div className="player-list">
            {players.map((player, index) => (
                <div key={index} className={`player-info ${turn === index ? 'active-turn' : ''}`} style={{borderColor: turn === index ? player.color : '#e1e5e9', boxShadow: turn === index ? `0 0 15px ${player.color}55` : 'none'}}>
                    <span className="player-name">{player.name}</span>
                    <span className="player-score" style={{color: player.color}}>{scores[index] || 0}</span>
                </div>
            ))}
        </div>
        <div className="game-footer"><button className="btn-secondary exit-btn" onClick={onExitGame}>Exit & Reset</button></div>
    </div>
);

export default React.memo(GameSidebar);