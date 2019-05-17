'use strict';

const startGame = require('../../../src/public/minesweeper/startGame');

test('it should give a 4xx response', async () => {
  const event = {
    body: JSON.stringify({
      'x': -10,
      'y': 10,
      'bombCount': 10,
    }),
  };
  const result = await startGame.start(event);
  expect(result.statusCode).toBe(400);
});

test('it should create a new game', async () => {
  const event = {
    body: JSON.stringify({
      'x': 10,
      'y': 10,
      'bombCount': 10,
    }),
  };
  const result = await startGame.start(event);
  const parsedResult = JSON.parse(result.body);
  expect(result.statusCode).toBe(200);
  expect(parsedResult._id).toBeDefined();
  expect(parsedResult.size.columns).toBe(10);
  expect(parsedResult.size.rows).toBe(10);
  expect(parsedResult.bombs).toBe(10);
  expect(parsedResult.startedAt).toBeDefined();
});
