'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let dbConn = null;

/**
 * this function creates a connection to MongoDB, or reuses an existing one.
 *
 *  @throws {error} if there is any problem with the connection.
 *
 * @param {string} dbURI - form cellStatuses enum.
 */
module.exports = async (dbURI) => {
  if (dbConn) {
    console.log('=> using existing database connection');
    return dbConn;
  }

  console.log('=> using new database connection');
  try {
    dbConn = await mongoose.connect(dbURI);
    return dbConn;
  } catch (e) {
    console.log(e);
    throw new Error(`Service unavailable error:
       can't make a connection to DB`);
  }
};
