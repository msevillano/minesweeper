'use strict';

const MineSweeper = require('../../models/minesweeper');
const dbConnector = require('../../utils/db/connectToDb');
const errorParser = require('../../utils/error/errorParser');

module.exports.start = async (event) => {
  try {
    await dbConnector(process.env.MONGODB);
    const body = JSON.parse(event.body);

    const game = await MineSweeper.create({
      size: {columns: body.x, rows: body.y},
      bombs: body.bombCount,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: game._id,
        size: game.size,
        bombs: game.bombs,
        startedAt: game.startedAt,
      }),
    };
  } catch (err) {
    return errorParser(err);
  }
};
