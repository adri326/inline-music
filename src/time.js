class Time {
  constructor(arr) {
    if (!Array.isArray(arr)) {
      if (typeof arr === "string") {
        arr = arr.split(".").map(Number);
        if (isNaN(arr.reduce((acc, act) => acc + act))) {
          throw new Error("Invalid time declaration: " + arr);
        }
      }
      else {
        throw new Error("Invalid time declaration: " + arr);
      }
    }
    this.raw = [...arr];
  }

  toBeats(glob) {
    // TODO: make this better
    return this.raw.reduce((acc, act, i) => acc + act * 2 ** -i, 0);
  }

  toString() {
    if (this.raw.length == 0) return "0";
    else return this.raw.join(".");
  }

  mult(by) {
    let _time = new Time([]);
    _time.raw = this.raw.map((t) => t * by);
    return _time;
  }

  add(time) {
    if (!(time instanceof Time)) {
      time = new Time(time);
    }
    let _time = new Time(time.raw);
    this.raw.forEach((v, i) => _time.raw[i] = (_time.raw[i] || 0) + v);
    return _time;
  }

  isNull() {
    return !this.raw.reduce((acc, act) => acc + act);
  }
}

module.exports = Time;
