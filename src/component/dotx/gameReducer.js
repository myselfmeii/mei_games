export const initialGameState = {
    scores: [],
    turn: 0,
    winner: null,
    links: new Map(),
    squares: [],
};

export function gameReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE':
            return { ...initialGameState, scores: Array(action.payload.playerCount).fill(0) };
        case 'DRAW_LINE': {
            const { newLink, createdSquares, players, gridSize } = action.payload;
            const newLinks = new Map(state.links);
            newLinks.set(newLink.key, newLink.data);

            const newScores = [...state.scores];
            let nextTurn = state.turn;
            if (createdSquares.length > 0) {
                newScores[state.turn] += createdSquares.length;
            } else {
                nextTurn = (state.turn + 1) % players.length;
            }

            const newSquaresArray = [...state.squares, ...createdSquares];
            const maxSquares = (gridSize - 1) * (gridSize - 1);
            let newWinner = null;
            if (newSquaresArray.length === maxSquares) {
                const maxScore = Math.max(...newScores);
                const winners = players.filter((p, i) => newScores[i] === maxScore);
                newWinner = winners.length > 1 ? "It's a Tie!" : `${winners[0].name} Wins!`;
            }
            
            return { ...state, links: newLinks, squares: newSquaresArray, scores: newScores, turn: nextTurn, winner: newWinner };
        }
        default:
             throw new Error(`Unknown action type: ${action.type}`);
    }
}