/**
 * Shared game contracts/constants for Connect 4.
 * Keep in sync across engine, AI, and UI modules.
 */

/** Board dimensions */
export const BOARD_ROWS = 6;
export const BOARD_COLS = 7;

/** Token values */
export const PLAYER_ONE = 'R';
export const PLAYER_TWO = 'Y';
export const EMPTY_CELL = null;

/**
 * @typedef {'R' | 'Y'} PlayerToken
 * @typedef {null | 'R' | 'Y'} CellValue
 * @typedef {CellValue[][]} BoardState
 * @typedef {'playing' | 'won' | 'draw'} GameStatus
 * @typedef {'pass-and-play' | 'ai'} GameMode
 * @typedef {'easy' | 'normal' | 'hard' | 'expert'} DifficultyLevel
 * @typedef {{
 *   board: BoardState,
 *   currentPlayer: PlayerToken,
 *   status: GameStatus,
 *   winner: PlayerToken | null
 * }} GameState
 * @typedef {{
 *   success: boolean,
 *   row: number | null,
 *   col: number,
 *   player: PlayerToken,
 *   status: GameStatus,
 *   winner: PlayerToken | null
 * }} MoveResult
 */

/** Status values */
export const GameStatus = Object.freeze({
  PLAYING: 'playing',
  WON: 'won',
  DRAW: 'draw',
});

/** Mode values */
export const GameMode = Object.freeze({
  PASS_AND_PLAY: 'pass-and-play',
  AI: 'ai',
});

/** Difficulty values */
export const Difficulty = Object.freeze({
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert',
});
