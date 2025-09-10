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

            // --- CHECKPOINT 5 ---
            console.log(`%cCheckpoint 5: Reducer received DRAW_LINE. Found ${createdSquares.length} square(s).`, "color: orange; font-weight: bold;");
            
            const newLinks = new Map(state.links);
            newLinks.set(newLink.key, newLink.data);

            const newScores = [...state.scores];
            let nextTurn = state.turn;
            if (createdSquares.length > 0) {
                newScores[state.turn] += createdSquares.length;
                console.log(`%cScore updated for player ${state.turn}. New score: ${newScores[state.turn]}. Player gets another turn.`, "color: orange;");
            } else {
                nextTurn = (state.turn + 1) % players.length;
                console.log(`%cNo score. Advancing to next player: ${nextTurn}.`, "color: orange;");
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
            throw new Error();
    }
}