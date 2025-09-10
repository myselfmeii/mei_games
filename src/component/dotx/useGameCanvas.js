import { useEffect, useRef } from 'react';
import { DOT_RADIUS, DOT_SPACING, MOUSE_DISTANCE } from './constants';

export function useGameCanvas({ canvasRef, gridSize, players, gameState }) {
    const { links, squares, turn } = gameState;
    const logicStateRef = useRef({ 
        dots: [], 
        dotsMap: new Map(), 
        originDot: null, 
        mouse: { x: undefined, y: undefined } 
    });

    const drawStateRef = useRef({ links, squares, players, turn });
    useEffect(() => {
        drawStateRef.current = { links, squares, players, turn };
    }, [links, squares, players, turn]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const size = (gridSize - 1) * DOT_SPACING + DOT_SPACING;
        canvas.width = size;
        canvas.height = size;

        const tempDots = [];
        const tempDotsMap = new Map();

        for (let gy = 0; gy < gridSize; gy++) {
            for (let gx = 0; gx < gridSize; gx++) {
                const dot = {
                    x: gx * DOT_SPACING + DOT_SPACING / 2,
                    y: gy * DOT_SPACING + DOT_SPACING / 2,
                    radius: DOT_RADIUS, gx, gy,
                };
                tempDots.push(dot);
                tempDotsMap.set(`${gx},${gy}`, dot);
            }
        }
        logicStateRef.current.dots = tempDots;
        logicStateRef.current.dotsMap = tempDotsMap;

    }, [gridSize, canvasRef]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const { links, squares, players, turn } = drawStateRef.current;
            const { dots, originDot, mouse } = logicStateRef.current;

            squares.forEach(s => {
                ctx.fillStyle = s.color; ctx.globalAlpha = 0.5;
                ctx.fillRect(s.x, s.y, DOT_SPACING, DOT_SPACING);
                ctx.globalAlpha = 1.0;
            });
            links.forEach(link => {
                ctx.beginPath(); ctx.lineWidth = 5; ctx.moveTo(link.start.x, link.start.y); ctx.lineTo(link.end.x, link.end.y); ctx.strokeStyle = link.color; ctx.stroke();
            });
            if (originDot) {
                ctx.beginPath(); ctx.lineWidth = 5; ctx.moveTo(originDot.x, originDot.y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = players[turn].color; ctx.stroke();
            }
            dots.forEach(dot => {
                ctx.beginPath();
                const isHovered = (mouse.x - dot.x < MOUSE_DISTANCE && mouse.x - dot.x > -MOUSE_DISTANCE && mouse.y - dot.y < MOUSE_DISTANCE && mouse.y - dot.y > -MOUSE_DISTANCE);
                dot.radius = (isHovered || originDot === dot) ? DOT_RADIUS * 1.5 : DOT_RADIUS;
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2); ctx.fillStyle = "black"; ctx.fill();
            });
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef]);

    return logicStateRef;
}