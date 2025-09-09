import React, { useRef, useEffect, useCallback, useContext } from 'react';
import { GameContext } from './GameContext';
import { useGameCanvas } from './useGameCanvas';

const getLineKey = (d1, d2) => {
    if (!d1 || !d2) return '';
    if (d1.gy === d2.gy) return d1.gx < d2.gx ? `${d1.gx},${d1.gy}-${d2.gx},${d2.gy}` : `${d2.gx},${d2.gy}-${d1.gx},${d1.gy}`;
    else return d1.gy < d2.gy ? `${d1.gx},${d1.gy}-${d2.gx},${d2.gy}` : `${d2.gx},${d2.gy}-${d1.gx},${d1.gy}`;
};

const GameBoard = () => {
    const { appState, gameState, gameDispatch } = useContext(GameContext);
    const { players, gridSize } = appState;
    
    const canvasRef = useRef(null);
    const logicStateRef = useGameCanvas({ canvasRef, gridSize, players, gameState });
    
    const eventLogicRef = useRef();
    useEffect(() => {
        eventLogicRef.current = { gameState, players, gridSize, gameDispatch, dots: logicStateRef.current.dots };
    }, [gameState, players, gridSize, gameDispatch, logicStateRef]);

    const checkForSquare = useCallback((link, currentLinks, currentTurn) => {
        const { dots } = logicStateRef.current;
        const newSquares = [];
        const findLink = (dot1, dot2) => currentLinks.has(getLineKey(dot1, dot2));
        
        const { start: us, end: ue } = link;
        const start = (us.gy < ue.gy || (us.gy === ue.gy && us.gx < ue.gx)) ? us : ue;
        const end = (us.gy < ue.gy || (us.gy === ue.gy && us.gx < ue.gx)) ? ue : us;
        
        const squareColor = players[currentTurn].color;

        if (start.gy === end.gy) {
            if (start.gy > 0) {
                const d1 = dots.find(d => d.gx === start.gx && d.gy === start.gy - 1);
                const d2 = dots.find(d => d.gx === end.gx && d.gy === end.gy - 1);
                if (d1 && d2 && findLink(d1, start) && findLink(d2, end) && findLink(d1, d2)) {
                    newSquares.push({ x: d1.x, y: d1.y, color: squareColor });
                }
            }
        
            if (start.gy < gridSize - 1) {
                const d1 = dots.find(d => d.gx === start.gx && d.gy === start.gy + 1);
                const d2 = dots.find(d => d.gx === end.gx && d.gy === end.gy + 1);
                if (d1 && d2 && findLink(start, d1) && findLink(end, d2) && findLink(d1, d2)) {
                    newSquares.push({ x: start.x, y: start.y, color: squareColor });
                }
            }
        } else { 
           
            if (start.gx > 0) {
                const d1 = dots.find(d => d.gx === start.gx - 1 && d.gy === start.gy);
                const d2 = dots.find(d => d.gx === end.gx - 1 && d.gy === end.gy);
                if (d1 && d2 && findLink(d1, start) && findLink(d2, end) && findLink(d1, d2)) {
                    newSquares.push({ x: d1.x, y: d1.y, color: squareColor });
                }
            }
            if (start.gx < gridSize - 1) {
                const d1 = dots.find(d => d.gx === start.gx + 1 && d.gy === start.gy);
                const d2 = dots.find(d => d.gx === end.gx + 1 && d.gy === end.gy);
                if (d1 && d2 && findLink(start, d1) && findLink(end, d2) && findLink(d1, d2)) {
                    newSquares.push({ x: start.x, y: start.y, color: squareColor });
                }
            }
        }
        return newSquares;
    }, [gridSize, players]); 

    const handleMouseDown = useCallback((e) => {
        const { gameState, players, gridSize, gameDispatch, dots } = eventLogicRef.current;
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
                        const newLinkData = { start: startDot, end: endDot, color: players[gameState.turn].color };
                       
                        const tempLinks = new Map(gameState.links);
                        tempLinks.set(lineKey, newLinkData);
                        
                        const createdSquares = checkForSquare(newLinkData, tempLinks, gameState.turn);
                        
                        gameDispatch({ type: 'DRAW_LINE', payload: { newLink: { key: lineKey, data: newLinkData }, createdSquares, players, gridSize } });
                    }
                } else {
                    logicStateRef.current.originDot = dot;
                }
                break;
            }
        }
    }, [checkForSquare]); 

    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
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