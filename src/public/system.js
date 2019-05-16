'use strict';

module.exports.getStatus = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'online',
    }),
  };
};
