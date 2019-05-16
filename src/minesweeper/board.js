'use strict';

const Cell = require('./cell');

/**
 * Represents a mineSweeper board.
 */
class Board {
  /**
   * @constructor
   * @param {int} columnCount - number of columns.
   * @param {int} rowCount - number of rows.
   * @param {Array.<{x: int, y: int}>} bombsAt - positions of the bombs inside
   * the board.
   */
  constructor(columnCount, rowCount, bombsAt) {
    this.cells = new Array(columnCount).fill({});
    this.cells = this.cells.map((columnElem, columnIndex) => {
      let rows = new Array(rowCount).fill({});
      rows = rows.map((rowElem, rowIndex) => {
        return new Cell(bombsAt.filter((position) =>
          (position.x === columnIndex && position.y === rowIndex)).length > 0,
        {x: columnIndex, y: rowIndex});
      });
      return rows;
    });
    this.calculateBombCount();
  }

  /**
   * This method calculates for every cell on the board its respective
   * bombCount(bombs on neighbor cells).
   */
  calculateBombCount() {
    const boardCells = this.cells.flat();
    boardCells.forEach((cell) => {
      if (cell.bomb) cell.bombCount = -1;
      else {
        cell.bombCount = boardCells.filter((comparingCell) =>
          isNeighbor(cell, comparingCell)).reduce((bombCount, element) => {
          if (element.bomb) return bombCount + 1;
          else return bombCount;
        }, 0);
      }
    });
  }

  /**
   * This reveals the cell(or cells if the given one has a bombCount of 0) on
   * the given position.
   * @param {Object.<{x: int, y: int}>} position - number of rows.
   *
   * @return {Array.<Cell>} - revealed cells.
   */
  revealCell(position) {
    const responseArray = [];
    const cell = this.cells[position.x][position.y];
    if (cell.status !== Cell.cellStatuses.REVEALED) {
      const revealResponse = cell.changeStatus('REVEALED');
      responseArray.push(cell);
      if (!revealResponse.bombsInNeighborhood && !revealResponse.isBomb) {
        const neighborCells = this.cells.flat().filter((comparingCell) =>
          isNeighbor(cell, comparingCell) &&
          comparingCell.status !== Cell.cellStatuses.REVEALED);
        neighborCells.map((cell) =>
          this.revealCell({x: cell.x, y: cell.y})).flat()
            .forEach((element) => responseArray.push(element));
      }
      if (revealResponse.isBomb) {
        const bombs = this.cells.flat().filter((cell) => cell.bomb);
        bombs.forEach((bombCell) => bombCell.changeStatus('REVEALED'));
        return bombs;
      }
      return responseArray;
    } return [];
  }

  /**
   * This marks the cell as bomb on the given position.
   * @param {Object.<{x: int, y: int}>} position - number of rows.
   *
   * @return {Object.<Cell>} - marked cell.
   */
  markCellAsBomb(position) {
    const cell = this.cells[position.x][position.y];
    cell.changeStatus('BOMB_MARK');
    return cell;
  }

  /**
   * This marks the cell as bomb on the given position.
   * @param {Object.<{x: int, y: int}>} position - number of rows.
   *
   * @return {Object.<Cell>} - marked cell.
   */
  markCellAsQuestion(position) {
    const cell = this.cells[position.x][position.y];
    cell.changeStatus('QUESTION');
    return cell;
  }

  /**
   * This returns the dimensions of the board.
   *
   * @return {Object.<{columns: int, rows: int}>} - dimensions of board.
   */
  getDimensions() {
    return {
      columns: this.cells.length,
      rows: this.cells[0].length,
    };
  }

  /**
   * This returns if the board is solved or not
   *
   * @return {boolean} - status of board.
   */
  isSolved() {
    return this.cells.flat()
        .filter((cell) => !cell.bomb)
        .every((cell) => cell.status === Cell.cellStatuses.REVEALED) &&
           this.cells.flat()
               .filter((cell) => cell.bomb)
               .every((cell) => cell.status === Cell.cellStatuses.BOMB_MARK);
  }
}

/**
 * Checks if 2 given cells are neighbors
 * @param {Object.<Cell>} cell - cell 1 to compare.
 * @param {Object.<Cell>} comparingCell cell 2 to compare.
 * @return {boolean} - status of board.
 */
function isNeighbor(cell, comparingCell) {
  return (comparingCell.x >= cell.x - 1 && comparingCell.x <= cell.x + 1) &&
         (comparingCell.y >= cell.y - 1 && comparingCell.y <= cell.y + 1) &&
         (comparingCell.x !== cell.x || comparingCell.y !== cell.y );
}

module.exports = Board;
