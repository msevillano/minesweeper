'use strict';

const mongoose = require('mongoose');

const cellStatuses = {
  'HIDDEN': 1,
  'QUESTION': 2,
  'BOMB_MARK': 3,
  'REVEALED': 4,
};

const cellSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  bomb: Boolean,
  bombCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: 1,
  },
});

/**
 * this method change the status of a cell
 *
 *  @throws {error} if don't recognizes the status given.
 *
 * @param {string} status - form cellStatuses enum.
 * @return {Object.<{isBomb: boolean, bombsInNeighborhood: boolean}>}
 */
cellSchema.methods.changeStatus = function(status) {
  if (!(status in cellStatuses)) {
    throw new Error(`Invalid argument error: cell status not supported`);
  }
  if (this.status !== cellStatuses.REVEALED) {
    this.status = cellStatuses[status];
  }
  return {isBomb: this.bomb, bombsInNeighborhood: this.bombCount > 0};
};

module.exports = mongoose.model('Cell', cellSchema);
module.exports.schema = cellSchema;
module.exports.cellStatuses = cellStatuses;
