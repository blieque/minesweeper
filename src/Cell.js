import Point from './Point.js';

export default class Cell extends Point {
  constructor(board, x, y) {
    super(x, y);
    this._board = board;
    this.el = Cell.createElement();
    this.isMine = false;
    this.isRevealed = false;
    this.proximityCount = 0;
  }

  static createElement() {
    const elCell = document.createElement('div');
    elCell.classList.add('cell');

    return elCell;
  }

  set isRevealed(value) {
    this._isRevealed = value;
    this.updateClasses();
  }
  get isRevealed() {
    return this._isRevealed;
  }

  set isFlagged(value) {
    if (!this.isRevealed || !value) {
      this._isFlagged = value;
      this.updateClasses();
    }
  }
  get isFlagged() {
    return this._isFlagged;
  }

  set proximityCount(value) {
    this._proximityCount = value;
    this.el.innerText = this.isMine
      ? '💣'
      : this.proximityCount ? this.proximityCount : '';
  }
  get proximityCount() {
    return this._proximityCount;
  }

  get isTopLeftRevealed() {
    return this.areDeltasRevealed([
      { x: -1, y:  0 },
      { x: -1, y: -1 },
      { x:  0, y: -1 },
    ]);
  }

  get isTopRightRevealed() {
    return this.areDeltasRevealed([
      { x:  0, y: -1 },
      { x:  1, y: -1 },
      { x:  1, y:  0 },
    ]);
  }

  get isBottomRightRevealed() {
    return this.areDeltasRevealed([
      { x:  1, y:  0 },
      { x:  1, y:  1 },
      { x:  0, y:  1 },
    ]);
  }

  get isBottomLeftRevealed() {
    return this.areDeltasRevealed([
      { x:  0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
    ]);
  }

  get neighbors() {
    return this._board.getNeighbors(this);
  }

  *getFlood(preCondition = () => true, postCondition = () => true) {
    let wave = [this];
    let iterationCount = 0;

    const yielded = [];

    do {
      iterationCount += 1;

      wave = wave
        .filter(preCondition)
        .map(cell => cell.neighbors)
        .flatten()
        .unique()
        .filter(cell => !yielded.includes(cell))
        .filter(postCondition);

      yielded.push(...wave);

      yield wave;
    } while (wave.length > 0);

    return iterationCount;
  }

  /**
   * Returns true if none of the cells matched by given deltas are un-revealed.
   */
  areDeltasRevealed(deltas) {
    return this
      .resolveDeltas(deltas)
      .filter(cell => !cell.isRevealed)
      .length === 0;
  }

  reveal(propagate = false) {
    this.el.dispatchEvent(new Event('reveal'));

    if (this.isRevealed) {
      if (this.neighbors.filter(cell => cell.isFlagged).length === this.proximityCount) {
        this.neighbors.filter(cell => !cell.isRevealed).forEach(cell => cell.reveal(true));
      }
    } else if (!this.isFlagged) {
      this.isRevealed = true;

      if (this.isMine) {
        // Game over
        // gameOver(this);
        this.el.dispatchEvent(new Event('trip'));
      } else if (propagate && this.proximityCount === 0) {
        // The propagation algorithm is made a fair bit more complex by the desire to make the
        // operations animated. Without this requirement, it could likely be much more functional.
        const flood = this.getFlood(
          cell => cell.proximityCount === 0,
          cell => !cell.isRevealed,
        );

        let i = 0;
        for (let wave of flood) {
          setTimeout(
            () => {
              wave.forEach(cell => cell.reveal());
            },
            20 * i,
          );
          i += 1;
        }
      }
    }
  }

  updateClasses() {
    this.el.classList.toggle('cell--flagged', this.isFlagged);
    this.el.classList.toggle('cell--revealed', this.isRevealed);
    this.el.classList.toggle('cell--unrevealed', !this.isRevealed);

    // if (board) {
    //   this.el.classList.toggle('cell--top-left-revealed', this.isTopLeftRevealed);
    //   this.el.classList.toggle('cell--top-right-revealed', this.isTopRightRevealed);
    //   this.el.classList.toggle('cell--bottom-right-revealed', this.isBottomRightRevealed);
    //   this.el.classList.toggle('cell--bottom-left-revealed', this.isBottomLeftRevealed);
    // }
  }
}
