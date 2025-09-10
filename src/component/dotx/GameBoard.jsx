import React, { useRef, useEffect, useCallback, useContext } from 'react';
import { GameContext } from './GameContext';
import { useGameCanvas } from './useGameCanvas';

const getLineKey = (d1, d2) => {
    if (!d1 || !d2) return '';
    if (d1.gy === d2.gy) {
        return d1.gx < d2.gx ? `${d1.gx},${d1.gy}-${d2.gx},${d2.gy}` : `${d2.gx},${d2.gy}-${d1.gx},${d1.gy}`;
    } else {
        return d1.gy < d2.gy ? `${d1.gx},${d1.gy}-${d2.gx},${d2.gy}` : `${d2.gx},${d2.gy}-${d1.gx},${d1.gy}`;
    }
};

const GameBoard = () => {
    const { appState, gameState, gameDispatch } = useContext(GameContext);
    const { players, gridSize } = appState;
    
    const canvasRef = useRef(null);
    const logicStateRef = useGameCanvas({ canvasRef, gridSize, players, gameState });
    
    const eventLogicRef = useRef();
    useEffect(() => {
        eventLogicRef.current = { gameState, players, gridSize, gameDispatch, dotsMap: logicStateRef.current.dotsMap };
    }, [gameState, players, gridSize, gameDispatch, logicStateRef]);

    const checkForSquare = useCallback((link, currentLinks) => {
        // --- CHECKPOINT 2 ---
        console.log("---"); // Separator for clarity
        console.log("%cCheckpoint 2: Entering 'checkForSquare' function.", "color: blue;");

        const { dotsMap } = logicStateRef.current;
        if (!dotsMap) return [];

        const newSquares = [];
        const { start, end } = link;
        const squareColor = eventLogicRef.current.players[eventLogicRef.current.gameState.turn].color;

        const isSquareComplete = (topLeftGx, topLeftGy) => {
            const dTopLeft = dotsMap.get(`${topLeftGx},${topLeftGy}`);
            const dTopRight = dotsMap.get(`${topLeftGx + 1},${topLeftGy}`);
            const dBottomLeft = dotsMap.get(`${topLeftGx},${topLeftGy + 1}`);
            const dBottomRight = dotsMap.get(`${topLeftGx + 1},${topLeftGy + 1}`);

            if (!dTopLeft || !dTopRight || !dBottomLeft || !dBottomRight) return false;

            const hasTop = currentLinks.has(getLineKey(dTopLeft, dTopRight));
            const hasBottom = currentLinks.has(getLineKey(dBottomLeft, dBottomRight));
            const hasLeft = currentLinks.has(getLineKey(dTopLeft, dBottomLeft));
            const hasRight = currentLinks.has(getLineKey(dTopRight, dBottomRight));

            return hasTop && hasBottom && hasLeft && hasRight;
        };

        if (start.gy === end.gy) {
            const gx = Math.min(start.gx, end.gx);
            const gy = start.gy;
            if (gy > 0) {
                if (isSquareComplete(gx, gy - 1)) {
                    // --- CHECKPOINT 3 ---
                    console.log("%cCheckpoint 3: SUCCESS! Square detected above the line.", "color: green; font-weight: bold;");
                    const topLeftDot = dotsMap.get(`${gx},${gy - 1}`);
                    newSquares.push({ x: topLeftDot.x, y: topLeftDot.y, color: squareColor });
                }
            }
            if (gy < gridSize - 1) {
                if (isSquareComplete(gx, gy)) {
                    // --- CHECKPOINT 3 ---
                    console.log("%cCheckpoint 3: SUCCESS! Square detected below the line.", "color: green; font-weight: bold;");
                    const topLeftDot = dotsMap.get(`${gx},${gy}`);
                    newSquares.push({ x: topLeftDot.x, y: topLeftDot.y, color: squareColor });
                }
            }
        } else {
            const gx = start.gx;
            const gy = Math.min(start.gy, end.gy);
            if (gx > 0) {
                if (isSquareComplete(gx - 1, gy)) {
                    // --- CHECKPOINT 3 ---
                    console.log("%cCheckpoint 3: SUCCESS! Square detected to the left of the line.", "color: green; font-weight: bold;");
                    const topLeftDot = dotsMap.get(`${gx - 1},${gy}`);
                    newSquares.push({ x: topLeftDot.x, y: topLeftDot.y, color: squareColor });
                }
            }
            if (gx < gridSize - 1) {
                if (isSquareComplete(gx, gy)) {
                    // --- CHECKPOINT 3 ---
                    console.log("%cCheckpoint 3: SUCCESS! Square detected to the right of the line.", "color: green; font-weight: bold;");
                    const topLeftDot = dotsMap.get(`${gx},${gy}`);
                    newSquares.push({ x: topLeftDot.x, y: topLeftDot.y, color: squareColor });
                }
            }
        }
        return newSquares;
    }, [gridSize]);

    const handleMouseDown = useCallback((e) => {
        const { gameState, players, gridSize, gameDispatch } = eventLogicRef.current;
        const { dots } = logicStateRef.current;
        if (gameState.winner) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickPos = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };

        for (const dot of dots) {
            const distance = Math.sqrt((clickPos.x - dot.x) ** 2 + (clickPos.y - dot.y) ** 2);
            if (distance < dot.radius + 5) {
                if (logicStateRef.current.originDot) {
                    const startDot = logicStateRef.current.originDot;
                    const endDot = dot;
                    logicStateRef.current.originDot = null;
                    const isAdjacent = Math.abs(startDot.gx - endDot.gx) + Math.abs(startDot.gy - endDot.gy) === 1;
                    const lineKey = getLineKey(startDot, endDot);
                    if (startDot !== endDot && isAdjacent && !gameState.links.has(lineKey)) {
                        
                        // --- CHECKPOINT 1 ---
                        console.log("%cCheckpoint 1: Valid line drawn. Checking for squares...", "color: blue;");

                        const newLinkData = { start: startDot, end: endDot, color: players[gameState.turn].color };
                        const tempLinks = new Map(gameState.links);
                        tempLinks.set(lineKey, newLinkData);
                        
                        const createdSquares = checkForSquare(newLinkData, tempLinks);

                        // --- CHECKPOINT 4 ---
                        console.log(`%cCheckpoint 4: 'checkForSquare' returned [${createdSquares.length}] square(s). Dispatching action.`, "color: blue;");
                        
                        gameDispatch({ type: 'DRAW_LINE', payload: { newLink: { key: lineKey, data: newLinkData }, createdSquares, players, gridSize } });
                    }
                } else {
                    logicStateRef.current.originDot = dot;
                }
                break;
            }
        }
    }, [checkForSquare]);

    // ... handleMouseMove and useEffect for listeners remain the same
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        logicStateRef.current.mouse = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousedown", handleMouseDown);
        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mousedown", handleMouseDown);
        };
    }, [handleMouseMove, handleMouseDown]);

    return <div className="play-area"><canvas ref={canvasRef} /></div>;
};

export default React.memo(GameBoard);