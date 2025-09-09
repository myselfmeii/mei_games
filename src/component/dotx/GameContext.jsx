import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { appReducer, initialAppState } from './appReducer';
import { gameReducer, initialGameState } from './gameReducer';
import { SAVE_KEY } from './constants';

export const GameContext = createContext();

const usePersistentReducer = (reducer, initialState, storageKey) => {
    const getInitial = () => {
        try {
            const savedState = localStorage.getItem(storageKey);
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) { console.error("Failed to parse saved state.", error); }
        return initialState;
    };

    const [state, dispatch] = useReducer(reducer, getInitial());

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) { console.error("Failed to save state.", error); }
    }, [state, storageKey]);

    return [state, dispatch];
};


export const GameProvider = ({ children }) => {
    const [appState, appDispatch] = usePersistentReducer(appReducer, initialAppState, SAVE_KEY);
    
    const getInitialGameData = () => {
        try {
            const savedState = localStorage.getItem(`${SAVE_KEY}_inGame`);
            if (savedState && appState.gameState === 'playing') {
                const parsed = JSON.parse(savedState);
                parsed.links = new Map(parsed.links); // Rehydrate Map
                return parsed;
            }
        } catch(e) { console.error("Failed to load in-game data", e); }
        return initialGameState;
    }

    const [gameState, gameDispatch] = useReducer(gameReducer, getInitialGameData());
    
    useEffect(() => {
        if (appState.gameState === 'playing') {
            try {
                const stateToSave = { ...gameState, links: Array.from(gameState.links.entries()) };
                localStorage.setItem(`${SAVE_KEY}_inGame`, JSON.stringify(stateToSave));
            } catch (error) { console.error("Failed to save in-game state.", error); }
        }
    }, [gameState, appState.gameState]);


    useEffect(() => {
        if(appState.gameState === 'playing') {
            const savedData = getInitialGameData();
            if(savedData === initialGameState) { 
                gameDispatch({ type: 'INITIALIZE', payload: { playerCount: appState.players.length } });
            }
        }
    }, [appState.gameState, appState.players.length]);


    const handleExit = () => {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(`${SAVE_KEY}_inGame`);
        appDispatch({ type: 'RESET_SETTINGS' });
        gameDispatch({ type: 'INITIALIZE', payload: { playerCount: initialAppState.players.length } });
    };

    const value = useMemo(() => ({
        appState,
        appDispatch,
        gameState,
        gameDispatch,
        handleExit 
    }), [appState, gameState]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};