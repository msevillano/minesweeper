'use strict';

const MineSweeper = require('../../models/minesweeper');
const dbConnector = require('../../utils/db/connectToDb');
const errorParser = require('../../utils/error/errorParser');

module.exports.find = async (event) => {
  try {
    await dbConnector(process.env.MONGODB);
    const game = await MineSweeper.findById(event.pathParameters.id);
    if (!game) throw new Error('Game not found');

    const boardStatus = game.board.cells.flat()
        .filter((cell) => cell.status !== 1);
    boardStatus.forEach((cell) => {
      delete cell.bomb;
      if (cell.status !== 4) delete cell.bombCount;
    });
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
