'use strict';

const markCell = require('../../../src/public/minesweeper/markCell');
const MineSweeper = require('../../../src/models/minesweeper');

beforeAll(() => {
  process.env.MONGODB = 'mongodb://localhost:27017/test';
});

test('it should give a 404 response', async () => {
  const event = {
    pathParameters: {
      id: '000000000000000000000000',
    },
    body: JSON.stringify({
      position: {
        x: 10,
        y: 10,
      },
    }),
  };
  const result = await markCell.reveal(event);

  expect(result.statusCode).toBe(404);
});

test('it should give a 4xx response', async () => {
  const boardSize = {columns: 5, rows: 5};
  const bombs = 1;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: -10,
        y: 10,
      },
    }),
  };
  const result = await markCell.reveal(event);
  expect(result.statusCode).toBe(400);
});

test('it should update a game', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: 0,
        y: 0,
      },
    }),
  };
  const result = await markCell.reveal(event);
  expect(result.statusCode).toBe(200);
});

test('it should give a 4xx response', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: -10,
        y: 10,
      },
    }),
  };
  const result = await markCell.asBomb(event);
  expect(result.statusCode).toBe(400);
});

test('it should give a 404 response', async () => {
  const event = {
    pathParameters: {
      id: '000000000000000000000000',
    },
    body: JSON.stringify({
      position: {
        x: 10,
        y: 10,
      },
    }),
  };
  const result = await markCell.asBomb(event);

  expect(result.statusCode).toBe(404);
});

test('it should update a game', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: 0,
        y: 0,
      },
    }),
  };
  const result = await markCell.asBomb(event);
  expect(result.statusCode).toBe(200);
});

test('it should give a 404 response', async () => {
  const event = {
    pathParameters: {
      id: '000000000000000000000000',
    },
    body: JSON.stringify({
      position: {
        x: 10,
        y: 10,
      },
    }),
  };
  const result = await markCell.asQuestion(event);

  expect(result.statusCode).toBe(404);
});

test('it should give a 4xx response', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: -10,
        y: 10,
      },
    }),
  };
  const result = await markCell.asQuestion(event);
  expect(result.statusCode).toBe(400);
});

test('it should update a game', async () => {
  const boardSize = {columns: 10, rows: 10};
  const bombs = 10;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const event = {
    pathParameters: {
      id: game._id,
    },
    body: JSON.stringify({
      position: {
        x: 0,
        y: 0,
      },
    }),
  };
  const result = await markCell.asQuestion(event);
  expect(result.statusCode).toBe(200);
});
