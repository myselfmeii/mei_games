import { PREDEFINED_COLORS } from './constants';


export const initialAppState = {
    gameState: "setup",
    players: [{ name: '', color: PREDEFINED_COLORS[0] }, { name: '', color: PREDEFINED_COLORS[1] }],
    gridSize: 5,
};

export function appReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            return { ...state, gameState: 'playing' };
        case 'EXIT_GAME':
            return { ...state, gameState: 'setup' };
        case 'RESET_SETTINGS':
            return { ...initialAppState };
        case 'UPDATE_PLAYERS':
            return { ...state, players: action.payload };
        case 'UPDATE_GRID_SIZE':
            return { ...state, gridSize: action.payload };
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}