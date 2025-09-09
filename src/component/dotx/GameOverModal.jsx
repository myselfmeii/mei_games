import React from 'react';

const GameOverModal = ({ winner, onExitGame }) => (
    <div className="modal-overlay">
        <div className="game-over-modal">
            <h2>Game Over</h2>
            <h3>{winner}</h3>
            <button className="btn-primary" onClick={onExitGame}>Play Again</button>
        </div>
    </div>
);

export default React.memo(GameOverModal);