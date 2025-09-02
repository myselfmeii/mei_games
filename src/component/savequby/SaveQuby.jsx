import React, { useState, useEffect, useRef, useCallback } from 'react';
import qubystanding from '../../assets/qubystanding.png';
import qubythankyou from '../../assets/qubythankyou.gif';
import qubysad2 from '../../assets/qubysad2.gif';
import qubysad1 from '../../assets/qubysad1.png';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import mario_jump from '../../assets/sounds/mario_jump.mp3';
import leveleoneblack from '../../assets/sounds/leveleoneblack.wav';
import l1pit from '../../assets/sounds/l1pit.wav';
import levelup1 from '../../assets/sounds/levelup1.mp3';
// import weee from '../../assets/sounds/weee.mp3';
import infinitycastleopening from '../../assets/sounds/infinitycastleopening.mp3';
import duckhuntload from '../../assets/sounds/duckhuntload.mp3';
import jump6 from '../../assets/sounds/jump6.wav';
import MiniMilitiaSong from '../../assets/sounds/MiniMilitiaSong.mp3';
import PUBGchickendinner from '../../assets/sounds/PUBGchickendinner.mp3';
import mariolose from '../../assets/sounds/mariolose.mp3';
import sadness_and_sorrow from '../../assets/sounds/sadness_and_sorrow.mp3';
import CopyLinkButton from '../common/CopyLinkButton';


// --- Constants ---
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const SLOW_MOVE_SPEED = 2;
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
const INITIAL_LIVES = 2;
const GAME_TIME_SECONDS = 120; // 2 minutes
const PLAYER_START_X = 50;
const PLAYER_START_Y = 0;
const PLATFORM_LEVEL_Y = 500;


// --- Helper Components ---

const ParallaxBackground = ({ playerX, level }) => {
    const isDevilLevel = level === 3;
    const layer1Url = isDevilLevel ? "https://i.imgur.com/gC24H5G.png" : "https://i.imgur.com/6BGE63g.png";
    const layer2Url = isDevilLevel ? "https://i.imgur.com/325nN8h.png" : "https://i.imgur.com/c3aQ0l2.png";
    const layer3Url = isDevilLevel ? "https://i.imgur.com/E0b54Da.png" : "https://i.imgur.com/k2a4b0z.png";

    const layer1Style = { backgroundPosition: `${-playerX / 10}px 0`, backgroundImage: `url('${layer1Url}')` };
    const layer2Style = { backgroundPosition: `${-playerX / 6}px 0`, backgroundImage: `url('${layer2Url}')` };
    const layer3Style = { backgroundPosition: `${-playerX / 2}px 0`, backgroundImage: `url('${layer3Url}')` };

    return (
        <div className="parallax-background">
            <div className="parallax-layer" style={{ ...layer1Style, backgroundSize: '150% 100%' }}></div>
            <div className="parallax-layer" style={{ ...layer2Style, opacity: 0.8, backgroundSize: '150% 100%' }}></div>
            <div className="parallax-layer" style={{ ...layer3Style, opacity: 0.7, backgroundSize: '150% 100%' }}></div>
        </div>
    );
};

const Player = ({ x, y, isFalling, zIndex }) => {
    const playerClasses = `player ${isFalling ? 'player-falling' : ''}`;
    const style = { left: x, top: y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, zIndex: zIndex };
    return (
        <div style={style} className={playerClasses}>
            <img src={qubystanding} alt="Player" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
};

const Platform = ({ x, y, width, height, isActivated, type, customStyle }) => {
    const platformClasses = `platform ${type === 'moving' ? 'platform-moving' : ''} ${isActivated ? 'animate-trap-grow' : ''}`;
    const platformStyle = { left: x, top: y, width, height, ...customStyle };
    return <div className={platformClasses} style={platformStyle}></div>;
};

const Cave = ({ x, y, width, height }) => (
    <div className="cave" style={{ left: x, top: y, width, height }}>
        <div className="cave-opening"></div>
    </div>
);

const GameUI = ({ lives, timer }) => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const getTimerColor = () => {
        if (timer <= 30) return '#EF4444';
        if (timer <= 60) return '#F97316';
        return '#22C55E';
    };
    const fontStyle = { fontFamily: "'neontubes', sans-serif" };
    return (
        <div className="game-ui">
            <span style={{ ...fontStyle, color: 'white' }}>Life x{lives}</span>
            {lives < INITIAL_LIVES && <span style={{ ...fontStyle, color: getTimerColor() }}>Timer: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>}
        </div>
    );
};

const TouchControls = ({ onJump, onMoveLeft, onMoveRight, onStopMove }) => (
    <div className="touch-controls">
        <div>
            <button onTouchStart={onMoveLeft} onTouchEnd={onStopMove} className="touch-button">LEFT</button>
            <button onTouchStart={onMoveRight} onTouchEnd={onStopMove} className="touch-button">RIGHT</button>
        </div>
        <button onTouchStart={onJump} onTouchEnd={onStopMove} className="touch-button jump-button">JUMP</button>
    </div>
);

const RoundIndicator = ({ roundNumber, currentLevel }) => {
    const displayRound = (currentLevel - 1) * INITIAL_LIVES + roundNumber;
    return (
        <div className="main">
            <span className="webdev">Round</span>
            <span className="socod">{displayRound}</span>
        </div>
    );
};

const LevelTransitionScreen = ({ onContinue, level }) => {
    useEffect(() => {
        const timer = setTimeout(onContinue, 3000); //next round sec
        return () => clearTimeout(timer);
    }, [onContinue]);

    return (
        <div className="level-transition-screen">
            <h2 className="level-transition-text">Won Level {level - 1}</h2>
            <p className="level-transition-subtext">Starting Level {level}...</p>
        </div>
    );
};

const RulesScreen = ({ onStartGame }) => {
    const navigate = useNavigate();
    const handleExitNavigate = () => {
        navigate('/');
    };

    return (
        <div className="rules-screen">
            <div className="rules-content">
                <p className="rules-quote">"Pretty sure the developer secretly watched your life and made it into a game. It feels way too real."</p>
                <p className="rules-quote">"Ever felt like a game gets you more than your therapist? Yeah… this one does. Sadly".</p>
                <p className="rules-signature">- Mei</p>
                <hr className="rules-divider" />
                <p className="rules-header">This game is full of unpredictable twists.</p>
                <ul
                    style={{
                        width: 'fit-content',
                        margin: '0 auto',
                        textAlign: 'left',
                        listStylePosition: 'inside',
                        padding: 0,
                    }}
                >
                    <li>There are no certain rules. We don’t know what’s coming next.just like your life.</li>
                    <li>You get 2 lives to play. Try not to waste them... there are 3 levels to survive.</li>
                </ul>


                <span style={{ display: 'flex', justifyContent: 'center', gap: '15px' }} >
                    <button onClick={onStartGame} className="rules-button">Play Game</button>
                    <button onClick={handleExitNavigate} className="rules-button-exit">
                        Exit Game
                    </button>
                </span>
            </div>
        </div>
    );
};

// --- Level 1 Component ---
const Level1 = ({ onLevelComplete, onPlayerDeath, shouldReset }) => {
    const [player, setPlayer] = useState({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
    const [keys, setKeys] = useState({ right: false, left: false, up: false, shift: false });
    const [activatedTrapId, setActivatedTrapId] = useState(null);
    const [deathTrigger, setDeathTrigger] = useState({ active: false, type: null });

    const playSound = useSound({
        jump: mario_jump,
        // spawn: weee,
        trap: leveleoneblack,
        fall: l1pit,
        complete: levelup1,
    });

    const platforms = [
        { id: 0, x: 0, y: PLATFORM_LEVEL_Y, width: 200, height: 100, visible: true, type: 'safe' },
        { id: 'pit1_invisible', x: 200, y: PLATFORM_LEVEL_Y, width: 100, height: 100, visible: false, type: 'safe' },
        { id: 1, x: 300, y: PLATFORM_LEVEL_Y, width: 100, height: 100, visible: true, type: 'trap' },
        { id: 2, x: 500, y: PLATFORM_LEVEL_Y, width: 100, height: 100, visible: true, type: 'safe' },
        { id: 3, x: 700, y: PLATFORM_LEVEL_Y, width: 100, height: 100, visible: true, type: 'safe' },
        { id: 4, x: 900, y: PLATFORM_LEVEL_Y, width: 300, height: 100, visible: true, type: 'safe' },
    ];
    const cave = { x: 1050, y: 400, width: 150, height: 100 };
    const gameLoopRef = useRef();

    useEffect(() => {
        if (shouldReset) {
            playSound('spawn');
            setPlayer({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
            setActivatedTrapId(null);
            setDeathTrigger({ active: false, type: null });
        }
    }, [shouldReset, playSound]);

    useEffect(() => {
        if (!deathTrigger.active) return;
        let timeoutId;
        if (deathTrigger.type === 'trap') timeoutId = setTimeout(() => onPlayerDeath(), 300);
        else if (deathTrigger.type === 'fall') onPlayerDeath();
        return () => clearTimeout(timeoutId);
    }, [deathTrigger, onPlayerDeath]);

    const handleKeyDown = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key]) {
            if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault();
            setKeys(prev => ({ ...prev, [keyMap[e.key]]: true }));
        }
    }, []);

    const handleKeyUp = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key]) setKeys(prev => ({ ...prev, [keyMap[e.key]]: false }));
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const gameLoop = useCallback(() => {
        if (activatedTrapId !== null || deathTrigger.active) return;
        setPlayer(p => {
            let { x, y, vx, vy, isJumping } = p;
            const currentSpeed = keys.shift ? SLOW_MOVE_SPEED : MOVE_SPEED;
            vx = keys.right ? currentSpeed : keys.left ? -currentSpeed : 0;

            if (keys.up && !isJumping) {
                vy = JUMP_FORCE;
                isJumping = true;
                playSound('jump');
            }

            vy += GRAVITY;
            x += vx;
            y += vy;
            if (x < 0) x = 0;
            if (y + PLAYER_HEIGHT > GAME_HEIGHT + 50) {
                playSound('fall');
                setDeathTrigger({ active: true, type: 'fall' });
                return { ...p, x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true };
            }
            let onPlatform = false;
            for (const platform of platforms) {
                if (x + PLAYER_WIDTH > platform.x && x < platform.x + platform.width && y + PLAYER_HEIGHT > platform.y && y + PLAYER_HEIGHT < platform.y + 20 && vy >= 0) {
                    if (platform.type === 'trap') {
                        playSound('trap');
                        setActivatedTrapId(platform.id);
                        setDeathTrigger({ active: true, type: 'trap' });
                    } else {
                        isJumping = false;
                        y = platform.y - PLAYER_HEIGHT;
                        vy = 0;
                        onPlatform = true;
                    }
                    break;
                }
            }
            if (!onPlatform && isJumping === false) isJumping = true;
            if (x + PLAYER_WIDTH > cave.x && x < cave.x + cave.width && y + PLAYER_HEIGHT > cave.y && y < cave.y + cave.height) {
                playSound('complete');
                onLevelComplete();
            }
            return { ...p, x, y, vx, vy, isJumping };
        });
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [keys, onLevelComplete, activatedTrapId, deathTrigger.active, playSound]);

    useEffect(() => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameLoop]);

    const handleTouchJump = () => {
        setPlayer(p => {
            if (!p.isJumping) {
                playSound('jump');
                return { ...p, vy: JUMP_FORCE, isJumping: true };
            }
            return p;
        });
    };

    const handleTouchMoveLeft = () => setKeys(prev => ({ ...prev, left: true, right: false }));
    const handleTouchMoveRight = () => setKeys(prev => ({ ...prev, right: true, left: false }));
    const handleTouchStop = () => setKeys(prev => ({ ...prev, left: false, right: false }));
    const playerZIndex = player.y + PLAYER_HEIGHT > PLATFORM_LEVEL_Y + 1 ? 0 : 10;

    return (
        <div className="level-container level-1">
            <ParallaxBackground playerX={player.x} level={1} />
            <Player x={player.x} y={player.y} isFalling={player.vy > 1 && player.isJumping} zIndex={playerZIndex} />
            {platforms.map(p => p.visible && <Platform key={p.id} {...p} isActivated={activatedTrapId === p.id} />)}
            <Cave {...cave} />
            <TouchControls onJump={handleTouchJump} onMoveLeft={handleTouchMoveLeft} onMoveRight={handleTouchMoveRight} onStopMove={handleTouchStop} />
        </div>
    );
};

// --- Level 2 Component ---
const Level2 = ({ onLevelComplete, onPlayerDeath, shouldReset }) => {
    const [player, setPlayer] = useState({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
    const [keys, setKeys] = useState({ right: false, left: false, up: false, shift: false });
    const [isSpeedTriggered, setIsSpeedTriggered] = useState(false);
    const [movingPlatform, setMovingPlatform] = useState({ x: 550, y: PLATFORM_LEVEL_Y - 60, direction: 1 });
    const gameLoopRef = useRef();

    const playSound = useSound({
        jump: mario_jump,
        teleport: infinitycastleopening,
        speedUp: duckhuntload,
        fall: jump6,
        complete: MiniMilitiaSong
    });

    const staticPlatforms = [
        { id: 0, x: 0, y: PLATFORM_LEVEL_Y, width: 150, height: 100, type: 'safe' },
        { id: 1, x: 250, y: PLATFORM_LEVEL_Y - 20, width: 80, height: 20, type: 'safe' },
        { id: 2, x: 400, y: PLATFORM_LEVEL_Y - 40, width: 80, height: 20, type: 'safe' },
        { id: 4, x: 720, y: PLATFORM_LEVEL_Y - 40, width: 80, height: 20, type: 'teleport' }, // This is the trap
        { id: 5, x: 1000, y: PLATFORM_LEVEL_Y, width: 200, height: 100, type: 'safe' },
    ];
    const cave = { x: 1000, y: 400, width: 150, height: 100 };

    useEffect(() => {
        if (shouldReset) {
            setPlayer({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
            setIsSpeedTriggered(false);
            setMovingPlatform({ x: 550, y: PLATFORM_LEVEL_Y - 60, direction: 1 });
        }
    }, [shouldReset]);

    const handleKeyDown = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key]) { e.preventDefault(); setKeys(prev => ({ ...prev, [keyMap[e.key]]: true })); }
    }, []);

    const handleKeyUp = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key]) { setKeys(prev => ({ ...prev, [keyMap[e.key]]: false })); }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const gameLoop = useCallback(() => {
        const platformSpeed = isSpeedTriggered ? 3 : 0.5;
        setMovingPlatform(mp => {
            let newX = mp.x + platformSpeed * mp.direction;
            if (newX > 650 || newX < 550) {
                mp.direction *= -1;
                newX = mp.x + platformSpeed * mp.direction;
            }
            return { ...mp, x: newX };
        });

        setPlayer(p => {
            let { x, y, vx, vy, isJumping } = p;
            const currentSpeed = keys.shift ? SLOW_MOVE_SPEED : MOVE_SPEED;
            vx = keys.right ? currentSpeed : keys.left ? -currentSpeed : 0;
            if (keys.up && !isJumping) {
                vy = JUMP_FORCE;
                isJumping = true;
                playSound('jump');
            }
            vy += GRAVITY;
            x += vx;
            y += vy;
            if (x < 0) x = 0;
            if (y + PLAYER_HEIGHT > GAME_HEIGHT + 50) {
                playSound('fall');
                onPlayerDeath();
                return { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true };
            }

            let onPlatform = false;
            const currentMovingPlatform = { ...movingPlatform, id: 3, width: 100, height: 20, type: 'moving' };
            const allPlatforms = [...staticPlatforms, currentMovingPlatform];

            for (const platform of allPlatforms) {
                if (x + PLAYER_WIDTH > platform.x && x < platform.x + platform.width && y + PLAYER_HEIGHT >= platform.y && y + PLAYER_HEIGHT <= platform.y + 20 && vy >= 0) {
                    if (platform.type === 'teleport') {
                        playSound('teleport');
                        return { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true };
                    }
                    isJumping = false;
                    y = platform.y - PLAYER_HEIGHT;
                    vy = 0;
                    onPlatform = true;
                    if (platform.id === 2 && !isSpeedTriggered) {
                        playSound('speedUp');
                        setIsSpeedTriggered(true);
                    }
                    if (platform.id === 3) x += platformSpeed * movingPlatform.direction;
                    break;
                }
            }
            if (!onPlatform) isJumping = true;
            if (x + PLAYER_WIDTH > cave.x && x < cave.x + cave.width && y + PLAYER_HEIGHT > cave.y && y < cave.y + cave.height) {
                playSound('complete');
                onLevelComplete();
            }
            return { x, y, vx, vy, isJumping };
        });
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [keys, onLevelComplete, onPlayerDeath, isSpeedTriggered, movingPlatform.direction, playSound]);

    useEffect(() => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameLoop]);

    const handleTouchJump = () => {
        setPlayer(p => {
            if (!p.isJumping) {
                playSound('jump');
                return { ...p, vy: JUMP_FORCE, isJumping: true };
            }
            return p;
        });
    };

    const handleTouchMoveLeft = () => setKeys(prev => ({ ...prev, left: true, right: false }));
    const handleTouchMoveRight = () => setKeys(prev => ({ ...prev, right: true, left: false }));
    const handleTouchStop = () => setKeys(prev => ({ ...prev, left: false, right: false }));

    const playerZIndex = player.y + PLAYER_HEIGHT > PLATFORM_LEVEL_Y + 1 ? 0 : 10;
    const allPlatformsForRender = [...staticPlatforms, { ...movingPlatform, id: 3, width: 100, height: 20, type: 'moving' }];

    return (
        <div className="level-container level-2">
            <ParallaxBackground playerX={player.x} level={2} />
            <Player x={player.x} y={player.y} isFalling={player.vy > 1 && player.isJumping} zIndex={playerZIndex} />
            {allPlatformsForRender.map(p => <Platform key={p.id} {...p} />)}
            <Cave {...cave} />
            <TouchControls onJump={handleTouchJump} onMoveLeft={handleTouchMoveLeft} onMoveRight={handleTouchMoveRight} onStopMove={handleTouchStop} />
        </div>
    );
};

// --- Level 3 Component ---
const Level3 = ({ onLevelComplete, onPlayerDeath, shouldReset, onTrapTrigger }) => {
    const [player, setPlayer] = useState({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
    const [keys, setKeys] = useState({ right: false, left: false, up: false, shift: false });
    const [isTrapAnimating, setIsTrapAnimating] = useState(false);
    const playerRef = useRef(player);
    const gameLoopRef = useRef();

    const playSound = useSound({
        jump: mario_jump,
    });

    const platforms = [
        { id: 'start', x: 0, y: PLATFORM_LEVEL_Y, width: 150, height: 100, type: 'safe' },
        { id: 'long-trap', x: 150, y: PLATFORM_LEVEL_Y, width: 800, height: 100, type: 'right-only-trap' },
        { id: 'end', x: 950, y: PLATFORM_LEVEL_Y, width: 250, height: 100, type: 'safe' },
    ];
    const cave = { x: 1075, y: PLATFORM_LEVEL_Y - 70, width: 100, height: 70 };

    useEffect(() => {
        playerRef.current = player;
    }, [player]);

    useEffect(() => {
        if (shouldReset) {
            setPlayer({ x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true });
            setIsTrapAnimating(false);
        }
    }, [shouldReset]);

    const triggerTrap = useCallback(() => {
        if (!isTrapAnimating) {
            onTrapTrigger();
            setIsTrapAnimating(true);
            setTimeout(() => onPlayerDeath(), 2000);
        }
    }, [isTrapAnimating, onPlayerDeath, onTrapTrigger]);

    const handleKeyDown = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key] && e.key !== 'Escape') {
            e.preventDefault();
            setKeys(prev => ({ ...prev, [keyMap[e.key]]: true }));

            const p = playerRef.current;
            const trapPlatform = platforms.find(pf => pf.type === 'right-only-trap');
            const isOnTrap = p.x + PLAYER_WIDTH > trapPlatform.x && p.x < trapPlatform.x + trapPlatform.width && p.y + PLAYER_HEIGHT >= trapPlatform.y && p.y + PLAYER_HEIGHT <= trapPlatform.y + 20;

            if (isOnTrap && e.key !== 'ArrowRight') {
                triggerTrap();
            }
        }
    }, [platforms, triggerTrap]);

    const handleKeyUp = useCallback((e) => {
        const keyMap = { ArrowRight: 'right', ArrowLeft: 'left', ' ': 'up', ArrowUp: 'up', Shift: 'shift' };
        if (keyMap[e.key] && e.key !== 'Escape') {
            setKeys(prev => ({ ...prev, [keyMap[e.key]]: false }));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const gameLoop = useCallback(() => {
        if (isTrapAnimating) return;

        setPlayer(p => {
            let { x, y, vx, vy, isJumping } = p;
            const currentSpeed = keys.shift ? SLOW_MOVE_SPEED : MOVE_SPEED;
            vx = keys.right ? currentSpeed : keys.left ? -currentSpeed : 0;

            if (keys.up && !isJumping) {
                vy = JUMP_FORCE;
                isJumping = true;
                playSound('jump');
            }
            vy += GRAVITY;
            x += vx;
            y += vy;
            if (x < 0) x = 0;

            if (y + PLAYER_HEIGHT > GAME_HEIGHT + 50) {
                onPlayerDeath();
                return { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, isJumping: true };
            }

            let onPlatform = false;
            for (const platform of platforms) {
                if (x + PLAYER_WIDTH > platform.x && x < platform.x + platform.width && y + PLAYER_HEIGHT >= platform.y && y + PLAYER_HEIGHT <= platform.y + 20 && vy >= 0) {
                    isJumping = false;
                    y = platform.y - PLAYER_HEIGHT;
                    vy = 0;
                    onPlatform = true;
                    break;
                }
            }

            if (!onPlatform) isJumping = true;
            if (x + PLAYER_WIDTH > cave.x && x < cave.x + cave.width && y + PLAYER_HEIGHT > cave.y && y < cave.y + cave.height) {
                onLevelComplete();
            }
            return { x, y, vx, vy, isJumping };
        });
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [keys, onLevelComplete, onPlayerDeath, platforms, isTrapAnimating, playSound]);

    useEffect(() => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameLoop]);

    const playerZIndex = player.y + PLAYER_HEIGHT > PLATFORM_LEVEL_Y + 1 ? 0 : 10;

    const handleTouchAction = useCallback((action) => {
        const p = playerRef.current;
        const trapPlatform = platforms.find(pf => pf.type === 'right-only-trap');
        const isOnTrap = p.x + PLAYER_WIDTH > trapPlatform.x && p.x < trapPlatform.x + trapPlatform.width && p.y + PLAYER_HEIGHT >= trapPlatform.y;

        const canJump = !p.isJumping || (p.vy >= 0 && isOnTrap);

        if (action === 'jump' && canJump) {
            playSound('jump');
        }

        if (isOnTrap) {
            if (action === 'jump') { setKeys(prev => ({ ...prev, up: true })); triggerTrap(); }
            if (action === 'left') { setKeys(prev => ({ ...prev, left: true, right: false })); triggerTrap(); }
        } else {
            if (action === 'jump') setKeys(prev => ({ ...prev, up: true }));
            if (action === 'left') setKeys(prev => ({ ...prev, left: true, right: false }));
        }
    }, [platforms, triggerTrap, playSound]);

    return (
        <div className="level-container level-3">
            <ParallaxBackground playerX={player.x} level={3} />
            <Player x={player.x} y={player.y} isFalling={player.vy > 1 && player.isJumping} zIndex={playerZIndex} />
            {platforms.map(p => <Platform key={p.id} {...p} isActivated={p.type === 'right-only-trap' && isTrapAnimating} />)}
            <Cave {...cave} />
            <TouchControls
                onJump={() => handleTouchAction('jump')}
                onMoveLeft={() => handleTouchAction('left')}
                onMoveRight={() => setKeys(prev => ({ ...prev, right: true, left: false }))}
                onStopMove={() => setKeys(prev => ({ ...prev, left: false, right: false, up: false }))}
            />
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [timer, setTimer] = useState(GAME_TIME_SECONDS);
    const [gameState, setGameState] = useState('rules');
    const [resetLevel, setResetLevel] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);
    const timerRef = useRef(null);
    const navigate = useNavigate();

    const victoryAudioRef = useRef(null);
    const gameOverAudioRef = useRef(null);
    const level3LoseAudioRef = useRef(null);

    useEffect(() => {
        if (!victoryAudioRef.current) {
            victoryAudioRef.current = new Audio(PUBGchickendinner);
            victoryAudioRef.current.loop = true;
        }
        if (!gameOverAudioRef.current) {
            gameOverAudioRef.current = new Audio(mariolose);
        }
        if (!level3LoseAudioRef.current) {
            level3LoseAudioRef.current = new Audio(sadness_and_sorrow);
            level3LoseAudioRef.current.loop = true;
        }
    }, []);

    const playVictoryMusic = useCallback(() => {
        if (victoryAudioRef.current) {
            victoryAudioRef.current.currentTime = 0;
            victoryAudioRef.current.play();
        }
    }, []);

    const stopVictoryMusic = useCallback(() => {
        if (victoryAudioRef.current) {
            victoryAudioRef.current.pause();
            victoryAudioRef.current.currentTime = 0;
        }
    }, []);

    const playGameOverMusic = useCallback(() => {
        if (gameOverAudioRef.current) {
            gameOverAudioRef.current.currentTime = 0;
            gameOverAudioRef.current.play();
        }
    }, []);

    const stopGameOverMusic = useCallback(() => {
        if (gameOverAudioRef.current) {
            gameOverAudioRef.current.pause();
            gameOverAudioRef.current.currentTime = 0;
        }
    }, []);

    const playLevel3LoseMusic = useCallback(() => {
        if (level3LoseAudioRef.current) {
            level3LoseAudioRef.current.currentTime = 0;
            level3LoseAudioRef.current.play();
        }
    }, []);

    const stopLevel3LoseMusic = useCallback(() => {
        if (level3LoseAudioRef.current) {
            level3LoseAudioRef.current.pause();
            level3LoseAudioRef.current.currentTime = 0;
        }
    }, []);

    const handleTriggerLevel3Trap = useCallback(() => {
        playLevel3LoseMusic();
    }, [playLevel3LoseMusic]);


    const handlePlayerDeath = useCallback(() => {
        if ((lives - 1 <= 0) && currentLevel !== 3) {
            playGameOverMusic();
        }
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                setGameState('lost');
                return 0;
            }
            setResetLevel(true);
            setTimeout(() => setResetLevel(false), 100);
            return newLives;
        });
    }, [lives, currentLevel, playGameOverMusic]);


    const proceedToNextLevel = useCallback(() => {
        setCurrentLevel(prev => prev + 1);
        setLives(INITIAL_LIVES);
        setTimer(GAME_TIME_SECONDS);
        setGameState('playing');
        setResetLevel(true);
        setTimeout(() => setResetLevel(false), 100);
    }, []);

    const handleLevelComplete = useCallback(() => {
        if (currentLevel < 3) {
            setGameState('level-transition');
        } else {
            playVictoryMusic();
            setGameState('won');
        }
    }, [currentLevel, playVictoryMusic]);

    const startGame = () => {
        stopVictoryMusic();
        stopGameOverMusic();
        stopLevel3LoseMusic();
        setLives(INITIAL_LIVES);
        setTimer(GAME_TIME_SECONDS);
        setGameState('playing');
        setCurrentLevel(1);
        setResetLevel(true);
        setTimeout(() => setResetLevel(false), 100);
    };

    const handleExit = () => {
        stopVictoryMusic();
        stopGameOverMusic();
        stopLevel3LoseMusic();
        navigate('/');
    };

    useEffect(() => {
        const handleCheats = (e) => {
            if (e.key === '1' || e.key === '2' || e.key === '3') {
                stopVictoryMusic();
                stopGameOverMusic();
                stopLevel3LoseMusic();
                setCurrentLevel(Number(e.key));
                setGameState('playing');
                setResetLevel(true);
                setTimeout(() => setResetLevel(false), 100);
            }
            if (e.key === 'w' || e.key === 'm') {
                handleLevelComplete();
            }
        };

        window.addEventListener('keydown', handleCheats);

        return () => {
            window.removeEventListener('keydown', handleCheats);
        };
    }, [currentLevel, handleLevelComplete, stopVictoryMusic, stopGameOverMusic, stopLevel3LoseMusic]);


    useEffect(() => {
        if (gameState === 'playing' && lives < INITIAL_LIVES) {
            timerRef.current = setInterval(() => {
                setTimer(t => {
                    if (t > 0) return t - 1;
                    setGameState('lost');
                    return 0;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, lives]);

    const ActiveLevel = currentLevel === 1 ? Level1 : currentLevel === 2 ? Level2 : Level3;

    return (
        <div className="app-container">
            <style>
                {`
                    body { margin: 0; font-family: sans-serif; }
                    .app-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #000; }
                    .game-container { position: relative; width: ${GAME_WIDTH}px; height: ${GAME_HEIGHT}px; }
                    .level-container { position: relative; width: 100%; height: 100%; background-color: #1F2937; overflow: hidden; }
                    .parallax-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: -10; }
                    .parallax-layer { position: absolute; width: 100%; height: 100%; background-size: cover; background-repeat: no-repeat; background-position: center; }
                    .player { position: absolute; transition: transform 0.2s ease-in-out; }
                    .player-falling { transform: rotate(12deg); }
                    .platform { position: absolute; background-color: #000; transform-origin: bottom; z-index: 5; transition: opacity 0.5s ease-out; }
                    .platform-moving { background-color: #3B82F6; }
                    .cave { position: absolute; background-color: #000; z-index: 5; }
                    .cave-opening { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 75%; height: 75%; background-color: white; border-top-left-radius: 50%; border-top-right-radius: 50%; }
                    .game-ui { position: absolute; top: 0; left: 0; width: 100%; padding: 1rem; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.5rem; line-height: 2rem; z-index: 20; }
                    .touch-controls { position: fixed; bottom: 0; left: 0; width: 100%; height: 6rem; background-color: rgba(0,0,0,0.2); display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; z-index: 30; }
                    @media (min-width: 768px) { .touch-controls { display: none; } }
                    .touch-button { padding: 1rem; background-color: #6B7280; color: white; border-radius: 9999px; border: none; margin-right: 1rem; }
                    .jump-button { padding: 1.5rem; background-color: #3B82F6; }
                    .game-over-screen, .level-transition-screen, .rules-screen { position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 30; }
                    .game-over-screen { background-color: #ffffff; }
                    .level-transition-screen, .rules-screen { background-color: rgba(0,0,0,0.85); color: white; text-align: center; }
                    .rules-content { background-color: #1F2937; padding: 2rem; border-radius: 1rem; border: 2px solid #4B5563; max-width: 80%; }
                    .rules-quote { font-style: italic; color: #D1D5DB; }
                    .rules-signature { text-align: right; color: #9CA3AF; padding-right: 3rem;font-weight: 800; }
                    .rules-divider { width: 80%; border-color: #4B5563; margin: 1rem 0; }
                    .rules-header { font-family: 'neontubes', sans-serif; font-size: 2rem; color: #F87171; text-shadow: 0 0 10px #EF4444; }
                    .rules-list { list-style-type: none; padding: 0; }
                    .rules-list li { margin: 0.5rem 0; }
                    .rules-button { margin-top: 1.5rem; padding: 0.75rem 2rem; background-color: #22C55E; color: white; font-weight: bold; border-radius: 0.5rem; font-size: 1.25rem; border: none; cursor: pointer; }
                    .rules-button-exit { margin-top: 1.5rem; padding: 0.75rem 2rem; background-color: #c02424ff; color: white; font-weight: bold; border-radius: 0.5rem; font-size: 1.25rem; border: none; cursor: pointer; }
                    .level-transition-text { font-family: 'neontubes';font-size: 4rem; color: #ffffffff; text-shadow: 0 0 15px #ca46d3ff, 0 0 5px #fff; margin: 0; }
                    .level-transition-subtext {font-family: 'neontubes'; font-size: 2rem; color: #ffffffff; text-shadow: 0 0 10px #2695ff, 0 0 2px #fff; }
                    .game-over-text { font-size: 3.75rem; line-height: 1; font-weight: bold; color: white; margin-bottom: 1rem; }
                    .button-container { display: flex; gap: 1rem; }
                    .restart-button, .exit-button { padding: 1rem 2rem; color: white; font-weight: bold; border-radius: 0.5rem; font-size: 1.5rem; line-height: 2rem; border: none; cursor: pointer; transition: background-color 150ms ease-in-out; }
                    .restart-button { background-color: #1d1d1dff; }
                    .restart-button:hover { background-color: #000000ff}
                    .exit-button { background-color: #EF4444; }
                    .exit-button:hover { background-color: #DC2626; }
                    @font-face {
                      font-family: 'neontubes';
                      src: url("https://bitbucket.org/kennethjensen/webfonts/raw/fc13c1cb430a0e9462da56fe3f421ff7af72db71/neontubes/neontubes-webfont.eot");
                      src: url("https://bitbucket.org/kennethjensen/webfonts/raw/fc13c1cb430a0e9462da56fe3f421ff7af72db71/neontubes/neontubes-webfont.eot?#iefix") format("embedded-opentype"), url("https://bitbucket.org/kennethjensen/webfonts/raw/fc13c1cb430a0e9462da56fe3f421ff7af72db71/neontubes/neontubes-webfont.woff2") format("woff2"), url("https://bitbucket.org/kennethjensen/webfonts/raw/fc13c1cb430a0e9462da56fe3f421ff7af72db71/neontubes/neontubes-webfont.woff") format("woff"), url("https://bitbucket.org/kennethjensen/webfonts/raw/fc13c1cb430a0e9462da56fe3f421ff7af72db71/neontubes/neontubes-webfont.ttf") format("truetype");
                      font-weight: normal; font-style: normal;
                    }
                    .main { display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: "neontubes"; font-size: 8vw; text-align: center; white-space: nowrap; z-index: 1; }
                    .main span { display: block; position: relative; transform: translateZ(0) translate3D(0, 0, 0); backface-visibility: hidden; will-change: opacity; }
                    .main .webdev { color: #ffd9e2; text-shadow: 0 0 0 transparent, 0 0 10px #ff003c, 0 0 20px rgba(255, 0, 60, 0.5), 0 0 40px #ff003c, 0 0 100px #ff003c, 0 0 200px #ff003c, 0 0 300px #ff003c, 0 0 500px #ff003c, 0 0 1000px #ff003c; animation: blink 4s infinite alternate; }
                    .main .socod { font-size: 5.5vw; color: #d4eaff; text-shadow: 0 0 0 transparent, 0 0 10px #2695ff, 0 0 20px rgba(38, 149, 255, 0.5), 0 0 40px #2695ff, 0 0 100px #2695ff, 0 0 200px #2695ff, 0 0 300px #2695ff, 0 0 500px #2695ff; animation: buzz 0.01s infinite alternate; }
                    @keyframes buzz { 70% { opacity: 0.80; } }
                    @keyframes blink { 40% { opacity: 1; } 42% { opacity: 0.8; } 43% { opacity: 1; } 45% { opacity: 0.2; } 46% { opacity: 1; } }
                    @media screen and (min-width: 1000px) { .main { width: 300px; font-size: 75px; } .main .socod { font-size: 50px; } }
                    @keyframes trap-grow { from { transform: scaleY(1); } to { transform: scaleY(6); } }
                    .level-1 .animate-trap-grow { animation: trap-grow 0.3s ease-out forwards; }
                    .level-3 .animate-trap-grow { animation: trap-grow 2s linear forwards; }
                `}
            </style>
            <div className="game-container" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                {gameState === 'rules' && <RulesScreen onStartGame={startGame} />}
                {gameState === 'playing' && (
                    <>
                        <RoundIndicator roundNumber={INITIAL_LIVES - lives + 1} currentLevel={currentLevel} />
                        <GameUI lives={lives} timer={timer} />
                        <ActiveLevel
                            onLevelComplete={handleLevelComplete}
                            onPlayerDeath={handlePlayerDeath}
                            shouldReset={resetLevel}
                            onTrapTrigger={currentLevel === 3 ? handleTriggerLevel3Trap : () => { }}
                        />
                    </>
                )}
                {gameState === 'level-transition' && (
                    <LevelTransitionScreen onContinue={proceedToNextLevel} level={currentLevel + 1} />
                )}
                {gameState !== 'playing' && gameState !== 'level-transition' && gameState !== 'rules' && (
                    <div className="game-over-screen">
                        <h2 className="game-over-text">
                            {gameState === 'won' ? <span style={{ display: 'flex', flexDirection: 'column' }}> <span style={{ color: 'black' }}>You Win</span>
                                <span><img src={qubythankyou} alt="img-over" /> </span>
                            </span> : <> <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> <span style={{ color: 'black' }}>Game Over</span> <span><img style={{ height: 150, width: 150 }} src={qubysad1} alt="img-over" /> </span></span> <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <span><img src={qubysad2} style={{ height: 200, width: 200 }} alt="img-over" /> </span>
                            </span> </>}
                        </h2>
                        <div className="button-container">
                            <button onClick={startGame} className="restart-button">
                                Play Again
                            </button>
                            <button onClick={handleExit} className="exit-button">
                                Exit Game
                            </button>
                            <CopyLinkButton buttonText="Dare a Friend" style={{ backgroundColor: 'orange', padding: '1rem 2rem', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', fontSize: '1.5rem', lineHeight: '2rem', border: 'none', cursor: 'pointer', transition: 'background-color 150ms ease-in-out' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}