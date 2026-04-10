import {
  BOARD_ROWS,
  BOARD_COLS,
  PLAYER_ONE,
  PLAYER_TWO,
  EMPTY_CELL,
  GameStatus,
  Difficulty,
} from './contracts.js';

export { GameStatus } from './contracts.js';

export const DifficultyDepth = Object.freeze({
  [Difficulty.EASY]: 2,
  [Difficulty.NORMAL]: 4,
  [Difficulty.HARD]: 6,
  [Difficulty.EXPERT]: 7,
});

export const createBoard = () =>
  Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => EMPTY_CELL),
  );

export const dropDisc = (board, col, player) => {
  if (!Number.isInteger(col) || col < 0 || col >= BOARD_COLS) {
    return null;
  }
  for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === EMPTY_CELL) {
      board[row][col] = player;
      return row;
    }
  }
  return null;
};

export const getValidMoves = (board) =>
  Array.from({ length: BOARD_COLS }, (_, col) => col).filter(
    (col) => board[0][col] === EMPTY_CELL,
  );

export const resetBoard = (board) => {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      board[row][col] = EMPTY_CELL;
    }
  }
  return { status: GameStatus.PLAYING, winner: null };
};

export const checkWin = (board) => {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: 1 },
  ];

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const cell = board[row][col];
      if (!cell) {
        continue;
      }
      for (const { dr, dc } of directions) {
        let count = 1;
        let r = row + dr;
        let c = col + dc;
        while (
          r >= 0 &&
          r < BOARD_ROWS &&
          c >= 0 &&
          c < BOARD_COLS &&
          board[r][c] === cell
        ) {
          count += 1;
          if (count === 4) {
            return cell;
          }
          r += dr;
          c += dc;
        }
      }
    }
  }
  return null;
};

export const checkDraw = (board) => {
  if (checkWin(board)) {
    return false;
  }
  return getValidMoves(board).length === 0;
};

export const createGameState = () => ({
  board: createBoard(),
  currentPlayer: PLAYER_ONE,
  status: GameStatus.PLAYING,
  winner: null,
});

const togglePlayer = (player) => (player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE);

export const applyMove = (state, col) => {
  if (state.status !== GameStatus.PLAYING) {
    return {
      success: false,
      row: null,
      col,
      player: state.currentPlayer,
      status: state.status,
      winner: state.winner,
    };
  }

  const row = dropDisc(state.board, col, state.currentPlayer);
  if (row === null) {
    return {
      success: false,
      row: null,
      col,
      player: state.currentPlayer,
      status: state.status,
      winner: state.winner,
    };
  }

  const winner = checkWin(state.board);
  if (winner) {
    state.status = GameStatus.WON;
    state.winner = winner;
  } else if (checkDraw(state.board)) {
    state.status = GameStatus.DRAW;
    state.winner = null;
  } else {
    state.currentPlayer = togglePlayer(state.currentPlayer);
  }

  return {
    success: true,
    row,
    col,
    player: state.currentPlayer,
    status: state.status,
    winner: state.winner,
  };
};

const evaluateWindow = (window, player) => {
  const opponent = player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  const playerCount = window.filter((cell) => cell === player).length;
  const opponentCount = window.filter((cell) => cell === opponent).length;
  const emptyCount = window.filter((cell) => cell === EMPTY_CELL).length;

  if (playerCount === 4) {
    return 100;
  }
  if (playerCount === 3 && emptyCount === 1) {
    return 5;
  }
  if (playerCount === 2 && emptyCount === 2) {
    return 2;
  }
  if (opponentCount === 3 && emptyCount === 1) {
    return -6;
  }
  return 0;
};

export const scoreBoard = (board, player) => {
  const winner = checkWin(board);
  if (winner === player) {
    return 100000;
  }
  if (winner) {
    return -100000;
  }

  let score = 0;
  const centerCol = Math.floor(BOARD_COLS / 2);
  let centerCount = 0;
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    if (board[row][centerCol] === player) {
      centerCount += 1;
    }
  }
  score += centerCount * 3;

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS - 3; col += 1) {
      const window = [
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let col = 0; col < BOARD_COLS; col += 1) {
    for (let row = 0; row < BOARD_ROWS - 3; row += 1) {
      const window = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col],
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let row = 0; row < BOARD_ROWS - 3; row += 1) {
    for (let col = 0; col < BOARD_COLS - 3; col += 1) {
      const window = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let row = 3; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS - 3; col += 1) {
      const window = [
        board[row][col],
        board[row - 1][col + 1],
        board[row - 2][col + 2],
        board[row - 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }

  return score;
};
