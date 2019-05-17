'use strict';

const mongoose = require('mongoose');
const Cell = require('./cell');

const boardSchema = new mongoose.Schema({
  cells: [
    [Cell.schema],
  ],
});

/**
 * emulates constructor
 * @param {int} columns - number of columns.
 * @param {int} rows - number of rows.
 * @param {Array.<{x: int, y: int}>} bombsAt - positions of the bombs inside
 * the board.
 *
 * @return {Object.<[[Cell]]>} - preRepresentation of Board.
 */
boardSchema.statics.createBoard = async function(columns, rows, bombsAt) {
  let cells = new Array(columns).fill({});
  cells = cells.map((columnElem, columnIndex) => {
    let cellRows = new Array(rows).fill({});
    cellRows = cellRows.map(async (rowElem, rowIndex) => {
      return Cell.create({
        x: columnIndex,
        y: rowIndex,
        bomb: bombsAt.filter((position) =>
          (position.x === columnIndex && position.y === rowIndex))
            .length > 0});
    });
    return cellRows;
  });
  // eslint-disable-next-line guard-for-in
  for (const index in cells) {
    cells[index] = await Promise.all(cells[index]);
  }
  calculateBombCount(cells);
  return cells;
};

/**
 * This reveals the cell(or cells if the given one has a bombCount of 0) on
 * the given position.
 * @param {Object.<{x: int, y: int}>} position - number of rows.
 *
 * @return {Array.<Cell>} - revealed cells.
 */
boardSchema.methods.revealCell = function(position) {
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
};

/**
 * This marks the cell as bomb on the given position.
 * @param {Object.<{x: int, y: int}>} position - number of rows.
 *
 * @return {Object.<Cell>} - marked cell.
 */
boardSchema.methods.markCellAsBomb = function(position) {
  const cell = this.cells[position.x][position.y];
  cell.changeStatus('BOMB_MARK');
  return cell;
};

/**
 * This marks the cell as question on the given position.
 * @param {Object.<{x: int, y: int}>} position - number of rows.
 *
 * @return {Object.<Cell>} - marked cell.
 */
boardSchema.methods.markCellAsQuestion = function(position) {
  const cell = this.cells[position.x][position.y];
  cell.changeStatus('QUESTION');
  return cell;
};

/**
 * This returns if the board is solved or not
 *
 * @return {boolean} - status of board.
 */
boardSchema.methods.isSolved = function() {
  return this.cells.flat()
      .filter((cell) => !cell.bomb)
      .every((cell) => cell.status === Cell.cellStatuses.REVEALED) &&
    this.cells.flat()
        .filter((cell) => cell.bomb)
        .every((cell) => cell.status === Cell.cellStatuses.BOMB_MARK);
};

/**
 * calculates for every cell on the board its respective
 * bombCount(bombs on neighbor cells).
 * @param {Array.<Cell>} board - representation of board.
 *
 */
function calculateBombCount(board) {
  const boardCells = board.flat();
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

module.exports = mongoose.model('Board', boardSchema);
module.exports.schema = boardSchema;
