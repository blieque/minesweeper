export default class Point {
  constructor(x, y) {
    if (typeof x === 'object') {
      x = x.x;
      y = x.y;
    }

    if (
      typeof x === 'number' &&
      typeof y === 'number'
    ) {
      this.x = x;
      this.y = y;
    } else {
      throw new Error('Invalid constructor argument(s).');
    }
  }
}
