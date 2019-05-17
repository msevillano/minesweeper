'use strict';

const MineSweeper = require('../../models/minesweeper');
const dbConnector = require('../../utils/db/connectToDb');
const errorParser = require('../../utils/error/errorParser');

const dbConn = dbConnector('mongodb://localhost:27017/development');

module.exports.find = async (event) => {
  try {
    await dbConn;
    const game = await MineSweeper.findById(event.pathParameters.id);
    if (!game) throw new Error('Game not found');

    const boardStatus = game.board.cells.flat()
        .filter((cell) => cell.status !== 1);
    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: game._id,
        size: game.size,
        cells: boardStatus,
        bombs: game.bombs,
        startedAt: game.startedAt,
      }),
    };
  } catch (err) {
    return errorParser(err);
  }
};
