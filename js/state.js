import { states, START_POSITION, PIPE_HEIGHT, PIPE_WIDTH, TOTAL_POINTS, PIPE_INTERVAL } from './constants.js';

// Estado global centralizado
export const gameState = {
  currentstate: states.SplashScreen,
  velocity: 0,
  position: START_POSITION,
  rotation: 0,
  score: 0,
  highscore: 0,
  medal: '',
  pipes: [],
  pipeheight: PIPE_HEIGHT,
  pipewidth: PIPE_WIDTH,
  TOTAL_POINTS,
  skyThemeIndex: -1,
  gameFinished: false,
  replayclickable: false,

  // Loops
  loopGameloop: null,
  loopPipeloop: null,

  // Pausa de palavra / fases
  gameIsPausedForWord: false,
  wordPauseTimeout: null,
  countdownInterval: null,
  countdownValue: 0,

  // Pipes timing
  lastPipeTime: 0,
  pipeInterval: PIPE_INTERVAL,
  pauseStartTime: 0
};
