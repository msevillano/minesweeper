'use strict';

const Board = require('../../src/minesweeper/board');
const cellStatuses = require('../../src/minesweeper/cell').cellStatuses;

const connect = require('../../src/db/connectToDb');

beforeAll(() => connect('mongodb://localhost:27017/development'));

test('.constructor(): should create a board',
    async () => {
      const board = await Board.createBoard(6, 9, []);

      board.forEach((column) => {
        expect(column.length).toBe(9);
      });
      expect(board.length).toBe(6);
      board.forEach((column) => {
        column.forEach((cell) => {
          expect(cell.bombCount).toBe(0);
        });
      });
    });


test('.calculateBombCount(): it should calculate BombCount',
    async () => {
      const bombs = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}];
      const board = await Board.createBoard(2, 2, bombs);

      board.flat().forEach((cell) => {
        expect(cell.bombCount).toBe(-1);
      });
    });

test('.calculateBombCount(): it should calculate BombCount',
    async () => {
      const bombs = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 4, y: 4}];
      const board = await Board.createBoard(6, 6, bombs);

      expect(board[0][0].bombCount).toBe(-1);
      expect(board[5][0].bombCount).toBe(0);
      expect(board[0][1].bombCount).toBe(2);
    });

test('.revealCell(): it should reveal only himself',
    async () => {
      const boardCreation = await Board.createBoard(6, 6, [{x: 1, y: 1}]);
      const board = await Board.create({cells: boardCreation});
      const cell = board.revealCell({x: 1, y: 2});

      expect(board.cells[1][2].status).toBe(cellStatuses.REVEALED);
      expect(cell[0].x).toBe(1);
      expect(cell[0].y).toBe(2);
    });

test('.revealCell(): it should reveal many cells',
    async () => {
      const boardCreation = await Board.createBoard(3, 3, [{x: 0, y: 0}]);
      const board = await Board.create({cells: boardCreation});
      const cells = board.revealCell({x: 2, y: 2});

      expect(board.cells[2][2].status).toBe(cellStatuses.REVEALED);
      expect(cells.length).toBe(8);
      cells.forEach((cell) => {
        expect(cell.status).toBe(cellStatuses.REVEALED);
      });
    });

test('.revealCell(): it should reveal all bombs',
    async () => {
      const boardCreation = await Board.createBoard(
          3,
          3,
          [{x: 0, y: 0}, {x: 2, y: 2}]);
      const board = await Board.create({cells: boardCreation});
      const cells = board.revealCell({x: 2, y: 2});

      expect(board.cells[2][2].status).toBe(cellStatuses.REVEALED);
      expect(cells.length).toBe(2);
      cells.forEach((cell) => {
        expect(cell.status).toBe(cellStatuses.REVEALED);
      });
    });

test('.markCellAsBomb(): should set status of a given cell to bomb',
    async () => {
      const boardCreation = await Board.createBoard(6, 6, []);
      const board = await Board.create({cells: boardCreation});
      const cell = board.markCellAsBomb({x: 1, y: 2});

      expect(board.cells[1][2].status).toBe(cellStatuses.BOMB_MARK);
      expect(cell.x).toBe(1);
      expect(cell.y).toBe(2);
    });

test('.markCellAsQuestion(): it should set status of cell to question',
    async () => {
      const boardCreation = await Board.createBoard(6, 6, []);
      const board = await Board.create({cells: boardCreation});
      const cell = board.markCellAsQuestion({x: 1, y: 2});

      expect(board.cells[1][2].status).toBe(cellStatuses.QUESTION);
      expect(cell.x).toBe(1);
      expect(cell.y).toBe(2);
    });

test('.isSolved(): it should return status of the board (solved)',
    async () => {
      const boardCreation = await Board.createBoard(3, 4, [{x: 0, y: 0}]);
      const board = await Board.create({cells: boardCreation});
      board.markCellAsBomb({x: 0, y: 0});
      board.revealCell({x: 2, y: 3});

      expect(board.isSolved()).toBeTruthy();
    });

test('.isSolved(): it should return te status of the board (unsolved)',
    async () => {
      const boardCreation = await Board.createBoard(3, 4, [{x: 0, y: 0}]);
      const board1 = await Board.create({cells: boardCreation});
      board1.revealCell({x: 2, y: 3});

      expect(board1.isSolved()).toBeFalsy();

      const board2 = await Board.create({cells: boardCreation});
      board2.markCellAsBomb({x: 0, y: 0});

      expect(board2.isSolved()).toBeFalsy();

      const board3 = await Board.create({cells: boardCreation});

      expect(board3.isSolved()).toBeFalsy();
    });
