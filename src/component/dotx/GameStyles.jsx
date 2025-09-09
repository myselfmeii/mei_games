import React from 'react';

const GameStyles = () => (
    <style>{`
        @import url("https://fonts.googleapis.com/css?family=Lato:400,400i,700");
        body { margin: 0; min-height: 100vh; background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; font-family: 'Lato', sans-serif;}
        .setup-container { min-height: 100vh; padding: 20px; display: flex; justify-content: center; align-items: center; width: 100%;}
        .card { background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 40px; width: 100%; max-width: 500px; text-align: center; }
        .game-title { font-size: 2.5rem; margin-bottom: 20px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; }
        .input-section { margin-bottom: 20px; text-align: left; max-height: 250px; overflow-y: auto; padding-right: 10px; }
        .player-input-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .color-display { width: 25px; height: 25px; border-radius: 50%; border: 2px solid #e1e5e9; flex-shrink: 0; }
        .input-field { flex-grow: 1; padding: 15px; border: 2px solid #e1e5e9; border-radius: 10px; font-size: 16px; transition: border-color 0.3s; box-sizing: border-box; }
        .input-field:focus { outline: none; border-color: #667eea; }
        .button-group { margin-top: 20px; display: flex; flex-direction: column; gap: 15px; }
        .btn-primary, .btn-secondary, .btn-exit { border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; padding: 15px 30px; text-align: center; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 255, 42, 0); }
        .btn-secondary { background: #f8f9fa; color: #333; border: 2px solid #e1e5e9; }
        .btn-secondary:hover { background: #e9ecef; }
        .btn-exit { background-color: #ff3838; color: white; }
        .btn-exit:hover {   background-color: #c01414ff; color: white; }
        .controls-section { display: flex; flex-direction: column; gap: 20px; margin: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; }
        .select-control { display: flex; justify-content: space-between; align-items: center; width: 100%; color: #555; font: 16px Lato; }
        .grid-select { padding: 8px; border-radius: 6px; border: 2px solid #e1e5e9; font-size: 16px; margin-left: 10px; }
        
        /* New In-Game UI */
        .game-screen-container { width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #f0f2f5; }
        .game-box { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); display: flex; flex-direction: row; align-items: center; gap: 20px; max-width: 95vw; max-height: 95vh;}
        .play-area { position: relative; }
        canvas { background-color: #fff; border: 1px solid #eee; border-radius: 5px; max-width: 100%; max-height: calc(95vh - 40px); object-fit: contain; cursor: pointer; }
        .game-sidebar { display: flex; flex-direction: column; justify-content: space-between; height: 100%; max-height: calc(95vh - 40px); width: 250px; }
        .player-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 10px; }
        
        .player-info { padding: 4px 12px; border-radius: 12px; border: 3px solid #e1e5e9; transition: all 0.3s ease; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .player-info.active-turn { transform: scale(1.05); }
        .player-name { font-weight: bold; font-size: 16px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
        .player-score { font-size: 20px; font-weight: bold; flex-shrink: 0; }
        .game-footer { width: 100%; display: flex; justify-content: center; margin-top: 20px; }
        .exit-btn { width: 100%; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .game-over-modal { background: white; color: #333; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .game-over-modal h2 { font-size: 2rem; margin-bottom: 10px; }
        .game-over-modal h3 { font-size: 1.5rem; margin-bottom: 30px; color: #667eea; }

        @media (max-width: 900px) {
            .game-box { flex-direction: column; height: auto; width: 95vw; }
            .game-sidebar { flex-direction: row; width: 100%; height: auto; align-items: center; justify-content: space-between; }
            .player-list { flex-direction: row; overflow-x: auto; overflow-y: hidden; padding-bottom: 10px; flex-grow: 1; }
            .player-info { flex-shrink: 0; }
            .game-footer { margin-top: 0; width: auto; }
            canvas { max-height: calc(85vh - 100px); }
        }
    `}</style>
);

export default GameStyles;