import assert from 'node:assert/strict';
import { PLAYER_ONE, PLAYER_TWO } from '../contracts.js';
import {
  createBoard,
  scoreBoard,
  DifficultyDepth,
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

test('scoreBoard favors center control', () => {
  const board = createBoard();
  board[5][3] = PLAYER_ONE;
  const centerScore = scoreBoard(board, PLAYER_ONE);

  const edgeBoard = createBoard();
  edgeBoard[5][0] = PLAYER_ONE;
  const edgeScore = scoreBoard(edgeBoard, PLAYER_ONE);

  assert.ok(centerScore > edgeScore);
});

test('scoreBoard penalizes immediate opponent wins', () => {
  const board = createBoard();
  board[5][0] = PLAYER_TWO;
  board[5][1] = PLAYER_TWO;
  board[5][2] = PLAYER_TWO;
  board[5][3] = PLAYER_TWO;
  const score = scoreBoard(board, PLAYER_ONE);
  assert.ok(score < 0);
});

test('DifficultyDepth maps presets to depths', () => {
  assert.equal(DifficultyDepth.easy, 2);
  assert.equal(DifficultyDepth.normal, 4);
  assert.equal(DifficultyDepth.hard, 6);
  assert.equal(DifficultyDepth.expert >= 7, true);
});

run();
