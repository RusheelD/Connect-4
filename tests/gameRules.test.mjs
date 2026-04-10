import assert from 'node:assert/strict';
import {
  BOARD_ROWS,
  BOARD_COLS,
  EMPTY_CELL,
  PLAYER_ONE,
  PLAYER_TWO,
} from '../contracts.js';
import { checkWin, checkDraw } from '../script.js';

const makeEmptyBoard = () =>
  Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => EMPTY_CELL),
  );

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

test('checkWin detects horizontal four-in-a-row', () => {
  const board = makeEmptyBoard();
  board[5][0] = PLAYER_ONE;
  board[5][1] = PLAYER_ONE;
  board[5][2] = PLAYER_ONE;
  board[5][3] = PLAYER_ONE;
  assert.equal(checkWin(board), PLAYER_ONE);
});

test('checkWin detects vertical four-in-a-row', () => {
  const board = makeEmptyBoard();
  board[5][2] = PLAYER_TWO;
  board[4][2] = PLAYER_TWO;
  board[3][2] = PLAYER_TWO;
  board[2][2] = PLAYER_TWO;
  assert.equal(checkWin(board), PLAYER_TWO);
});

test('checkWin detects downward diagonal four-in-a-row', () => {
  const board = makeEmptyBoard();
  board[2][0] = PLAYER_ONE;
  board[3][1] = PLAYER_ONE;
  board[4][2] = PLAYER_ONE;
  board[5][3] = PLAYER_ONE;
  assert.equal(checkWin(board), PLAYER_ONE);
});

test('checkWin detects upward diagonal four-in-a-row', () => {
  const board = makeEmptyBoard();
  board[5][0] = PLAYER_TWO;
  board[4][1] = PLAYER_TWO;
  board[3][2] = PLAYER_TWO;
  board[2][3] = PLAYER_TWO;
  assert.equal(checkWin(board), PLAYER_TWO);
});

test('checkWin returns null when no winner', () => {
  const board = makeEmptyBoard();
  board[5][0] = PLAYER_ONE;
  board[5][1] = PLAYER_TWO;
  board[5][2] = PLAYER_ONE;
  board[5][3] = PLAYER_TWO;
  assert.equal(checkWin(board), null);
});

test('checkDraw returns false when board is not full', () => {
  const board = makeEmptyBoard();
  assert.equal(checkDraw(board), false);
});

test('checkDraw returns true when board is full without a winner', () => {
  const board = [
    [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
    [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
    [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
    [PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO],
    [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
    [PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE, PLAYER_TWO, PLAYER_ONE],
  ];
  assert.equal(checkWin(board), null);
  assert.equal(checkDraw(board), true);
});

run();
