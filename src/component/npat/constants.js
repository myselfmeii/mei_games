export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  ROOM_CODE_LENGTH: 6,
  CATEGORIES: ['name', 'place', 'animal', 'thing'],
  POINTS_PER_CATEGORY: 25,
  DUPLICATE_PENALTY: -25,
  MAX_ROUND_SCORE: 100
};

export const TIMER_OPTIONS = [30, 45, 60];
export const ROUNDS_OPTIONS = [10, 15, 20, 25];

export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  RESULTS: 'results',
  FINAL: 'final'
};

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Room not found',
  NICKNAME_REQUIRED: 'Please enter a nickname',
  ROOM_CODE_REQUIRED: 'Please enter a room code',
  FAILED_TO_CREATE: 'Failed to create room',
  FAILED_TO_JOIN: 'Failed to join room',
  CONNECTION_ERROR: 'Connection error. Please try again.'
};

export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Room created successfully!',
  JOINED_ROOM: 'Joined room successfully!',
  GAME_STARTED: 'Game started!',
  ANSWERS_SUBMITTED: 'Answers submitted!'
};
