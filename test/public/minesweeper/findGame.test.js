'use strict';

const findGame = require('../../../src/public/minesweeper/findGame');
const MineSweeper = require('../../../src/models/minesweeper');

beforeAll(() => {
  process.env.MONGODB = 'mongodb://localhost:27017/test';
});

test('it should give a 4xx response', async () => {
  const event = {
    pathParameters: {
      id: '000000000000000000000000',
    },
  };
  const result = await findGame.find(event);
  expect(result.statusCode).toBe(404);
});

test('it should find an existing game', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
  };
  const result = await findGame.find(event);
  const parsedResult = JSON.parse(result.body);
  expect(result.statusCode).toBe(200);
  expect(parsedResult._id).toBeDefined();
  expect(parsedResult.size.columns).toBe(10);
  expect(parsedResult.size.rows).toBe(10);
  expect(parsedResult.bombs).toBe(10);
  expect(parsedResult.startedAt).toBeDefined();
});
