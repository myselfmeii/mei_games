import React, { useContext } from 'react';
import { GameProvider, GameContext } from './GameContext';
import GameBoard from './GameBoard';
import GameSidebar from './GameSidebar';
import SetupScreen from './SetupScreen';
import GameOverModal from './GameOverModal';
import GameStyles from './GameStyles';

const GameScreen = () => {
    const { appState, gameState, handleExit } = useContext(GameContext);
    
    return (
        <div className="game-screen-container">
            <div className="game-box">
                <GameBoard />
                <GameSidebar 
                    players={appState.players} 
                    scores={gameState.scores} 
                    turn={gameState.turn} 
                    onExitGame={handleExit} 
                />
            </div>
            {gameState.winner && <GameOverModal winner={gameState.winner} onExitGame={handleExit} />}
        </div>
    );
};


const AppContent = () => {
    const { appState } = useContext(GameContext);

    return (
        <>
            <GameStyles />
            {appState.gameState === 'playing' ? <GameScreen /> : <SetupScreen />}
        </>
    );
};

const App = () => {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
};

export default App;