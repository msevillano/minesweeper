'use strict';

const Board = require('./board');

/**
 * Represents the mineSweeper game.
 */
class Minesweeper {
  /**
   * @constructor
   * @param {Object.<Board>} board - representation of the game board.
   */
  constructor(board) {
    this.board = board;
    this.startedAt = new Date();
    this.finished = false;
  }

  /**
   * this method starts a new game.
   *
   *  @throws {error} if game can't be started.
   *
   * @param {Object.<{columns: int, rows: int}>} size - dimensions of the board.
   * @param {int} bombs - how many bombs the board will have.
   *
   * @return {Object.<{Minesweeper}>} - an instance of the game.
   */
  static startGame(size, bombs) {
    if (size.columns < 1 || size.rows < 1 || bombs < 1) {
      throw new Error(`Invalid argument error:
       the board sizes and bomb count should be positive integers`);
    }
    if (!size || !size.columns || !size.rows || !bombs) {
      throw new Error(`Missing argument error:
       there are not enough parameters to start a new game`);
    }
    if (size.columns * size.rows < bombs) {
      throw new Error(`Invalid argument error:
       the board has not enough cells to accommodate this amount of bombs`);
    }

    const bombsAt = Minesweeper.calculateBombsPositions(size, bombs);
    const board = new Board(size.columns, size.rows, bombsAt);
    return new Minesweeper(board);
  }

  /**
   * this method ends a game.
   */
  endGame() {
    if (!this.finished) {
      this.finished = true;
      this.finishedAt = new Date();
    }
  }

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
  revealCell(position) {
    if (!this.finished) {
      const boardSize = this.board.getDimensions();
      if (!('x' in position && 'y' in position)) {
        throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
      }
      if (position.x < 0 ||
          position.x > boardSize.columns ||
          position.y < 0 || position.y > boardSize.rows) {
        throw new Error(`Invalid argument error:
         can't reveal cells outside the board`);
      }
      const revealedCells = this.board.revealCell(position);
      if (revealedCells.some((cell) => cell.bomb)) this.endGame();
      if (this.board.isSolved()) this.endGame();
      return revealedCells;
    }
  }

  /**
   * this method marks a cell as bomb on the board,
   * finishing the game if necessary.
   *
   *  @throws {error} if cant use given position.
   *
   * @param {Object.<{x: int, y: int}>} position - positions of cell.
   *
   * @return {Object.<Cell>} - revealed cell.
   */
  markCellAsBomb(position) {
    if (!this.finished) {
      const boardSize = this.board.getDimensions();
      if (!('x' in position && 'y' in position)) {
        throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
      }
      if (position.x < 0 ||
          position.x > boardSize.columns ||
          position.y < 0 ||
          position.y > boardSize.rows) {
        throw new Error(`Invalid argument error:
         can't mark cells outside the board`);
      }
      const markedCells = this.board.markCellAsBomb(position);
      if (this.board.isSolved()) this.endGame();
      return markedCells;
    }
  }

  /**
   * this method marks a cell as question on the board
   *
   *  @throws {error} if cant use given position
   *
   * @param {Object.<{x: int, y: int}>} position - positions of cell.
   *
   * @return {Object.<Cell>} - revealed cell.
   */
  markCellAsQuestion(position) {
    if (!this.finished) {
      const boardSize = this.board.getDimensions();
      if (!('x' in position && 'y' in position)) {
        throw new Error(`Missing argument error:
         there are not enough parameters perform this action`);
      }
      if (position.x < 0 ||
          position.x > boardSize.columns ||
          position.y < 0 ||
          position.y > boardSize.rows) {
        throw new Error(`Invalid argument error:
         can't mark cells outside the board`);
      }
      return this.board.markCellAsQuestion(position);
    }
  }

  /**
   * this method selects randoms positions on a grid.
   * @param {Object.<{columns: int, rows: int}>} gridSize - size of the grid.
   * @param {int} bombCount - how many bombs are going into the grid.
   *
   * @return {Array.<{x: int, y: int}>} - positions of bombs.
   */
  static calculateBombsPositions(gridSize, bombCount) {
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
  }
}

module.exports = Minesweeper;
