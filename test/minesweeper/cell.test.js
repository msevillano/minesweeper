'use strict';
const Cell = require('../../src/minesweeper/cell');
const cellStatuses = Cell.cellStatuses;

const connect = require('../../src/db/connectToDb');

beforeAll(() => connect('mongodb://localhost:27017/development'));

test('.changeStatus(): it should throw when an wrong state given',
    async () => {
      const cell = await Cell.create({x: 0, y: 0, bomb: true});

      expect(() => {
        cell.changeStatus('TEST');
      }).toThrow();
    });

test('.changeStatus(): it should change status of the given cell',
    async () => {
      const cell = await Cell.create({x: 0, y: 0, bomb: false});
      const bombStatus = cell.changeStatus('QUESTION');

      expect(cell.status).toBe(cellStatuses.QUESTION);
      expect(bombStatus.isBomb).toBeFalsy();
      expect(bombStatus.bombsInNeighborhood).toBeFalsy();
    });

test('.changeStatus(): it should change status of the given cell',
    async () => {
      const cell = await Cell.create({x: 0, y: 0, bomb: true});
      const bombStatus = cell.changeStatus('QUESTION');

      expect(cell.status).toBe(cellStatuses.QUESTION);
      expect(bombStatus.isBomb).toBeTruthy();
      expect(bombStatus.bombsInNeighborhood).toBeFalsy();
    });

test('.changeStatus(): it should change status of the given cell',
    async () => {
      const cell = await Cell.create({x: 0, y: 0, bomb: false});
      cell.bombCount = 5;
      const bombStatus = cell.changeStatus('QUESTION');

      expect(cell.status).toBe(cellStatuses.QUESTION);
      expect(bombStatus.isBomb).toBeFalsy();
      expect(bombStatus.bombsInNeighborhood).toBeTruthy();
    });

test('.changeStatus(): it should ignore if cell already revealed',
    async () => {
      const cell = await Cell.create({x: 0, y: 0, bomb: false});
      cell.status = cellStatuses.REVEALED;
      const bombStatus = cell.changeStatus('QUESTION');

      expect(cell.status).toBe(cellStatuses.REVEALED);
      expect(bombStatus.isBomb).toBeFalsy();
    });
