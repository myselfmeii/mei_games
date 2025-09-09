import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabase } from './useSupabase';
import { generateRoomCode, calculateScores, getRandomLetter } from './gameLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    status: 'waiting',
    currentRound: 0,
    totalRounds: 15,
    timerDuration: 45,
    currentLetter: '',
    players: {},
    answers: {},
    scores: {},
    roundScores: {},
    duplicates: {},
    host: null,
    disconnectedPlayers: []
  });
  
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false); 
  const [disconnectedPlayers, setDisconnectedPlayers] = useState([]);
  const [playerLeftMessages, setPlayerLeftMessages] = useState([]);
  
  const { supabase, subscribeToRoom, unsubscribeFromRoom } = useSupabase();
  const gameStateRef = useRef(gameState);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const debugLog = useCallback((message, data) => {
    console.log(`🎮 [GameState] ${message}:`, data);
  }, []);

  const handlePlayerDisconnect = useCallback((leftPlayerName) => {
    debugLog('Player disconnected', { leftPlayerName });
    
    setDisconnectedPlayers(prev => {
      if (prev.includes(leftPlayerName)) return prev;
      return [...prev, leftPlayerName];
    });

    const messageId = Date.now();
    setPlayerLeftMessages(prev => [...prev, { 
      id: messageId, 
      playerName: leftPlayerName, 
      timestamp: Date.now() 
    }]);

    setTimeout(() => {
      setPlayerLeftMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, 5000);

    setGameState(prevState => {
      if (!prevState.players[leftPlayerName]) return prevState;
      
      const { [leftPlayerName]: removedPlayer, ...remainingPlayers } = prevState.players;
      const { [leftPlayerName]: removedScore, ...remainingScores } = prevState.scores;
      
      let newHost = prevState.host;
      if (leftPlayerName === prevState.host && Object.keys(remainingPlayers).length > 0) {
        newHost = Object.keys(remainingPlayers)[0];
        if (remainingPlayers[newHost]) {
          remainingPlayers[newHost].isHost = true;
        }
      }

      return {
        ...prevState,
        players: remainingPlayers,
        scores: remainingScores,
        host: newHost
      };
    });
  }, [debugLog]);

  const resetGameState = useCallback(() => {
    debugLog('Resetting all game state');
    
    setGameState({
      status: 'waiting',
      currentRound: 0,
      totalRounds: 15,
      timerDuration: 45,
      currentLetter: '',
      players: {},
      answers: {},
      scores: {},
      roundScores: {},
      duplicates: {},
      host: null,
      disconnectedPlayers: []
    });
    
    setPlayerName('');
    setRoomCode('');
    setIsHost(false);
    setIsConnected(false);
    setIsJoining(false); 
    setDisconnectedPlayers([]);
    setPlayerLeftMessages([]);
    
    unsubscribeFromRoom();
  }, [debugLog, unsubscribeFromRoom]);

  const updateGameState = useCallback((updates) => {
    debugLog('Updating game state locally', updates);
    setGameState(prevState => ({ ...prevState, ...updates }));
  }, [debugLog]);

  const createRoom = useCallback(async (name, settings) => {
    try {
      resetGameState();
      
      const newRoomCode = generateRoomCode();
      debugLog('Creating room', { roomCode: newRoomCode, name, settings });
      
      const initialState = {
        status: 'waiting',
        currentRound: 0,
        totalRounds: settings.totalRounds,
        timerDuration: settings.timerDuration,
        currentLetter: '',
        players: { [name]: { name, isHost: true, ready: true } },
        answers: {},
        scores: { [name]: 0 },
        roundScores: {},
        duplicates: {},
        host: name,
        disconnectedPlayers: []
      };

      try {
        subscribeToRoom(newRoomCode, (payload) => {
          debugLog('Real-time update received (HOST)', payload);
          if (payload.new && payload.new.game_state) {
            setGameState(payload.new.game_state);
          }
        });
      } catch (subscriptionError) {
        debugLog('Subscription setup failed (non-critical)', subscriptionError);
      }

      const { data, error } = await supabase
        .from('game_rooms')
        .insert({
          room_code: newRoomCode,
          game_state: initialState,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        debugLog('Database insert error', error);
        if (error.code === '42P01') {
          throw new Error('Table "game_rooms" does not exist. Please run the database setup script.');
        } else if (error.code === '42501') {
          throw new Error('Permission denied. Please check your database policies.');
        } else if (error.code === '23505') {
          throw new Error('Room code already exists. Please try again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      setGameState(initialState);
      setPlayerName(name);
      setRoomCode(newRoomCode);
      setIsHost(true);
      setIsConnected(true);

      return newRoomCode;
    } catch (error) {
      resetGameState();
      throw error;
    }
  }, [supabase, subscribeToRoom, debugLog, resetGameState]);

  const joinRoom = useCallback(async (name, code) => {
    try {
      setIsJoining(true); 
      resetGameState();
      
      debugLog('Joining room', { name, code });

      const { data: roomData, error: fetchError } = await supabase
        .from('game_rooms')
        .select('game_state')
        .eq('room_code', code)
        .single();

      if (fetchError || !roomData) {
        throw new Error('Room not found');
      }

      const currentGameState = roomData.game_state;
      
      if (currentGameState.status !== 'waiting') {
        throw new Error('Room already started - cannot join game in progress');
      }

      if (currentGameState.players[name]) {
        throw new Error('Player name already exists in this room');
      }

      if (Object.keys(currentGameState.players).length >= 8) {
        throw new Error('Room is full - maximum 8 players allowed');
      }

      try {
        subscribeToRoom(code, (payload) => {
          debugLog('Real-time update received (JOINER)', payload);
          if (payload.new && payload.new.game_state) {
            setGameState(payload.new.game_state);
          }
        });
      } catch (subscriptionError) {
        debugLog('Subscription setup failed (non-critical)', subscriptionError);
      }

      const updatedState = {
        ...currentGameState,
        players: {
          ...currentGameState.players,
          [name]: { name, isHost: false, ready: true }
        },
        scores: {
          ...currentGameState.scores,
          [name]: 0
        }
      };

      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ game_state: updatedState })
        .eq('room_code', code);

      if (updateError) {
        throw updateError;
      }

      setPlayerName(name);
      setRoomCode(code);
      setIsHost(false);
      setIsConnected(true);
      setIsJoining(false);
      setGameState(updatedState);

      return true;
    } catch (error) {
      setIsJoining(false); 
      resetGameState();
      throw error;
    }
  }, [supabase, subscribeToRoom, debugLog, resetGameState]);

  const checkRoomStatus = useCallback(async (code) => {
    try {
      const { data: roomData, error } = await supabase
        .from('game_rooms')
        .select('game_state')
        .eq('room_code', code)
        .single();

      if (error || !roomData) {
        return { exists: false, status: null, playerCount: 0, canJoin: false };
      }

      const gameState = roomData.game_state;
      const playerCount = Object.keys(gameState.players).length;
      const canJoin = gameState.status === 'waiting' && playerCount < 8;

      return {
        exists: true,
        status: gameState.status,
        playerCount,
        canJoin,
        players: Object.keys(gameState.players)
      };
    } catch (error) {
      return { exists: false, status: null, playerCount: 0, canJoin: false };
    }
  }, [supabase]);

  const leaveRoom = useCallback(async () => {
    try {
      if (!roomCode || !playerName) return;

      const { data: roomData, error: fetchError } = await supabase
        .from('game_rooms')
        .select('game_state')
        .eq('room_code', roomCode)
        .single();

      if (!fetchError && roomData) {
        const currentState = roomData.game_state;
        
        const { [playerName]: removedPlayer, ...remainingPlayers } = currentState.players;
        const { [playerName]: removedScore, ...remainingScores } = currentState.scores;

        const updatedDisconnectedPlayers = [...(currentState.disconnectedPlayers || [])];
        if (!updatedDisconnectedPlayers.includes(playerName)) {
          updatedDisconnectedPlayers.push(playerName);
        }

        let newHost = currentState.host;
        if (isHost && Object.keys(remainingPlayers).length > 0) {
          newHost = Object.keys(remainingPlayers)[0];
          remainingPlayers[newHost].isHost = true;
        }

        const updatedState = {
          ...currentState,
          players: remainingPlayers,
          scores: remainingScores,
          host: newHost,
          disconnectedPlayers: updatedDisconnectedPlayers
        };

        if (Object.keys(remainingPlayers).length === 0) {
          await supabase.from('game_rooms').delete().eq('room_code', roomCode);
        } else {
          await supabase.from('game_rooms').update({ game_state: updatedState }).eq('room_code', roomCode);
        }
      }

      resetGameState();
    } catch (error) {
      resetGameState();
    }
  }, [roomCode, playerName, isHost, supabase, resetGameState]);

  useEffect(() => {
    if (!gameState.disconnectedPlayers) return;
    
    gameState.disconnectedPlayers.forEach(disconnectedPlayer => {
      if (!disconnectedPlayers.includes(disconnectedPlayer) && disconnectedPlayer !== playerName) {
        handlePlayerDisconnect(disconnectedPlayer);
      }
    });
  }, [gameState.disconnectedPlayers, disconnectedPlayers, handlePlayerDisconnect, playerName]);

  const startGame = useCallback(async () => {
    if (!isHost || !roomCode) return;

    try {
      const newLetter = getRandomLetter();
      const updatedState = {
        ...gameStateRef.current,
        status: 'playing',
        currentRound: 1,
        currentLetter: newLetter,
        answers: {},
        roundScores: {},
        duplicates: {}
      };

      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: updatedState })
        .eq('room_code', roomCode);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to start game: ${error.message}`);
    }
  }, [isHost, supabase, roomCode]);

  const submitAnswers = useCallback(async (answers) => {
    if (!roomCode || !playerName) return;

    try {
      const updatedState = {
        ...gameStateRef.current,
        answers: {
          ...gameStateRef.current.answers,
          [playerName]: answers
        }
      };

      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: updatedState })
        .eq('room_code', roomCode);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to submit answers: ${error.message}`);
    }
  }, [playerName, supabase, roomCode]);

  const processRoundComplete = useCallback(async () => {
    if (!isHost || !roomCode) return;

    try {
      const currentState = gameStateRef.current;
      const { roundScores, duplicates } = calculateScores(
        currentState.answers,
        Object.keys(currentState.players)
      );

      const updatedScores = {};
      Object.keys(currentState.players).forEach(player => {
        updatedScores[player] = (currentState.scores[player] || 0) + (roundScores[player] || 0);
      });

      const isGameComplete = currentState.currentRound >= currentState.totalRounds;

      if (isGameComplete) {
        const updatedState = {
          ...currentState,
          status: 'final',
          roundScores,
          duplicates,
          scores: updatedScores,
          finalRoundData: { roundScores, duplicates, answers: currentState.answers }
        };

        const { error } = await supabase
          .from('game_rooms')
          .update({ game_state: updatedState })
          .eq('room_code', roomCode);

        if (error) throw error;
      } else {
        const nextRound = currentState.currentRound + 1;
        const newLetter = getRandomLetter();

        const updatedState = {
          ...currentState,
          status: 'playing',
          currentRound: nextRound,
          currentLetter: newLetter,
          answers: {},
          scores: updatedScores,
          roundScores: {},
          duplicates: {}
        };

        const { error } = await supabase
          .from('game_rooms')
          .update({ game_state: updatedState })
          .eq('room_code', roomCode);

        if (error) throw error;
      }
    } catch (error) {
      throw new Error(`Failed to process round: ${error.message}`);
    }
  }, [isHost, supabase, roomCode]);

  useEffect(() => {
    return () => unsubscribeFromRoom();
  }, [unsubscribeFromRoom]);

  return {
    gameState,
    playerName,
    roomCode,
    isHost,
    isConnected,
    isJoining, 
    disconnectedPlayers,
    playerLeftMessages,
    updateGameState,
    joinRoom,
    createRoom,
    submitAnswers,
    processRoundComplete,
    startGame,
    setPlayerName,
    checkRoomStatus,
    leaveRoom,
    resetGameState,
    handlePlayerDisconnect
  };
};
