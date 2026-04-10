import {
  BOARD_ROWS,
  BOARD_COLS,
  PLAYER_ONE,
  PLAYER_TWO,
  GameMode,
  Difficulty,
} from './contracts.js';
import {
  createGameState,
  applyMove,
  resetBoard,
  getValidMoves,
  checkWin,
  scoreBoard,
  DifficultyDepth,
  GameStatus,
} from './script.js';

const boardElement = document.querySelector('[data-board]');
const statusText = document.querySelector('[data-status-text]');
const banner = document.querySelector('[data-banner]');
const bannerMessage = document.querySelector('[data-banner-message]');
const playAgainButton = document.querySelector('[data-play-again]');
const resetButton = document.querySelector('[data-reset]');
const modeSelect = document.querySelector('[data-mode-select]');
const difficultySelect = document.querySelector('[data-difficulty-select]');
const difficultyGroup = document.querySelector('[data-difficulty-group]');
const themeSelect = document.querySelector('[data-theme-select]');

const THEME_STORAGE_KEY = 'connect4-theme';

const state = {
  game: createGameState(),
  mode: GameMode.PASS_AND_PLAY,
  difficulty: Difficulty.NORMAL,
  isAiThinking: false,
  lastMove: null,
  winningCells: [],
};

const cellElements = Array.from({ length: BOARD_ROWS }, () =>
  Array.from({ length: BOARD_COLS }, () => null),
);

const centerOrder = [3, 2, 4, 1, 5, 0, 6];

const buildBoard = () => {
  boardElement.innerHTML = '';
  for (let col = 0; col < BOARD_COLS; col += 1) {
    const columnButton = document.createElement('button');
    columnButton.type = 'button';
    columnButton.className = 'board__column';
    columnButton.dataset.col = String(col);
    columnButton.setAttribute('aria-label', `Drop disc in column ${col + 1}`);

    columnButton.addEventListener('click', () => handleColumnClick(col));
    columnButton.addEventListener('mouseenter', () => handleColumnHover(col, true));
    columnButton.addEventListener('mouseleave', () => handleColumnHover(col, false));

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      const cell = document.createElement('div');
      cell.className = 'board__cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);

      const disc = document.createElement('div');
      disc.className = 'disc';
      cell.appendChild(disc);
      columnButton.appendChild(cell);
      cellElements[row][col] = disc;
    }

    boardElement.appendChild(columnButton);
  }
};

const setTheme = (theme) => {
  const body = document.body;
  body.classList.remove('theme-classic', 'theme-neon', 'theme-midnight');
  body.classList.add(`theme-${theme}`);
  themeSelect.value = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const getTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return 'classic';
};

const updateStatusText = () => {
  if (state.isAiThinking) {
    statusText.textContent = 'AI is thinking...';
    return;
  }

  if (state.game.status === GameStatus.WON) {
    if (state.mode === GameMode.AI && state.game.winner === PLAYER_TWO) {
      statusText.textContent = 'AI wins!';
    } else {
      const playerLabel = state.game.winner === PLAYER_ONE ? 'Player 1' : 'Player 2';
      statusText.textContent = `${playerLabel} wins!`;
    }
    return;
  }

  if (state.game.status === GameStatus.DRAW) {
    statusText.textContent = "It's a draw.";
    return;
  }

  if (state.mode === GameMode.AI && state.game.currentPlayer === PLAYER_TWO) {
    statusText.textContent = "AI's turn";
    return;
  }

  const currentLabel = state.game.currentPlayer === PLAYER_ONE ? 'Player 1' : 'Player 2';
  statusText.textContent = `${currentLabel}'s turn`;
};

const updateBanner = () => {
  if (state.game.status === GameStatus.WON) {
    banner.classList.add('is-visible');
    bannerMessage.textContent =
      state.mode === GameMode.AI && state.game.winner === PLAYER_TWO
        ? 'The AI wins. Try again?'
        : `${state.game.winner === PLAYER_ONE ? 'Player 1' : 'Player 2'} wins!`;
    return;
  }

  if (state.game.status === GameStatus.DRAW) {
    banner.classList.add('is-visible');
    bannerMessage.textContent = "It's a draw. Want a rematch?";
    return;
  }

  banner.classList.remove('is-visible');
  bannerMessage.textContent = '';
};

const updateColumnState = () => {
  const disableColumns =
    state.isAiThinking || state.game.status !== GameStatus.PLAYING;
  const validMoves = getValidMoves(state.game.board);

  boardElement.querySelectorAll('.board__column').forEach((column) => {
    const colIndex = Number(column.dataset.col);
    const isEnabled = !disableColumns && validMoves.includes(colIndex);
    column.classList.toggle('is-disabled', !isEnabled);
    column.setAttribute('aria-disabled', String(!isEnabled));
    column.disabled = !isEnabled;
  });
};

const clearPreview = () => {
  boardElement.querySelectorAll('.disc--preview').forEach((disc) => {
    disc.classList.remove('disc--preview', 'disc--player1', 'disc--player2');
  });
};

const handleColumnHover = (col, isEntering) => {
  if (!isEntering) {
    clearPreview();
    return;
  }
  if (state.game.status !== GameStatus.PLAYING || state.isAiThinking) {
    return;
  }
  clearPreview();
  const topDisc = cellElements[0][col];
  if (!topDisc) {
    return;
  }
  if (state.game.board[0][col] !== null) {
    return;
  }
  topDisc.classList.add('disc--preview');
  topDisc.classList.add(
    state.game.currentPlayer === PLAYER_ONE ? 'disc--player1' : 'disc--player2',
  );
};

const renderBoard = () => {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const disc = cellElements[row][col];
      const value = state.game.board[row][col];
      disc.classList.remove('disc--player1', 'disc--player2', 'disc--drop', 'disc--win');
      if (value === PLAYER_ONE) {
        disc.classList.add('disc--player1');
      } else if (value === PLAYER_TWO) {
        disc.classList.add('disc--player2');
      }
    }
  }

  if (state.lastMove) {
    const { row, col } = state.lastMove;
    const disc = cellElements[row]?.[col];
    if (disc) {
      disc.classList.add('disc--drop');
    }
  }

  state.winningCells.forEach(({ row, col }) => {
    const disc = cellElements[row]?.[col];
    if (disc) {
      disc.classList.add('disc--win');
    }
  });
};

const findWinningCells = (board, winner) => {
  if (!winner) {
    return [];
  }

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: 1 },
  ];

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      if (board[row][col] !== winner) {
        continue;
      }
      for (const { dr, dc } of directions) {
        const cells = [{ row, col }];
        for (let step = 1; step < 4; step += 1) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;
          if (
            nextRow < 0 ||
            nextRow >= BOARD_ROWS ||
            nextCol < 0 ||
            nextCol >= BOARD_COLS
          ) {
            break;
          }
          if (board[nextRow][nextCol] !== winner) {
            break;
          }
          cells.push({ row: nextRow, col: nextCol });
        }
        if (cells.length === 4) {
          return cells;
        }
      }
    }
  }

  return [];
};

const handleMoveResult = (result) => {
  if (result.success && result.row !== null) {
    state.lastMove = { row: result.row, col: result.col };
  }

  state.winningCells = findWinningCells(state.game.board, state.game.winner);
  renderBoard();
  updateStatusText();
  updateBanner();
  updateColumnState();
};

const makeBoardCopy = (board) => board.map((row) => row.slice());

const simulateMove = (board, col, player) => {
  const copy = makeBoardCopy(board);
  for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
    if (copy[row][col] === null) {
      copy[row][col] = player;
      return copy;
    }
  }
  return copy;
};

const evaluateMoves = (board, player) => {
  const validMoves = getValidMoves(board);
  let bestMove = validMoves[0] ?? 0;
  let bestScore = -Infinity;

  validMoves.forEach((move) => {
    const nextBoard = simulateMove(board, move, player);
    const score = scoreBoard(nextBoard, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
};

const minimax = (board, depth, alpha, beta, maximizing) => {
  const winner = checkWin(board);
  if (winner === PLAYER_TWO) {
    return 1000 + depth;
  }
  if (winner === PLAYER_ONE) {
    return -1000 - depth;
  }
  if (depth === 0 || getValidMoves(board).length === 0) {
    return scoreBoard(board, PLAYER_TWO);
  }

  if (maximizing) {
    let value = -Infinity;
    for (const move of getValidMoves(board)) {
      const nextBoard = simulateMove(board, move, PLAYER_TWO);
      value = Math.max(value, minimax(nextBoard, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) {
        break;
      }
    }
    return value;
  }

  let value = Infinity;
  for (const move of getValidMoves(board)) {
    const nextBoard = simulateMove(board, move, PLAYER_ONE);
    value = Math.min(value, minimax(nextBoard, depth - 1, alpha, beta, true));
    beta = Math.min(beta, value);
    if (beta <= alpha) {
      break;
    }
  }
  return value;
};

const selectAiMove = () => {
  const validMoves = getValidMoves(state.game.board);
  if (validMoves.length === 0) {
    return 0;
  }

  for (const move of validMoves) {
    const nextBoard = simulateMove(state.game.board, move, PLAYER_TWO);
    if (checkWin(nextBoard) === PLAYER_TWO) {
      return move;
    }
  }

  for (const move of validMoves) {
    const nextBoard = simulateMove(state.game.board, move, PLAYER_ONE);
    if (checkWin(nextBoard) === PLAYER_ONE) {
      return move;
    }
  }

  const depth = Math.min(DifficultyDepth[state.difficulty] ?? 2, 4);
  if (depth <= 2) {
    return evaluateMoves(state.game.board, PLAYER_TWO);
  }

  let bestScore = -Infinity;
  let bestMove = validMoves[0];
  for (const move of centerOrder.filter((col) => validMoves.includes(col))) {
    const nextBoard = simulateMove(state.game.board, move, PLAYER_TWO);
    const score = minimax(nextBoard, depth - 1, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const triggerAiMove = () => {
  if (state.game.status !== GameStatus.PLAYING) {
    return;
  }
  state.isAiThinking = true;
  updateStatusText();
  updateColumnState();

  window.setTimeout(() => {
    if (state.game.status !== GameStatus.PLAYING) {
      state.isAiThinking = false;
      updateStatusText();
      updateColumnState();
      return;
    }
    const aiMove = selectAiMove();
    const result = applyMove(state.game, aiMove);
    state.isAiThinking = false;
    handleMoveResult(result);
  }, 320);
};

const handleColumnClick = (col) => {
  if (state.game.status !== GameStatus.PLAYING || state.isAiThinking) {
    return;
  }

  if (state.mode === GameMode.AI && state.game.currentPlayer === PLAYER_TWO) {
    return;
  }

  const result = applyMove(state.game, col);
  handleMoveResult(result);

  if (
    state.mode === GameMode.AI &&
    state.game.status === GameStatus.PLAYING &&
    state.game.currentPlayer === PLAYER_TWO
  ) {
    triggerAiMove();
  }
};

const resetGame = () => {
  state.game = createGameState();
  state.lastMove = null;
  state.winningCells = [];
  state.isAiThinking = false;
  resetBoard(state.game.board);
  if (state.mode === GameMode.AI && state.game.currentPlayer === PLAYER_TWO) {
    triggerAiMove();
  }
  handleMoveResult({ success: false, row: null, col: -1 });
};

modeSelect.addEventListener('change', (event) => {
  state.mode = event.target.value === GameMode.AI ? GameMode.AI : GameMode.PASS_AND_PLAY;
  difficultyGroup.hidden = state.mode !== GameMode.AI;
  resetGame();
});

difficultySelect.addEventListener('change', (event) => {
  state.difficulty = event.target.value;
  if (state.mode === GameMode.AI) {
    resetGame();
  }
});

themeSelect.addEventListener('change', (event) => {
  setTheme(event.target.value);
});

resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame);

buildBoard();
setTheme(getTheme());
difficultyGroup.hidden = state.mode !== GameMode.AI;
renderBoard();
updateStatusText();
updateBanner();
updateColumnState();
