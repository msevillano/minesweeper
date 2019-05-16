'use strict';

const Board = require('../../src/minesweeper/board');
const cellStatuses = require('../../src/minesweeper/cell').cellStatuses;

test('.constructor(): should create a board', () => {
  const board = new Board(6, 9, []);

  board.cells.forEach((column) => {
    expect(column.length).toBe(9);
  });
  expect(board.cells.length).toBe(6);
});

test('.calculateBombCount(): it should calculate BombCount', () => {
  const bombs = [];
  const board = new Board(6, 6, bombs);

  board.cells.forEach((column) => {
    column.forEach((cell) => {
      expect(cell.bombCount).toBe(0);
    });
  });
});

test('.calculateBombCount(): it should calculate BombCount', () => {
  const bombs = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}];
  const board = new Board(2, 2, bombs);

  board.cells.flat().forEach((cell) => {
    expect(cell.bombCount).toBe(-1);
  });
});

test('.calculateBombCount(): it should calculate BombCount', () => {
  const bombs = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 4, y: 4}];
  const board = new Board(6, 6, bombs);

  expect(board.cells[0][0].bombCount).toBe(-1);
  expect(board.cells[5][0].bombCount).toBe(0);
  expect(board.cells[0][1].bombCount).toBe(2);
});

test('.revealCell(): it should reveal only himself', () => {
  const board = new Board(6, 6, [{x: 1, y: 1}]);
  const cell = board.revealCell({x: 1, y: 2});

  expect(board.cells[1][2].status).toBe(cellStatuses.REVEALED);
  expect(cell[0].x).toBe(1);
  expect(cell[0].y).toBe(2);
});

test('.revealCell(): it should reveal many cells', () => {
  const board = new Board(3, 3, [{x: 0, y: 0}]);
  const cells = board.revealCell({x: 2, y: 2});

  expect(board.cells[2][2].status).toBe(cellStatuses.REVEALED);
  expect(cells.length).toBe(8);
  cells.forEach((cell) => {
    expect(cell.status).toBe(cellStatuses.REVEALED);
  });
});

test('.revealCell(): it should reveal all bombs', () => {
  const board = new Board(3, 3, [{x: 0, y: 0}, {x: 2, y: 2}]);
  const cells = board.revealCell({x: 2, y: 2});

  expect(board.cells[2][2].status).toBe(cellStatuses.REVEALED);
  expect(cells.length).toBe(2);
  cells.forEach((cell) => {
    expect(cell.status).toBe(cellStatuses.REVEALED);
  });
});

test('.markCellAsBomb(): should set status of a given cell to bomb', () => {
  const board = new Board(6, 6, []);
  const cell = board.markCellAsBomb({x: 1, y: 2});

  expect(board.cells[1][2].status).toBe(cellStatuses.BOMB_MARK);
  expect(cell.x).toBe(1);
  expect(cell.y).toBe(2);
});

test('.markCellAsQuestion(): it should set status of cell to question', () => {
  const board = new Board(6, 6, []);
  const cell = board.markCellAsQuestion({x: 1, y: 2});

  expect(board.cells[1][2].status).toBe(cellStatuses.QUESTION);
  expect(cell.x).toBe(1);
  expect(cell.y).toBe(2);
});

test('.getDimensions(): it should return dimensions of the board', () => {
  const board = new Board(3, 4, [{x: 0, y: 0}, {x: 2, y: 2}]);
  const dimensions = board.getDimensions();

  expect(dimensions.columns).toBe(3);
  expect(dimensions.rows).toBe(4);
});

test('.isSolved(): it should return status of the board (solved)', () => {
  const board = new Board(3, 4, [{x: 0, y: 0}]);
  board.markCellAsBomb({x: 0, y: 0});
  board.revealCell({x: 2, y: 3});

  expect(board.isSolved()).toBeTruthy();
});

test('.isSolved(): it should return te status of the board (unsolved)', () => {
  const board1 = new Board(3, 4, [{x: 0, y: 0}]);
  board1.revealCell({x: 2, y: 3});

  expect(board1.isSolved()).toBeFalsy();

  const board2 = new Board(3, 4, [{x: 0, y: 0}]);
  board2.markCellAsBomb({x: 0, y: 0});

  expect(board2.isSolved()).toBeFalsy();

  const board3 = new Board(3, 4, [{x: 0, y: 0}]);

  expect(board3.isSolved()).toBeFalsy();
});
