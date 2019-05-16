'use strict';

const status = require('../../src/public/system');

test('server status is online', async () => {
  const result = await status.getStatus();
  expect(result.statusCode).toBe(200);
  expect(result.body).toBe('{"status":"online"}');
});
