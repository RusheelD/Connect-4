import assert from 'node:assert/strict';
import {
  BOARD_ROWS,
  BOARD_COLS,
  EMPTY_CELL,
  PLAYER_ONE,
  PLAYER_TWO,
} from '../contracts.js';
import {
  createBoard,
  dropDisc,
  getValidMoves,
  resetBoard,
  GameStatus,
} from '../script.js';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

const run = () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${name}`);
      console.error(error);
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  }
  console.log(`\n${tests.length} test(s) passed.`);
};

test('createBoard returns a 6x7 grid of empty cells', () => {
  const board = createBoard();
  assert.equal(board.length, BOARD_ROWS);
  board.forEach((row) => {
    assert.equal(row.length, BOARD_COLS);
    row.forEach((cell) => assert.equal(cell, EMPTY_CELL));
  });
});

test('dropDisc places disc in lowest available row', () => {
  const board = createBoard();
  const rowIndex = dropDisc(board, 2, PLAYER_ONE);
  assert.equal(rowIndex, BOARD_ROWS - 1);
  assert.equal(board[BOARD_ROWS - 1][2], PLAYER_ONE);
});

test('dropDisc stacks discs upward within a column', () => {
  const board = createBoard();
  dropDisc(board, 4, PLAYER_ONE);
  const rowIndex = dropDisc(board, 4, PLAYER_TWO);
  assert.equal(rowIndex, BOARD_ROWS - 2);
  assert.equal(board[BOARD_ROWS - 2][4], PLAYER_TWO);
});

test('dropDisc returns null for a full column', () => {
  const board = createBoard();
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    dropDisc(board, 0, PLAYER_ONE);
  }
  assert.equal(dropDisc(board, 0, PLAYER_TWO), null);
});

test('getValidMoves excludes full columns', () => {
  const board = createBoard();
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    dropDisc(board, 1, PLAYER_ONE);
  }
  const moves = getValidMoves(board);
  assert.ok(!moves.includes(1));
  assert.ok(moves.includes(0));
});

test('resetBoard clears board state and returns playing status', () => {
  const board = createBoard();
  dropDisc(board, 3, PLAYER_ONE);
  const result = resetBoard(board);
  board.forEach((row) => row.forEach((cell) => assert.equal(cell, EMPTY_CELL)));
  assert.equal(result.status, GameStatus.PLAYING);
  assert.equal(result.winner, null);
});

run();
