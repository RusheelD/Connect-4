import assert from 'node:assert/strict';
import {
  PLAYER_ONE,
  PLAYER_TWO,
} from '../contracts.js';
import {
  createGameState,
  applyMove,
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

test('applyMove toggles current player after valid move', () => {
  const state = createGameState();
  const result = applyMove(state, 0);
  assert.equal(result.success, true);
  assert.equal(state.currentPlayer, PLAYER_TWO);
});

test('applyMove keeps current player when move is invalid', () => {
  const state = createGameState();
  const result = applyMove(state, -1);
  assert.equal(result.success, false);
  assert.equal(state.currentPlayer, PLAYER_ONE);
});

test('applyMove prevents moves after game is won', () => {
  const state = createGameState();
  state.status = GameStatus.WON;
  const result = applyMove(state, 0);
  assert.equal(result.success, false);
});

run();
