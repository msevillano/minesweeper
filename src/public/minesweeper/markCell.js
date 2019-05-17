'use strict';

const MineSweeper = require('../../models/minesweeper');
const dbConnector = require('../../utils/db/connectToDb');
const errorParser = require('../../utils/error/errorParser');

const dbConn = dbConnector('mongodb://localhost:27017/development');

module.exports.reveal = async (event) => {
  try {
    await dbConn;
    const body = JSON.parse(event.body);
    console.log(body);
    const game = await MineSweeper.findById(event.pathParameters.id);
    if (!game) throw new Error('Game not found');
    const updatedCells = game.revealCell(body.position);
    await MineSweeper.findByIdAndUpdate(event.pathParameters.id,
        {
          $set: {
            board: game.board,
            finished: game.finished,
            finishedAt: game.finishedAt,
          },
        });
    const boardStatus = updatedCells.map((cell) => {
      return {
        x: cell.x,
        y: cell.y,
        status: cell.status,
      };
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
    console.log(err);
    return errorParser(err);
  }
};

module.exports.asBomb = async (event) => {
  try {
    await dbConn;
    const body = JSON.parse(event.body);

    const game = await MineSweeper.findById(event.pathParameters.id);
    if (!game) throw new Error('Game not found');
    const updatedCell = game.markCellAsBomb(body.position);
    // switch (event.pathParameters.method) {
    //   case 'reveal':
    //     game.revealCell(body.position);
    //     break;
    //   case 'bomb':
    //     const asd = game.markCellAsBomb(body.position);
    //     break;
    //   case 'question':
    //     game.markCellAsQuestion(body.position);
    //     break;
    // }
    await MineSweeper.findByIdAndUpdate(event.pathParameters.id,
        {
          $set: {
            board: game.board,
            finished: game.finished,
            finishedAt: game.finishedAt,
          },
        });
    const boardStatus = {
      x: updatedCell.x,
      y: updatedCell.y,
      status: updatedCell.status,
    };
    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: game._id,
        size: game.size,
        cells: [boardStatus],
        bombs: game.bombs,
        startedAt: game.startedAt,
      }),
    };
  } catch (err) {
    return errorParser(err);
  }
};

module.exports.asQuestion = async (event) => {
  try {
    await dbConn;
    const body = JSON.parse(event.body);

    const game = await MineSweeper.findById(event.pathParameters.id);
    if (!game) throw new Error('Game not found');
    const updatedCell = game.markCellAsQuestion(body.position);
    await MineSweeper.findByIdAndUpdate(event.pathParameters.id,
        {
          $set: {
            board: game.board,
            finished: game.finished,
            finishedAt: game.finishedAt,
          },
        });
    const boardStatus = {
      x: updatedCell.x,
      y: updatedCell.y,
      status: updatedCell.status,
    };
    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: game._id,
        size: game.size,
        cells: [boardStatus],
        bombs: game.bombs,
        startedAt: game.startedAt,
      }),
    };
  } catch (err) {
    return errorParser(err);
  }
};
