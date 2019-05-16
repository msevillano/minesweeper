'use strict';

const cellStatuses = {
  'HIDDEN': 1,
  'QUESTION': 2,
  'BOMB_MARK': 3,
  'REVEALED': 4,
};

/**
 * Represents a mineSweeper board (care it might have a bomb in it).
 */
class Cell {
  /**
   * @constructor
   * @param {boolean} bomb - if it has a bomb.
   * @param {Object.<{x: int, y: int}>} position - positions of cell
   */
  constructor(bomb, position) {
    this.x = position.x;
    this.y = position.y;
    this.bomb = bomb;
    this.bombCount = 0;
    this.status = cellStatuses.HIDDEN;
  }

  /**
   * this method change the status of a cell
   *
   *  @throws {error} if don't recognizes the status given.
   *
   * @param {string} status - form cellStatuses enum.
   * @return {Object.<{isBomb: boolean, bombsInNeighborhood: boolean}>}
   */
  changeStatus(status) {
    if (!(status in cellStatuses)) {
      throw new Error(`Invalid argument error: cell status not supported`);
    }
    if (this.status !== cellStatuses.REVEALED) {
      this.status = cellStatuses[status];
    }
    return {isBomb: this.bomb, bombsInNeighborhood: this.bombCount > 0};
  }
}

module.exports = Cell;
module.exports.cellStatuses = cellStatuses;
