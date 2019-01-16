import { MINE_RATIO } from './config.js';

import Cell from './Cell.js';
import Point from './Point.js';

export default class Board {
  constructor(el, width, height) {
    this.el = el;
    this.width = width;
    this.height = height;
    this.fresh = true;

    this.cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = new Cell(this, x, y);
        this.cells.push(cell);
        this.el.appendChild(cell.el);
        cell.el.addEventListener('trip', () => { this.endGame(cell) });
        cell.el.addEventListener('reveal', () => {
          if (this.fresh) {
            this.fresh = false;
            this.createDistribution([cell, ...cell.neighbors]);
          }
        });
      }
    }
  }

  contains(point) {
    return (
      point.x >= 0 &&
      point.x < this.width &&
      point.y >= 0 &&
      point.y < this.height
    );
  }

  getCell(point) {
    return this.contains(point)
      ? this.cells[point.y * this.width + point.x]
      : null;
  }

  getNeighbors(cell) {
    return this.resolveDeltas(
      cell,
      [
        // They're vectors really, but hey.
        new Point( 0,  1),
        new Point( 1,  1),
        new Point( 1,  0),
        new Point( 1, -1),
        new Point( 0, -1),
        new Point(-1, -1),
        new Point(-1,  0),
        new Point(-1,  1),
      ],
    );
  }

  resolveDeltas(origin, deltas) {
    return deltas.reduce((results, delta) => {
      const newPoint = new Point(
        origin.x + delta.x,
        origin.y + delta.y,
      );

      if (this.contains(newPoint)) {
        results.push(this.getCell(newPoint));
      }

      return results;
    }, []);
  }

  createDistribution(excludes = []) {
    this.cells.forEach(cell => cell.isMine = false);

    const cellsCopy = this.cells.slice();
    excludes.forEach(cell => cellsCopy.splice(cellsCopy.indexOf(cell), 1));

    for (let i = 0; i < Math.round(this.cells.length * MINE_RATIO); i++) {
      const index = Math.floor(Math.random() * cellsCopy.length);
      cellsCopy[index].isMine = true;
      cellsCopy.splice(index, 1);
    }

    this.cells.forEach(cell => cell.updateClasses());

    this.updateProximityCounts();
  }

  updateProximityCounts() {
    this.cells.forEach((cell, i) => {
      cell.proximityCount = this.getNeighbors(cell).reduce((sum, neighbor) => {
        return sum + (neighbor.isMine ? 1 : 0);
      }, 0);
    });
  }

  startGame() {
    this.cells.forEach(cell => cell.isRevealed = false);
    this.cells.forEach(cell => cell.isFlagged = false);

    // this.createDistribution();
    this.fresh = true;

    this.el.classList.remove('board--game-over');
    this.el.dispatchEvent(new Event('gamestart'));
  }

  endGame(revealedCell) {
    let i = 0;
    for (let wave of revealedCell.getFlood()) {
      setTimeout(
        () => {
          wave
            .filter(cell => cell.isMine)
            .forEach((cell) => {
              cell.reveal();
              cell.el.innerText = '💥';
            });
        },
        40 * i,
      );
      i += 1;
    }

    this.el.classList.add('board--game-over');
    this.el.dispatchEvent(new Event('gameover'));
  }
}
