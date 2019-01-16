// :O
Array.prototype.unique = function() {
  const out = [];

  this.forEach((element) => {
    if (!out.includes(element)) out.push(element);
  });

  return out;
};

// :O
Array.prototype.flatten = function() {
  return [].concat(...this);
};

import { WIDTH, HEIGHT } from './config.js';

import Board from './Board.js';

// Globals
const el = {};
const board = new Board(document.querySelector('.board'), WIDTH, HEIGHT);

const revealTargetCell = (event) => {
  event.stopPropagation();

  if (event.altKey || event.ctrlKey || event.shiftKey) {
    toggleFlagOnTargetCell(event);
  } else {
    board.cells[
      Array
        .from(event.originalTarget.parentNode.children)
        .indexOf(event.originalTarget)
    ].reveal(true);
  }
};

const toggleFlagOnTargetCell = (event) => {
  event.preventDefault();
  const target = board.cells[
    Array
      .from(event.originalTarget.parentNode.children)
      .indexOf(event.originalTarget)
  ];
  target.isFlagged = !target.isFlagged;
};

const appendCellElements = () => {
  const elViewRoot = document.querySelector('.board');

  elViewRoot.addEventListener('click', revealTargetCell);
  elViewRoot.addEventListener('contextmenu', toggleFlagOnTargetCell);
};

const gameOver = (revealedCell) => {
  el.board.classList.add('board--game-over');
  el.modal.style.display = '';
  el.modal.innerText = 'Game over!';
};

const init = () => {
  document.body.style.setProperty("--columns", WIDTH);
  document.body.style.setProperty("--rows", HEIGHT);

  board.el.addEventListener('gameover', gameOver);

  el.modal = document.querySelector('.modal');
  el.modal.style.display = 'none';

  el.board = document.querySelector('.board');

  appendCellElements();
  board.startGame();

  document.body.addEventListener('click', () => {
    board.startGame();
    el.modal.style.display = 'none';
  });
};

init();
