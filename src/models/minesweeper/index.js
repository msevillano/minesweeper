/* eslint no-invalid-this: 'off'*/
'use strict';

const mongoose = require('mongoose');
const Board = require('./board');

/**
 * Represents the mineSweeper game.
 */
const mineSweeperSchema = new mongoose.Schema(
    {
      size: {
        columns: Number,
        rows: Number,
      },
      bombs: Number,
      board: Board.schema,
      finished: Boolean,
      startedAt: Date,
      finishedAt: Date,
    },
    {
      collection: 'minesweeper',
      timestamps: false,
      retainKeyOrder: true,
    }
);

/**
 * this hook check if is a new game
 * or if is one already started, creating the board if its a new game.
 *
 *  @throws {error} if game can't be started.
 *
 * @param {Object.<{columns: int, rows: int}>} size - dimensions of the board.
 * @param {int} bombs - how many bombs the board will have.
 *
 * @return {Object.<{Minesweeper}>} - an instance of the game.
 */
mineSweeperSchema.pre('validate', async function(next) {
  if (!this.board) {
    if (this.size.columns < 1 || this.size.rows < 1 || this.bombs < 1) {
      throw new Error(`Invalid argument error:
         the board sizes and bomb count should be positive integers`);
    }
    if (!this.size || !this.size.columns || !this.size.rows || !this.bombs) {
      throw new Error(`Missing argument error:
         there are not enough parameters to start a new game`);
    }
    if (this.size.columns * this.size.rows < this.bombs) {
      throw new Error(`Invalid argument error:
         the board has not enough cells to accommodate this amount of bombs`);
    }

    const bombsAt = mineSweeperSchema.statics
        .calculateBombsPositions(this.size, this.bombs);
    const boardCreation = await Board
        .createBoard(this.size.columns, this.size.rows, bombsAt);

    this.board = await Board.create({cells: boardCreation});
    this.startedAt = new Date();
    this.finished = false;
  }
  next();
});

/**
 * this method ends a game.
 */
mineSweeperSchema.methods.endGame = function() {
  if (!this.finished) {
    this.finished = true;
    this.finishedAt = new Date();
  }
};

/**
 * this method reveals a cell on the board,
 * finishing the game if necessary.
 *
 *  @throws {error} if cant use given position.
 *
 * @param {Object.<{x: int, y: int}>} position - positions of cell.
 *
 * @return {Array.<Cell>} - revealed cells.
 */
mineSweeperSchema.methods.revealCell = function(position) {
  if (!this.finished) {
    if (!('x' in position && 'y' in position)) {
      throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
    }
    if (position.x < 0 ||
      position.x > this.size.columns ||
      position.y < 0 || position.y > this.size.rows) {
      throw new Error(`Invalid argument error:
         can't reveal cells outside the board`);
    }
    const revealedCells = this.board.revealCell(position);
    if (revealedCells.some((cell) => cell.bomb)) this.endGame();
    if (this.board.isSolved()) this.endGame();
    return revealedCells;
  }
};

/**
 * this method marks a cell as bomb on the board,
 * finishing the game if necessary.
 *
 *  @throws {error} if cant use given position.
 *
 * @param {Object.<{x: int, y: int}>} position - positions of cell.
 *
 * @return {Object.<Cell>} - marked cell.
 */
mineSweeperSchema.methods.markCellAsBomb = function(position) {
  if (!this.finished) {
    if (!('x' in position && 'y' in position)) {
      throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
    }
    if (position.x < 0 ||
      position.x > this.size.columns ||
      position.y < 0 ||
      position.y > this.size.rows) {
      throw new Error(`Invalid argument error:
         can't mark cells outside the board`);
    }
    const markedCells = this.board.markCellAsBomb(position);
    if (this.board.isSolved()) this.endGame();
    return markedCells;
  }
};

/**
 * this method marks a cell as question on the board
 *
 *  @throws {error} if cant use given position
 *
 * @param {Object.<{x: int, y: int}>} position - positions of cell.
 *
 * @return {Object.<Cell>} - revealed cell.
 */
mineSweeperSchema.methods.markCellAsQuestion = function(position) {
  if (!this.finished) {
    if (!('x' in position && 'y' in position)) {
      throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
    }
    if (position.x < 0 ||
      position.x > this.size.columns ||
      position.y < 0 ||
      position.y > this.size.rows) {
      throw new Error(`Invalid argument error:
         can't mark cells outside the board`);
    }
    return this.board.markCellAsQuestion(position);
  }
};

/**
 * this method selects randoms positions on a grid.
 * @param {Object.<{columns: int, rows: int}>} gridSize - size of the grid.
 * @param {int} bombCount - how many bombs are going into the grid.
 *
 * @return {Array.<{x: int, y: int}>} - positions of bombs.
 */
// eslint-disable-next-line max-len
mineSweeperSchema.statics.calculateBombsPositions = function(gridSize, bombCount) {
  const amountOfCells = gridSize.columns * gridSize.rows;
  const bombArray = [];
  let bombsPositions = new Array(amountOfCells).fill({});
  bombsPositions = bombsPositions.map((elem, index) => {
    return {
      x: index % gridSize.columns,
      y: Math.floor(index/gridSize.columns),
    };
  });
  for (let i = 0; i < bombCount; i++) {
    const bombPosition = Math.floor(Math.random() * (amountOfCells - i));
    const selectedPosition = bombsPositions.splice(bombPosition, 1)[0];
    bombArray.push(selectedPosition);
  }
  return bombArray;
};

module.exports = mongoose.model('mineSweeper', mineSweeperSchema);
