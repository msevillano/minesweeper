'use strict';

const mongoose = require('mongoose');

const MineSweeper = require('../../../src/models/minesweeper');
const Board = require('../../../src/models/minesweeper/board');
const cellStatuses = require('../../../src/models/minesweeper/cell')
    .cellStatuses;
const connect = require('../../../src/utils/db/connectToDb');

beforeAll(() => connect('mongodb://localhost:27017/tests'));
afterAll(() => mongoose.disconnect());

test('.startGame(): it should throw if missing parameters', async () => {
  const bombs = 1000;

  let err1;
  try {
    await MineSweeper.create({size: {columns: 3, rows: 3}, bombs: undefined});
  } catch (error) {
    err1 = error;
  }
  expect(err1).toBeDefined();

  let err2;
  try {
    await MineSweeper.create({size: undefined, bombs: bombs});
  } catch (error) {
    err2 = error;
  }
  expect(err2).toBeDefined();

  let err3;
  try {
    await MineSweeper.create({size: {columns: 3}, bombs: bombs});
  } catch (error) {
    err3 = error;
  }
  expect(err3).toBeDefined();

  let err4;
  try {
    await MineSweeper.create({size: {rows: 3}, bombs: bombs});
  } catch (error) {
    err4 = error;
  }
  expect(err4).toBeDefined();
});

test('.startGame(): it should throw if invalid parameters', async () => {
  const bombs = 1000;

  let err1;
  try {
    await MineSweeper.create({size: {columns: -10, rows: 10}, bombs: bombs});
  } catch (error) {
    err1 = error;
  }
  expect(err1).toBeDefined();

  let err2;
  try {
    await MineSweeper.create({size: {columns: 10, rows: -10}, bombs: bombs});
  } catch (error) {
    err2 = error;
  }
  expect(err2).toBeDefined();

  let err3;
  try {
    await MineSweeper.create({size: {columns: 10, rows: 10}, bombs: bombs});
  } catch (error) {
    err3 = error;
  }
  expect(err3).toBeDefined();
});

test('.startGame(): it should create a new game', async () => {
  const boardSize = {columns: 5, rows: 12};
  const bombs = 16;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  const bombCount = game.board.cells.flat().reduce((bombCount, cell) => {
    if (cell.bomb) return bombCount + 1;
    return bombCount;
  }, 0);

  expect(game.board.cells.length).toBe(boardSize.columns);
  game.board.cells.forEach((column) => {
    expect(column.length).toBe(boardSize.rows);
  });
  expect(bombCount).toBe(bombs);
  expect(game.startedAt.getTime()/1000)
      .toBeCloseTo(new Date().getTime()/1000, 0);
  expect(game.finished).toBeFalsy();
});

test('.startGame(): it should save a game', async () => {
  const boardSize = {columns: 5, rows: 12};
  const bombs = 16;
  const game = await MineSweeper.create({size: boardSize, bombs: bombs});

  await game.save({size: boardSize, bombs: 2});

  const bombCount = game.board.cells.flat().reduce((bombCount, cell) => {
    if (cell.bomb) return bombCount + 1;
    return bombCount;
  }, 0);

  expect(game.board.cells.length).toBe(boardSize.columns);
  game.board.cells.forEach((column) => {
    expect(column.length).toBe(boardSize.rows);
  });
  expect(bombCount).toBe(bombs);
  expect(game.startedAt.getTime()/1000)
      .toBeCloseTo(new Date().getTime()/1000, 0);
  expect(game.finished).toBeFalsy();
});

test('.endGame(): it should end an existing game in course', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  await game.endGame();

  expect(game.finished).toBeTruthy();
  expect(game.finishedAt.getTime()/1000)
      .toBeCloseTo(new Date().getTime()/1000, 0);
});

test('.endGame(): it should ignore when game already ended', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  game.endGame();

  const gameEndedAt = game.finishedAt;
  game.endGame();

  expect(game.finished).toBeTruthy();
  expect(game.finishedAt.getTime()).toBe(gameEndedAt.getTime());
});

test('.revealCell(): it should throw if missing params on request',
    async () => {
      const game = await MineSweeper.create({
        size: {columns: 10, rows: 10},
        bombs: 10});

      expect(() => {
        game.revealCell({x: 1});
      }).toThrow();
      expect(() => {
        game.revealCell({y: 1});
      }).toThrow();
    });

test('.revealCell(): it should throw if trying to reveal a cell outside board',
    async () => {
      const game = await MineSweeper.create({
        size: {columns: 10, rows: 10},
        bombs: 10,
      });

      expect(() => {
        game.revealCell({x: 11, y: 4});
      }).toThrow();
      expect(() => {
        game.revealCell({x: 4, y: 14});
      }).toThrow();
      expect(() => {
        game.revealCell({x: -4, y: 1});
      }).toThrow();
      expect(() => {
        game.revealCell({x: 4, y: -1});
      }).toThrow();
    });

test('.revealCell(): it should ignore when game already ended', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  game.endGame();
  const revealedCells = game.revealCell({x: 4, y: 7});

  expect(revealedCells).toBe(undefined);
  game.board.cells.flat().forEach((cell) => {
    expect(cell.status).toBe(cellStatuses.HIDDEN);
  });
});

test('.revealCell(): it should reveal the full board', async () => {
  const boardCreation = await Board.createBoard(10, 10, []);
  const board = await Board.create({cells: boardCreation});
  const game = await MineSweeper.create({
    board: board,
    finished: false,
  });
  const revealedCells = game.revealCell({x: 4, y: 7});

  expect(revealedCells.length).toBe(100);
  game.board.cells.flat().forEach((cell) => {
    expect(cell.status).toBe(cellStatuses.REVEALED);
  });
  expect(game.finished).toBeTruthy();
});

test('.revealCell(): it should reveal almost full board', async () => {
  const boardCreation = await Board.createBoard(10, 10, [{x: 0, y: 0}]);
  const board = await Board.create({cells: boardCreation});
  const game = await MineSweeper.create({
    board: board,
    finished: false,
  });
  const revealedCells = game.revealCell({x: 4, y: 7});

  expect(revealedCells.length).toBe(99);
  expect(game.board.cells.flat().filter((cell) =>
    cell.status === cellStatuses.REVEALED).length).toBe(99);
  expect(game.finished).toBeFalsy();
});

test('.revealCell(): it should reveal all bombs', async () => {
  const boardCreation = await Board.createBoard(
      10,
      10,
      [{x: 0, y: 0}, {x: 6, y: 4}]
  );
  const board = await Board.create({cells: boardCreation});
  const game = await MineSweeper.create({
    board: board,
    finished: false,
  });
  const revealedCells = game.revealCell({x: 6, y: 4});

  expect(revealedCells.length).toBe(2);
  expect(game.board.cells.flat().filter((cell) =>
    cell.status === cellStatuses.REVEALED).length).toBe(2);
  expect(game.finished).toBeTruthy();
});

test('.markAsBomb(): it should throw if missing parameters on request',
    async () => {
      const game = await MineSweeper.create({
        size: {columns: 10, rows: 10},
        bombs: 10,
      });

      expect(() => {
        game.markCellAsBomb({x: 1});
      }).toThrow();
      expect(() => {
        game.markCellAsBomb({y: 1});
      }).toThrow();
    });

test('.markAsBomb(): it should throw if trying to mark a cell outside board',
    async () => {
      const game = await MineSweeper.create(
          {size: {columns: 10, rows: 10},
            bombs: 10,
          });

      expect(() => {
        game.markCellAsBomb({x: 11, y: 4});
      }).toThrow();
      expect(() => {
        game.markCellAsBomb({x: 4, y: 14});
      }).toThrow();
      expect(() => {
        game.markCellAsBomb({x: -4, y: 1});
      }).toThrow();
      expect(() => {
        game.markCellAsBomb({x: 4, y: -1});
      }).toThrow();
    });

test('.markAsBomb(): it should ignore when game already ended', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  game.endGame();
  const revealedCells = game.markCellAsBomb({x: 4, y: 7});

  expect(revealedCells).toBe(undefined);
  game.board.cells.flat().forEach((cell) => {
    expect(cell.status).toBe(cellStatuses.HIDDEN);
  });
});

test('.markAsBomb(): it should mark a cell as bomb', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  const markedCell = game.markCellAsBomb({x: 4, y: 7});

  expect(markedCell.x).toBe(4);
  expect(markedCell.y).toBe(7);
  expect(game.board.cells[4][7].status).toBe(cellStatuses.BOMB_MARK);
  expect(game.finished).toBeFalsy();
});

test('.markAsBomb(): it should mark a cell as bomb', async () => {
  const boardCreation = await Board.createBoard(10, 10, [{x: 0, y: 0}]);
  const board = await Board.create({cells: boardCreation});
  const game = await MineSweeper.create({
    board: board,
    finished: false,
  });
  game.revealCell({x: 4, y: 7});
  const markedCell = game.markCellAsBomb({x: 0, y: 0});

  expect(markedCell.x).toBe(0);
  expect(markedCell.y).toBe(0);
  expect(game.board.cells[0][0].status).toBe(cellStatuses.BOMB_MARK);
  expect(game.finished).toBeTruthy();
});


test('.markAsQuestion(): it should throw if missing parameters', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });

  expect(() => {
    game.markCellAsQuestion({x: 1});
  }).toThrow();
  expect(() => {
    game.markCellAsQuestion({y: 1});
  }).toThrow();
});

test('.markAsQuestion(): it should throw if out of bounds', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });

  expect(() => {
    game.markCellAsQuestion({x: 11, y: 4});
  }).toThrow();
  expect(() => {
    game.markCellAsQuestion({x: 4, y: 14});
  }).toThrow();
  expect(() => {
    game.markCellAsQuestion({x: -4, y: 1});
  }).toThrow();
  expect(() => {
    game.markCellAsQuestion({x: 4, y: -1});
  }).toThrow();
});

test('.markAsQuestion(): it should ignore when game already ended',
    async () => {
      const game = await MineSweeper.create({
        size: {columns: 10, rows: 10},
        bombs: 10,
      });
      game.endGame();
      const revealedCells = game.markCellAsQuestion({x: 4, y: 7});

      expect(revealedCells).toBe(undefined);
      game.board.cells.flat().forEach((cell) => {
        expect(cell.status).toBe(cellStatuses.HIDDEN);
      });
    });

test('.markAsQuestion(): it should mark a cell as question', async () => {
  const game = await MineSweeper.create({
    size: {columns: 10, rows: 10},
    bombs: 10,
  });
  const markedCell = game.markCellAsQuestion({x: 4, y: 7});

  expect(markedCell.x).toBe(4);
  expect(markedCell.y).toBe(7);
  expect(game.board.cells[4][7].status).toBe(cellStatuses.QUESTION);
});

test('.calculateBombsPositions(), it should calculate bombsPositions', () => {
  const boardSize = {columns: 7, rows: 9};
  const bombs = 11;
  const bombsPositions = MineSweeper.calculateBombsPositions(boardSize, bombs);

  expect(bombsPositions.length).toBe(bombs);
  bombsPositions.forEach((bomb) => {
    expect(bomb.x).toBeLessThan(boardSize.columns);
    expect(bomb.y).toBeLessThan(boardSize.rows);
  });
});

