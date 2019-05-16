'use strict';

const Cell = require('../../src/minesweeper/cell');
const cellStatuses = Cell.cellStatuses;

test('.changeStatus(): it should throw when an invalid state given', () => {
  const position = {x: 0, y: 0};
  const cell = new Cell(false, position);

  expect(() => {
    cell.changeStatus('TEST');
  }).toThrow();
});

test('.changeStatus(): it should change status of the given cell', () => {
  const position = {x: 0, y: 0};
  const cell = new Cell(false, position);
  const bombStatus = cell.changeStatus('QUESTION');

  expect(cell.status).toBe(cellStatuses.QUESTION);
  expect(bombStatus.isBomb).toBeFalsy();
  expect(bombStatus.bombsInNeighborhood).toBeFalsy();
});

test('.changeStatus(): it should change status of the given cell', () => {
  const position = {x: 0, y: 0};
  const cell = new Cell(false, position);
  cell.bomb = true;
  const bombStatus = cell.changeStatus('QUESTION');

  expect(cell.status).toBe(cellStatuses.QUESTION);
  expect(bombStatus.isBomb).toBeTruthy();
  expect(bombStatus.bombsInNeighborhood).toBeFalsy();
});

test('.changeStatus(): it should change status of the given cell', () => {
  const cell = new Cell(false, {x: 0, y: 0});
  cell.bombCount = 5;
  const bombStatus = cell.changeStatus('QUESTION');

  expect(cell.status).toBe(cellStatuses.QUESTION);
  expect(bombStatus.isBomb).toBeFalsy();
  expect(bombStatus.bombsInNeighborhood).toBeTruthy();
});

test('.changeStatus(): it should ignore if cell already revealed', () => {
  const position = {x: 0, y: 0};
  const cell = new Cell(false, position);
  cell.status = cellStatuses.REVEALED;
  const bombStatus = cell.changeStatus('QUESTION');

  expect(cell.status).toBe(cellStatuses.REVEALED);
  expect(bombStatus.isBomb).toBeFalsy();
});
