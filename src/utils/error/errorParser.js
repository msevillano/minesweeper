'use strict';

module.exports = (err) => {
  const isKnownError = err.message
      .match(/(Invalid argument|Missing argument|Game not found)/);
  const isNotFound = err.message
      .match(/(Game not found)/);
  return {
    statusCode: isKnownError ? isNotFound ? 404: 400: 500,
    body: isKnownError ?
      JSON.stringify({error: err.message}) :
      JSON.stringify({error: 'Internal server error'}),
  };
};
